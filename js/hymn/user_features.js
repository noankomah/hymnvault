// ── STORAGE KEYS ─────────────────────────────────────────

const FAVS_KEY   = 'hymn-favourites';
const SLIST_KEY  = 'hymn-singlist';
const RECENT_KEY = 'hymn-recently-viewed';
const RECENT_MAX = 20;


// ── STORAGE HELPERS ───────────────────────────────────────

function getFavourites()         { return JSON.parse(localStorage.getItem(FAVS_KEY)   || '[]'); }
function saveFavourites(list)    { localStorage.setItem(FAVS_KEY,   JSON.stringify(list)); }
function getSinglist()           { return JSON.parse(localStorage.getItem(SLIST_KEY)  || '[]'); }
function saveSinglist(list)      { localStorage.setItem(SLIST_KEY,  JSON.stringify(list)); }

function isFavourite(genre, number) {
  return getFavourites().some(h => h.genre === genre && h.number === String(number));
}

function inSinglist(genre, number) {
  return getSinglist().some(h => h.genre === genre && h.number === String(number));
}

function toggleFavourite(genre, number, title, language) {
  let list = getFavourites();
  const idx = list.findIndex(h => h.genre === genre && h.number === String(number));
  if (idx > -1) { list.splice(idx, 1); } else { list.unshift({ genre, number: String(number), title, language }); }
  saveFavourites(list);
  return idx === -1;
}

function toggleSinglist(genre, number, title, language) {
  let list = getSinglist();
  const idx = list.findIndex(h => h.genre === genre && h.number === String(number));
  if (idx > -1) { list.splice(idx, 1); } else { list.push({ genre, number: String(number), title, language }); }
  saveSinglist(list);
  return idx === -1;
}


// ── RECENTLY VIEWED ───────────────────────────────────────

function trackRecentlyViewed(genre, number, title, language) {
  let list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  list = list.filter(h => !(h.genre === genre && h.number === String(number)));
  list.unshift({ genre, number: String(number), title, language });
  if (list.length > RECENT_MAX) list = list.slice(0, RECENT_MAX);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}

function showRecentlyViewed() {
  const list = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  openSimplePanel('Recently Viewed', list, 'Nothing viewed yet.');
}


// ── LANG PANEL SAVE/RESTORE ───────────────────────────────
// When a fullscreen feature opens it hides the genre bar.
// These helpers save and restore its state cleanly.

function hideLangPanel() {
  const lp = document.getElementById('langPanel');
  const wasVisible  = !lp.classList.contains('hidden');
  const wasGenreOpen = document.body.classList.contains('genre-open');
  lp.classList.add('hidden');
  document.body.classList.remove('genre-open');
  return { wasVisible, wasGenreOpen };
}

function restoreLangPanel({ wasVisible, wasGenreOpen }) {
  const lp = document.getElementById('langPanel');
  if (wasVisible)   lp.classList.remove('hidden');
  if (wasGenreOpen) document.body.classList.add('genre-open');
}


// ── FAVOURITES — FULLSCREEN ───────────────────────────────

function showFavourites() {
  const savedState = hideLangPanel();
  const favs       = getFavourites();
  const genres     = [...new Set(favs.map(h => h.genre))];

  // Build panel
  const panel = document.createElement('div');
  panel.id    = 'favsPanel';
  panel.className = 'feature-fullscreen';

  panel.innerHTML = `
    <div class="feature-bar" id="favsBar">
      <span class="feature-bar-label">♥ Favourites</span>
      ${genres.map((g, i) => `
        <button class="feature-bar-tab${i === 0 ? ' active' : ''}"
                data-genre="${g}">${g}</button>
      `).join('')}
      <button class="feature-bar-close" id="favsClose">✕</button>
    </div>
    <div class="feature-content" id="favsContent"></div>
  `;

  document.body.appendChild(panel);
  requestAnimationFrame(() => panel.classList.add('show'));

  function close() {
    panel.classList.remove('show');
    setTimeout(() => { panel.remove(); restoreLangPanel(savedState); }, 260);
  }

  document.getElementById('favsClose').addEventListener('click', close);

  // Show first genre or empty state
  if (genres.length === 0) {
    document.getElementById('favsContent').innerHTML =
      '<p class="feature-empty">No favourites yet — open a hymn and tap the heart.</p>';
    return;
  }

  renderFavsForGenre(genres[0], favs, close);

  // Genre tab switching
  panel.querySelectorAll('.feature-bar-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      panel.querySelectorAll('.feature-bar-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderFavsForGenre(tab.dataset.genre, favs, close);
    });
  });
}

function renderFavsForGenre(genre, favs, closePanel) {
  const content = document.getElementById('favsContent');
  const items   = favs.filter(h => h.genre === genre);

  if (items.length === 0) {
    content.innerHTML = '<p class="feature-empty">No favourites in this genre.</p>';
    return;
  }

  content.innerHTML = `
    <ul class="hymn-list">
      ${items.map(h => `
        <li class="hymn-item"
            data-genre="${h.genre}"
            data-num="${h.number}"
            data-language="${h.language || 'English'}">
          <span class="hymn-number">${h.number}</span>
          <span class="hymn-title">${h.title}</span>
        </li>
      `).join('')}
    </ul>
  `;

  content.querySelectorAll('.hymn-item').forEach(item => {
    item.addEventListener('click', () => {
      closePanel();
      setTimeout(() => {
        openLyrics(
          item.dataset.genre,
          item.dataset.num,
          item.querySelector('.hymn-title').textContent,
          item.dataset.language
        );
      }, 280);
    });
  });
}


// ── SINGLIST — FULLSCREEN WITH DRAG ──────────────────────

function showSinglist() {
  const savedState = hideLangPanel();

  const panel = document.createElement('div');
  panel.id    = 'slistPanel';
  panel.className = 'feature-fullscreen';

  panel.innerHTML = `
    <div class="feature-bar">
      <span class="feature-bar-label">♪ Singlist</span>
      <div class="feature-bar-right">
        <button class="feature-bar-clear" id="slistClear">Clear all</button>
        <button class="feature-bar-close" id="slistClose">✕</button>
      </div>
    </div>
    <div class="feature-content" id="slistContent"></div>
  `;

  document.body.appendChild(panel);
  requestAnimationFrame(() => panel.classList.add('show'));

  function close() {
    panel.classList.remove('show');
    setTimeout(() => { panel.remove(); restoreLangPanel(savedState); }, 260);
  }

  document.getElementById('slistClose').addEventListener('click', close);

  document.getElementById('slistClear').addEventListener('click', () => {
    if (confirm('Clear your entire singlist?')) {
      saveSinglist([]);
      close();
    }
  });

  renderSinglist(close);
}

function renderSinglist(closePanel) {
  const content = document.getElementById('slistContent');
  const list    = getSinglist();

  if (list.length === 0) {
    content.innerHTML = '<p class="feature-empty">Your singlist is empty — add hymns while reading.</p>';
    return;
  }

  content.innerHTML = `
    <ul class="slist-list" id="slistList">
      ${list.map(h => `
        <li class="slist-item"
            data-genre="${h.genre}"
            data-num="${h.number}"
            data-language="${h.language || 'English'}">
          <span class="slist-num">${h.number}</span>
          <span class="slist-title">${h.title}</span>
          <button class="slist-remove" aria-label="Remove">✕</button>
        </li>
      `).join('')}
    </ul>
    <p class="slist-hint">Hold and drag to reorder</p>
  `;

  // Click to open hymn
  content.querySelectorAll('.slist-item').forEach(item => {
    item.addEventListener('click', e => {
      if (e.target.classList.contains('slist-remove')) return;
      closePanel();
      setTimeout(() => {
        openLyrics(
          item.dataset.genre,
          item.dataset.num,
          item.querySelector('.slist-title').textContent,
          item.dataset.language
        );
      }, 280);
    });
  });

  // Remove individual item
  content.querySelectorAll('.slist-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const item  = btn.closest('.slist-item');
      const num   = item.dataset.num;
      const genre = item.dataset.genre;
      let saved   = getSinglist();
      saved = saved.filter(h => !(h.genre === genre && h.number === num));
      saveSinglist(saved);
      item.remove();
      if (document.querySelectorAll('.slist-item').length === 0) {
        content.innerHTML = '<p class="feature-empty">Your singlist is empty.</p>';
      }
    });
  });

  initDragToReorder(document.getElementById('slistList'));
}


// ── DRAG TO REORDER ───────────────────────────────────────
// Touch anywhere on an item to drag it up or down.
// Items in the DOM shift as your finger moves — commit on release.

function initDragToReorder(listEl) {
  let dragging = null;
  let ghost    = null;
  let offsetY  = 0;

  function getY(e) {
    return e.touches ? e.touches[0].clientY : e.clientY;
  }

  function getItemAtY(y) {
    const items = [...listEl.querySelectorAll('.slist-item:not(.is-dragging)')];
    for (const item of items) {
      const rect = item.getBoundingClientRect();
      if (y < rect.top + rect.height / 2) return item;
    }
    return null;
  }

  function startDrag(e, item) {
    if (e.target.classList.contains('slist-remove')) return;
    if (e.cancelable) e.preventDefault();

    dragging = item;
    const rect = item.getBoundingClientRect();
    offsetY = getY(e) - rect.top;

    ghost = item.cloneNode(true);
    ghost.className = 'slist-item slist-ghost';
    ghost.style.width  = rect.width  + 'px';
    ghost.style.height = rect.height + 'px';
    ghost.style.top    = rect.top    + 'px';
    ghost.style.left   = rect.left   + 'px';
    document.body.appendChild(ghost);

    item.classList.add('is-dragging');
  }

  function moveDrag(e) {
    if (!dragging || !ghost) return;
    if (e.cancelable) e.preventDefault();

    const y = getY(e);
    ghost.style.top = (y - offsetY) + 'px';

    const target = getItemAtY(y);
    if (target && target !== dragging) {
      listEl.insertBefore(dragging, target);
    } else if (!target) {
      listEl.appendChild(dragging);
    }
  }

  function endDrag() {
    if (!dragging) return;

    ghost?.remove();
    ghost = null;
    dragging.classList.remove('is-dragging');

    const newOrder = [...listEl.querySelectorAll('.slist-item')].map(item => ({
      genre:    item.dataset.genre,
      number:   item.dataset.num,
      title:    item.querySelector('.slist-title').textContent,
      language: item.dataset.language
    }));

    saveSinglist(newOrder);
    dragging = null;
  }

  // Touch
  listEl.addEventListener('touchstart',    e => startDrag(e, e.target.closest('.slist-item')), { passive: false });
  document.addEventListener('touchmove',   moveDrag, { passive: false });
  document.addEventListener('touchend',    endDrag,  { passive: true });
  document.addEventListener('touchcancel', endDrag,  { passive: true });

  // Mouse
  listEl.addEventListener('mousedown', e => {
    const item = e.target.closest('.slist-item');
    if (item) startDrag(e, item);
  });
  document.addEventListener('mousemove', moveDrag);
  document.addEventListener('mouseup',   endDrag);
}


// ── SIMPLE PANEL (recently viewed) ───────────────────────

function openSimplePanel(title, hymns, emptyMsg) {
  document.getElementById('simplePanel')?.remove();
  document.getElementById('simpleOverlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'simpleOverlay';
  overlay.className = 'feature-overlay';

  const panel = document.createElement('div');
  panel.id = 'simplePanel';
  panel.className = 'feature-panel';

  panel.innerHTML = `
    <div class="feature-header">
      <h2 class="feature-panel-title">${title}</h2>
      <button class="feature-close-btn">✕</button>
    </div>
    <div class="feature-body">
      ${hymns.length === 0
        ? `<p class="feature-empty">${emptyMsg}</p>`
        : `<ul class="feature-list">
            ${hymns.map(h => `
              <li class="feature-item"
                  data-genre="${h.genre}"
                  data-num="${h.number}"
                  data-language="${h.language || 'English'}">
                <span class="feature-num">${h.number}</span>
                <span class="feature-title">${h.title}</span>
              </li>
            `).join('')}
           </ul>`
      }
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(panel);
  requestAnimationFrame(() => { overlay.classList.add('show'); panel.classList.add('show'); });

  function close() {
    overlay.classList.remove('show'); panel.classList.remove('show');
    setTimeout(() => { overlay.remove(); panel.remove(); }, 280);
  }

  overlay.addEventListener('click', close);
  panel.querySelector('.feature-close-btn').addEventListener('click', close);

  panel.querySelectorAll('.feature-item').forEach(item => {
    item.addEventListener('click', () => {
      close();
      setTimeout(() => openLyrics(
        item.dataset.genre, item.dataset.num,
        item.querySelector('.feature-title').textContent,
        item.dataset.language
      ), 280);
    });
  });
}

function injectLyricsActions(genre, number, title, language) {
  const view = document.querySelector('main .lyrics-view');
  if (!view) return;

  document.querySelector('.lyrics-actions')?.remove();

  const row = document.createElement('div');
  row.className = 'lyrics-actions';

  const fav   = isFavourite(genre, number);
  const slist = inSinglist(genre, number);

  row.innerHTML = `
    <button class="action-btn fav-btn${fav ? ' active' : ''}" id="favBtn">
      ${fav ? '♥' : '♡'} Favourite
    </button>

    <button class="action-btn slist-btn${slist ? ' active' : ''}" id="slistBtn">
      ${slist ? '✓ In Singlist' : '♪ Singlist'}
    </button>
  `;

  const header = view.querySelector('.lyrics-header');

  if (header && header.parentNode === view) {
    view.insertBefore(row, header);
  } else {
    view.appendChild(row);
  }

  document.getElementById('favBtn')?.addEventListener('click', function () {
    const added = toggleFavourite(genre, number, title, language);
    this.classList.toggle('active', added);
    this.innerHTML = added ? '♥ Favourite' : '♡ Favourite';
  });

  document.getElementById('slistBtn')?.addEventListener('click', function () {
    const added = toggleSinglist(genre, number, title, language);
    this.classList.toggle('active', added);
    this.innerHTML = added ? '✓ In Singlist' : '♪ Singlist';
  });
}


// ── WIRE MENU ITEMS ───────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const map = {
    'favourites':      showFavourites,
    'singlist':        showSinglist,
    'recently-viewed': showRecentlyViewed,
  };
  Object.entries(map).forEach(([key, fn]) => {
    document.querySelector(`[data-action="${key}"]`)
      ?.addEventListener('click', fn);
  });
});