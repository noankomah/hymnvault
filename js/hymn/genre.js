// ── DATA ────────────────────────────────────────────────

let genreData = {};
window.currentHymns = [];
window.currentGenre = '';

const MAX_LANGUAGES_VISIBLE = 3;


// ── LOAD CSV ─────────────────────────────────────────────

async function loadGenres() {

  const res  = await fetch('./resources/genre_list.csv');
  const text = await res.text();

  const rows    = text.trim().split('\n');
  const headers = rows[0].split(',').map(h => h.trim().toLowerCase());

  headers.forEach(h => genreData[h] = []);

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].split(',');
    cells.forEach((cell, j) => {
      const key   = headers[j];
      if (!key) return;
      const value = cell.trim();
      if (value) genreData[key].push(value);
    });
  }

  buildLanguageButtons(headers);
}


// ── BUILD LANGUAGE BAR ───────────────────────────────────

function buildLanguageButtons(headers) {

  const bar = document.getElementById('middle');
  bar.innerHTML = '';

  headers.forEach((lang, i) => {

    const btn = document.createElement('button');

    btn.textContent       = lang.toUpperCase();
    btn.dataset.language  = lang.toLowerCase();

    if (i >= MAX_LANGUAGES_VISIBLE) btn.style.display = 'none';

    if (i === 0) {
      btn.classList.add('active');
      langPanel.dataset.activeLang = lang.toLowerCase();
      showGenrePanel(lang.toLowerCase());
    }

    bar.appendChild(btn);
  });
}


// ── SHOW GENRES ──────────────────────────────────────────

function showGenrePanel(language) {

  const key = (language || '').toLowerCase();

  const langPanel = document.getElementById('langPanel');
  const title     = document.getElementById('langPanelTitle');
  const list      = document.getElementById('genreList');

  const data = genreData[key];

  if (!Array.isArray(data)) {
    console.error('Missing genre data for:', key);
    list.innerHTML = '<p>No genres found</p>';
    return;
  }

  title.textContent = language.toUpperCase();
  list.innerHTML    = '';

  data.forEach((genre, i) => {

    const btn = document.createElement('button');
    btn.textContent = genre;

    if (i === 0) {
      btn.classList.add('active');
      loadHymnList(genre);
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();

      list.querySelectorAll('button')
        .forEach(b => b.classList.remove('active'));

      btn.classList.add('active');
      loadHymnList(genre);
    });

    list.appendChild(btn);
  });

  document.body.classList.add('genre-open');
  langPanel.classList.remove('hidden');
}


// ── LOAD HYMNS ───────────────────────────────────────────

async function loadHymnList(genre) {

  const main = document.querySelector('main');
  main.innerHTML = '<p class="loading">Loading...</p>';

  try {

    const file = genre.toLowerCase().replace(/\s+/g, '_') + '_list.csv';
    const res  = await fetch(`./resources/${file}`);
    const text = await res.text();

    const rows  = text.trim().split('\n');
    const hymns = rows.slice(1).map(r => {
      const last = r.lastIndexOf(',');
      return {
        title:  r.slice(0, last).trim(),
        number: r.slice(last + 1).trim()
      };
    });

    renderHymnList(hymns, genre);

  } catch (e) {
    main.innerHTML = '<p class="error">Could not load hymns</p>';
    console.error(e);
  }
}

function renderHymnList(hymns, genre) {

  window.currentHymns = hymns;
  window.currentGenre = genre;


  document.body.classList.add('hymn-list-view');
  document.body.classList.remove('lyrics-view');

  const main = document.querySelector('main');
  main.innerHTML = '';

  const ul = document.createElement('ul');
  ul.className = 'hymn-list';

  hymns.forEach(h => {

    const li = document.createElement('li');
    li.className = 'hymn-item';

    li.innerHTML = `
      <span class="hymn-number">${h.number}</span>
      <span class="hymn-title">${h.title}</span>
    `;

    li.addEventListener('click', () => {
      const lang = document.getElementById('langPanel').dataset.activeLang;
      openLyrics(genre, h.number, h.title, lang);
    });

    ul.appendChild(li);
  });

  main.appendChild(ul);

  if (typeof onHymnsLoaded === 'function') {
    onHymnsLoaded(hymns, genre);
  }
}


// ── INIT ────────────────────────────────────────────────

loadGenres();