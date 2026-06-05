// ── LYRICS ──────────────────────────────────────────────

const lyricsCache = {};

function getTitleKey(language) {
  const map = {
    'Twi':     'twi_title',
    'Dangme':  'dangme_title',
    'English': 'english_title',
  };
  return map[language] || 'english_title';
}

async function loadLyricsFile(genre) {
  if (lyricsCache[genre]) return lyricsCache[genre];

  const fileName = genre.toLowerCase().replace(/\s+/g, '_') + '_lyrics.json';

  try {
    const response = await fetch(`./resources/${fileName}`);
    if (!response.ok) return null;
    const data = await response.json();
    lyricsCache[genre] = data;
    return data;
  } catch {
    return null;
  }
}

async function openLyrics(genre, hymnNumber, hymnTitle, language) {
 
  const main = document.querySelector('main');
  main.innerHTML = '<p class="loading">Loading...</p>';

  

  trackRecentlyViewed(genre, hymnNumber, hymnTitle, language);

  const lyricsData = await loadLyricsFile(genre);
  const entry = lyricsData ? lyricsData[String(hymnNumber)] : null;

  if (!entry) {
    renderNoLyrics(hymnNumber, hymnTitle, genre, language);
    return;
  }

  renderLyrics(entry, hymnNumber, language, genre);
  document.body.classList.remove('hymn-list-view');
  document.body.classList.add('lyrics-mode');
}

// ── FONT SIZE STEPPER ────────────────────────────────────

const FONT_STEP_KEY = 'hymn-font-step';
const FONT_DEFAULT  = 17;
const FONT_STEP     = 3;

const FONT_STEPS = [
  FONT_DEFAULT - FONT_STEP,
  FONT_DEFAULT,
  FONT_DEFAULT + FONT_STEP,
  FONT_DEFAULT + (FONT_STEP * 2),
];

function getSavedStep() {
  const saved = parseInt(localStorage.getItem(FONT_STEP_KEY));
  return isNaN(saved) ? 1 : Math.max(0, Math.min(FONT_STEPS.length - 1, saved));
}

function applyFontSize(stepIndex) {
  const px = FONT_STEPS[stepIndex];
  document.querySelectorAll('.block-text').forEach(el => {
    el.style.fontSize = px + 'px';
  });
}

function buildStepperHTML(activeIndex) {
  let nodes = '';
  FONT_STEPS.forEach((_, i) => {
    nodes += `<button class="stepper-node${i === activeIndex ? ' active' : ''}"
                      data-index="${i}"
                      aria-label="Font size ${i + 1}"></button>`;
    if (i < FONT_STEPS.length - 1) {
      nodes += `<div class="stepper-line${i < activeIndex ? ' filled' : ''}"></div>`;
    }
  });

  return `
    <div class="font-stepper">
      <span class="stepper-a stepper-a--small">A</span>
      <div class="stepper-track">${nodes}</div>
      <span class="stepper-a stepper-a--large">A</span>
    </div>
  `;
}

function initStepper() {
  let current = getSavedStep();
  applyFontSize(current);

  document.querySelectorAll('.stepper-node').forEach(node => {
    node.addEventListener('click', () => {
      current = parseInt(node.dataset.index);

      document.querySelectorAll('.stepper-node').forEach((n, i) => {
        n.classList.toggle('active', i === current);
      });

      document.querySelectorAll('.stepper-line').forEach((line, i) => {
        line.classList.toggle('filled', i < current);
      });

      applyFontSize(current);
      localStorage.setItem(FONT_STEP_KEY, current);
    });
  });
}


// ── RENDER: no lyrics available ───────────────────────────

function renderNoLyrics(hymnNumber, hymnTitle, genre, language) {
  const main = document.querySelector('main');

  main.innerHTML = `
    <div class="lyrics-view">
      <div class="lyrics-top-bar">
        <button class="lyrics-back-btn">← Back</button>
        ${buildStepperHTML(getSavedStep())}
      </div>
      <div class="lyrics-header">
        <span class="lyrics-num">${hymnNumber}</span>
        <h2 class="lyrics-title">${hymnTitle}</h2>
      </div>
      <p class="lyrics-unavailable">Lyrics not yet available</p>
    </div>
  `;

  bindBackButton();
  initStepper();
  injectLyricsActions(genre, hymnNumber, hymnTitle, language);
}


// ── RENDER: full lyrics ───────────────────────────────────

function renderLyrics(entry, hymnNumber, language, genre) {
  const main     = document.querySelector('main');
  const titleKey = getTitleKey(language);
  const title    = entry[titleKey]
                || entry.twi_title
                || entry.dangme_title
                || entry.english_title
                || '';

  let html = `
    <div class="lyrics-view">
      <div class="lyrics-top-bar">
        <button class="lyrics-back-btn">← Back</button>
        ${buildStepperHTML(getSavedStep())}
      </div>
      <div class="lyrics-header">
        <span class="lyrics-num">${hymnNumber}</span>
        <h2 class="lyrics-title">${title}</h2>
      </div>
  `;

  if (entry.verses && entry.verses.length > 0) {
    entry.verses.forEach(verse => {
      html += `
        <div class="lyrics-block lyrics-verse">
          <span class="block-label">Verse ${verse.number}</span>
          <p class="block-text">${verse.text.replace(/\n/g, '<br>')}</p>
        </div>
      `;

      if (entry.chorus) {
        html += `
          <div class="lyrics-block lyrics-chorus">
            <span class="block-label">Chorus</span>
            <p class="block-text">${entry.chorus.replace(/\n/g, '<br>')}</p>
          </div>
        `;
      }
    });
  }

  if (entry.parts && Object.keys(entry.parts).length > 0) {
    Object.entries(entry.parts).forEach(([partName, lines]) => {
      const text = Array.isArray(lines) ? lines.join('<br>') : lines;
      html += `
        <div class="lyrics-block lyrics-part">
          <span class="block-label">${partName}</span>
          <p class="block-text">${text}</p>
        </div>
      `;
    });
  }

  html += `</div>`;
  main.innerHTML = html;

  bindBackButton();
  initStepper();
  injectLyricsActions(genre, hymnNumber, title, language);
  injectNavArrows(genre, hymnNumber, language);

  requestAnimationFrame(() => {
    document.querySelectorAll('.lyrics-block').forEach((el, i) => {
      el.style.animationDelay = `${i * 0.07}s`;
      el.classList.add('fade-in');
    });
  });
}


// ── BACK BUTTON ───────────────────────────────────────────

// ── BACK BUTTON ───────────────────────────────────────────

function bindBackButton() {
  const backBtn = document.querySelector('.lyrics-back-btn');
  if (!backBtn) return;

  backBtn.addEventListener('click', () => {
    removeNavArrows();

    document.body.classList.add('hymn-list-view');

    const activeGenreBtn = document.querySelector('#genreList button.active');

    if (activeGenreBtn) {
      loadHymnList(activeGenreBtn.textContent);
    }

    setTimeout(() => {
      removeNavArrows();
    }, 0);
  });
}
