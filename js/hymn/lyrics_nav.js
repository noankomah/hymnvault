// ── HYMN NAVIGATION ──────────────────────────────────────
// Previous / Next arrows move only to hymns with available lyrics.
// They skip hymn numbers that exist in the list but have no lyrics entry.

function getSortedHymns() {
  return [...window.currentHymns]
    .filter(h => h.number && h.title)
    .sort((a, b) => Number(a.number) - Number(b.number));
}

function hasLyricsEntry(entry) {
  if (!entry) return false;

  const hasVerses = Array.isArray(entry.verses) && entry.verses.length > 0;
  const hasChorus = typeof entry.chorus === 'string' && entry.chorus.trim() !== '';
  const hasParts  = entry.parts && Object.keys(entry.parts).length > 0;

  return hasVerses || hasChorus || hasParts;
}

async function findAvailableHymn(genre, currentNumber, direction) {
  const sorted = getSortedHymns();
  const currentNum = Number(currentNumber);

  const lyricsData = await loadLyricsFile(genre);
  if (!lyricsData) return null;

  let candidates;

  if (direction === 'prev') {
    candidates = sorted
      .filter(h => Number(h.number) < currentNum)
      .reverse();
  } else {
    candidates = sorted
      .filter(h => Number(h.number) > currentNum);
  }

  for (const hymn of candidates) {
    const entry = lyricsData[String(hymn.number)];

    if (hasLyricsEntry(entry)) {
      return hymn;
    }
  }

  return null;
}

function removeNavArrows() {
  document.getElementById('navPrev')?.remove();
  document.getElementById('navNext')?.remove();
}

async function injectNavArrows(genre, hymnNumber, language) {
  removeNavArrows();

  const prev = await findAvailableHymn(genre, hymnNumber, 'prev');
  const next = await findAvailableHymn(genre, hymnNumber, 'next');

  if (prev) {
    const btn = document.createElement('button');
    btn.id = 'navPrev';
    btn.className = 'nav-arrow nav-arrow--prev';
    btn.setAttribute('aria-label', 'Previous hymn');
    btn.innerHTML = '&#8249;';

    btn.addEventListener('click', () => {
      openLyrics(genre, prev.number, prev.title, language);
    });

    document.body.appendChild(btn);
  }

  if (next) {
    const btn = document.createElement('button');
    btn.id = 'navNext';
    btn.className = 'nav-arrow nav-arrow--next';
    btn.setAttribute('aria-label', 'Next hymn');
    btn.innerHTML = '&#8250;';

    btn.addEventListener('click', () => {
      openLyrics(genre, next.number, next.title, language);
    });

    document.body.appendChild(btn);
  }
}