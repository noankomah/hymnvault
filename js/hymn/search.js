// ── SEARCH STATE ─────────────────────────────────────────

let currentHymns = [];
let currentGenre = '';

function onHymnsLoaded(hymns, genre) {
  currentHymns = hymns;
  currentGenre = genre;
}


// ── LANGUAGE PREFIXES ─────────────────────────────────────

const PREFIX_MAP = {
  'a':  'all',
  'e':  'english',
  't':  'twi',
  'd':  'dangme',
  'g':  'ga',
  'ew': 'ewe',
  'f':  'french',
};

const LANG_TO_PREFIX = Object.fromEntries(
  Object.entries(PREFIX_MAP).map(([k, v]) => [v, k.toUpperCase()])
);


// ── SYNC PREFIX TO ACTIVE LANGUAGE ───────────────────────

function syncPrefixToLanguage(lang) {
  if (!lang) return;
  const prefix = LANG_TO_PREFIX[lang.toLowerCase()];
  if (prefix) prefixInput.value = prefix;
}


// ── SEARCH INDEX STORE ────────────────────────────────────

const searchIndexStore  = {};
const indexBuildPromise = {};


// ── NORMALIZE ─────────────────────────────────────────────

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[ɛε]/g, 'e')
    .replace(/ɔ/g, 'o');
}


// ── TITLE KEY ─────────────────────────────────────────────

function getTitleKey(language) {
  if (!language || language === 'all') return null;
  const map = {
    'english': 'english_title',
    'twi':     'twi_title',
    'dangme':  'dangme_title',
    'ga':      'ga_title',
    'ewe':     'ewe_title',
    'french':  'french_title',
  };
  return map[language.toLowerCase()] || 'english_title';
}


// ── TITLE SCORING ─────────────────────────────────────────

function titleScore(title, normQuery) {
  const queryWords = normQuery.trim().split(/\s+/).filter(Boolean);
  if (queryWords.length === 0) return Infinity;

  const titleWords = normalize(title).split(/\s+/);

  for (const qw of queryWords) {
    if (!titleWords.some(tw => tw.startsWith(qw))) return Infinity;
  }

  const firstQW = queryWords[0];
  for (let i = 0; i < titleWords.length; i++) {
    if (titleWords[i].startsWith(firstQW)) return i;
  }

  return Infinity;
}


// ── LYRICS SEARCH ─────────────────────────────────────────

function searchInLyrics(lyricsData, normQuery, titleKey) {
  const results = [];

  for (const [num, entry] of Object.entries(lyricsData)) {
    const parts = [];

    if (entry.verses) entry.verses.forEach(v => parts.push(v.text));
    if (entry.chorus) parts.push(entry.chorus);
    if (entry.parts) {
      Object.values(entry.parts).forEach(p => {
        parts.push(Array.isArray(p) ? p.join(' ') : p);
      });
    }

    const fullText = parts.join('\n');
    const normText = normalize(fullText);
    const idx      = normText.indexOf(normQuery);

    if (idx !== -1) {
      const snippet = buildSnippet(fullText, idx, normQuery.length);
      const title   =
        (titleKey && entry[titleKey]) ||
        entry.english_title           ||
        entry.twi_title               ||
        entry.dangme_title            ||
        '';

      results.push({ num, title, snippet });
    }
  }

  return results;
}

function buildSnippet(originalText, idx, queryLen) {
  const lineStart = originalText.lastIndexOf('\n', idx);
  const lineEnd   = originalText.indexOf('\n', idx + queryLen);

  const start = lineStart === -1 ? 0 : lineStart + 1;
  const end   = lineEnd   === -1 ? originalText.length : lineEnd;

  let line = originalText.slice(start, end).trim().replace(/\n/g, ' ');

  if (line.length > 65) {
    const matchInLine = idx - start;
    const s = Math.max(0, matchInLine - 18);
    const e = Math.min(line.length, matchInLine + queryLen + 30);
    line =
      (s > 0 ? '...' : '') +
      line.slice(s, e) +
      (e < line.length ? '...' : '');
  }

  return `"...${line}..."`;
}


// ── BUILD SEARCH INDEX ────────────────────────────────────

async function buildLanguageIndex(language) {
  const lang = language.toLowerCase();

  if (searchIndexStore[lang]) return;

  if (indexBuildPromise[lang]) {
    await indexBuildPromise[lang];
    return;
  }

  indexBuildPromise[lang] = (async () => {
    const genres = genreData[lang] || [];
    const index  = [];

    await Promise.all(genres.map(async genre => {
      const fileName = genre.toLowerCase().replace(/\s+/g, '_') + '_list.csv';

      try {
        const res = await fetch(`./resources/${fileName}`);
        if (!res.ok) return;

        const text = await res.text();
        const rows = text.trim().split('\n').slice(1);

        rows.forEach(row => {
          const lastComma = row.lastIndexOf(',');
          const title     = row.substring(0, lastComma).trim();
          const number    = row.substring(lastComma + 1).trim();
          if (title && number) index.push({ number, title, genre });
        });

      } catch {
        // skip unavailable files
      }
    }));

    searchIndexStore[lang] = index;
  })();

  await indexBuildPromise[lang];
}


// ── LIVE SEARCH ───────────────────────────────────────────

function liveSearch(rawQuery) {
  const query     = rawQuery.trim();
  const normQuery = normalize(query);

  if (!normQuery) {
    renderHymnList(currentHymns, currentGenre);
    return;
  }

  const titleMatches = currentHymns
    .map(h => ({ ...h, score: titleScore(h.title, normQuery) }))
    .filter(h => h.score < Infinity)
    .sort((a, b) =>
      a.score - b.score ||
      normalize(a.title).localeCompare(normalize(b.title))
    );

  let lyricsMatches = [];
  const lyricsData  = lyricsCache[currentGenre];

  if (lyricsData) {
    const titleKey    = getTitleKey(langPanel.dataset.activeLang);
    const titleNumSet = new Set(titleMatches.map(h => String(h.number)));

    lyricsMatches = searchInLyrics(lyricsData, normQuery, titleKey)
      .filter(r => !titleNumSet.has(String(r.num)));
  }

  renderResults(titleMatches, lyricsMatches, currentGenre, query);
}


// ── MAIN / PREFIX SEARCH ──────────────────────────────────

async function mainSearch(rawQuery) {
  const prefix   = prefixInput.value.toLowerCase().trim();
  const language = PREFIX_MAP[prefix];

  if (!language) return;

  const query     = rawQuery.trim();
  const normQuery = normalize(query);

  if (!normQuery) return;

  // ── ALL LANGUAGES ─────────────────────────────────────
  if (language === 'all') {
    const allLangs = Object.keys(genreData);

    await Promise.all(allLangs.map(lang => buildLanguageIndex(lang)));

    const index = allLangs.flatMap(lang => searchIndexStore[lang] || []);

    const titleMatches = index
      .map(h => ({ ...h, score: titleScore(h.title, normQuery) }))
      .filter(h => h.score < Infinity)
      .sort((a, b) =>
        a.score - b.score ||
        normalize(a.title).localeCompare(normalize(b.title))
      );

    let lyricsMatches = [];
    const titleNumSet = new Set(titleMatches.map(h => `${h.genre}:${h.number}`));

    for (const lang of allLangs) {
      const genres   = genreData[lang] || [];
      const titleKey = getTitleKey(lang);

      for (const genre of genres) {
        const lyricsData = lyricsCache[genre];
        if (!lyricsData) continue;

        const matches = searchInLyrics(lyricsData, normQuery, titleKey)
          .filter(r => !titleNumSet.has(`${genre}:${r.num}`))
          .map(r => ({ ...r, genre }));

        lyricsMatches.push(...matches);
      }
    }

    renderResults(titleMatches, lyricsMatches, null, query);
    return;
  }

  // ── SINGLE LANGUAGE ───────────────────────────────────
  await buildLanguageIndex(language);

  const index = searchIndexStore[language] || [];

  const titleMatches = index
    .map(h => ({ ...h, score: titleScore(h.title, normQuery) }))
    .filter(h => h.score < Infinity)
    .sort((a, b) =>
      a.score - b.score ||
      normalize(a.title).localeCompare(normalize(b.title))
    );

  let lyricsMatches = [];
  const titleKey    = getTitleKey(language);
  const titleNumSet = new Set(titleMatches.map(h => `${h.genre}:${h.number}`));
  const genres      = genreData[language] || [];

  for (const genre of genres) {
    const lyricsData = lyricsCache[genre];
    if (!lyricsData) continue;

    const matches = searchInLyrics(lyricsData, normQuery, titleKey)
      .filter(r => !titleNumSet.has(`${genre}:${r.num}`))
      .map(r => ({ ...r, genre }));

    lyricsMatches.push(...matches);
  }

  renderResults(titleMatches, lyricsMatches, null, query);
}


// ── RENDER RESULTS ────────────────────────────────────────

function renderResults(titleMatches, lyricsMatches, genre, query) {
  const main = document.querySelector('main');

  if (titleMatches.length === 0 && lyricsMatches.length === 0) {
    main.innerHTML = `<p class="loading">No results for <em>"${query}"</em></p>`;
    return;
  }

  let html = `<ul class="hymn-list search-results">`;

  titleMatches.forEach(h => {
    html += `
      <li class="hymn-item"
          data-num="${h.number}"
          data-genre="${h.genre || genre}">
        <span class="hymn-number">${h.number}</span>
        <span class="hymn-title">${h.title}</span>
      </li>
    `;
  });

  if (lyricsMatches.length > 0) {
    if (titleMatches.length > 0) {
      html += `<li class="search-section-label">Found in lyrics</li>`;
    }

    lyricsMatches.forEach(r => {
      html += `
        <li class="hymn-item hymn-item--has-snippet"
            data-num="${r.num}"
            data-genre="${r.genre || genre}">
          <span class="hymn-number">${r.num}</span>
          <span class="hymn-item-body">
            <span class="hymn-title">${r.title}</span>
            <span class="hymn-snippet">${r.snippet}</span>
          </span>
        </li>
      `;
    });
  }

  html += `</ul>`;
  main.innerHTML = html;

  main.querySelectorAll('.hymn-item').forEach(item => {
    item.addEventListener('click', () => {
      const num   = item.dataset.num;
      const g     = item.dataset.genre;
      const title = item.querySelector('.hymn-title').textContent;
      const lang  =
        langPanel.dataset.activeLang                          ||
        PREFIX_MAP[prefixInput.value.toLowerCase().trim()]    ||
        'english';

      openLyrics(g, num, title, lang);
    });
  });
}


// ── INPUT HANDLING ────────────────────────────────────────

const prefixInput = document.getElementById('searchPrefix');
const queryInput  = document.getElementById('searchQuery');
const closeBtn    = document.getElementById('closeSearch');

queryInput.addEventListener('focus', () => {
  markLaunched();
  hideInstruction();
});

prefixInput.addEventListener('focus', () => {
  markLaunched();
  hideInstruction();
});

prefixInput.addEventListener('keydown', e => {
  const allowed = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'];
  if (allowed.includes(e.key)) return;
  if (!/^[a-zA-Z]$/.test(e.key)) { e.preventDefault(); return; }

  const hasSelection = prefixInput.selectionStart !== prefixInput.selectionEnd;
  if (prefixInput.value.length >= 2 && !hasSelection) e.preventDefault();
});

prefixInput.addEventListener('input', () => {
  const val     = prefixInput.value.toLowerCase().trim();
  const isValid = !!PREFIX_MAP[val];

  prefixInput.classList.toggle('prefix-invalid', val.length > 0 && !isValid);
  prefixInput.classList.toggle('prefix-valid',   isValid);

  if (isValid && queryInput.value.trim()) handleSearch();
});

queryInput.addEventListener('input', () => {
  closeBtn.classList.toggle('hidden', queryInput.value.trim() === '');
  handleSearch();
});

closeBtn.addEventListener('click', () => {
  queryInput.value = '';
  closeBtn.classList.add('hidden');
  queryInput.focus();
  clearSearch();
});

prefixInput.addEventListener('keydown', e => {
  if (e.key === 'Tab' && !e.shiftKey) {
    e.preventDefault();
    queryInput.focus();
  }
});

document.getElementById('middle').addEventListener('click', e => {
  const btn = e.target.closest('button[data-language]');
  if (!btn) return;
  syncPrefixToLanguage(btn.dataset.language);
});


// ── ROUTE SEARCH ──────────────────────────────────────────

function handleSearch() {
  const query      = queryInput.value.trim();
  const prefix     = prefixInput.value.toLowerCase().trim();
  const prefixLang = PREFIX_MAP[prefix];
  const activeLang = langPanel.dataset.activeLang;

  if (!query) { clearSearch(); return; }

  if (prefixLang === activeLang && currentHymns.length > 0) {
    liveSearch(query);
  } else {
    mainSearch(query);
  }
}

function clearSearch() {
  if (currentHymns.length > 0) {
    renderHymnList(currentHymns, currentGenre);
  } else {
    document.querySelector('main').innerHTML = '';
  }
}