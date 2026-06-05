// ── STATE ────────────────────────────────────────────────

let appLaunched = false;

function markLaunched() { appLaunched = true; }
function hasLaunched()  { return appLaunched; }


// ── INSTRUCTION ──────────────────────────────────────────

function showInstruction() {
  if (hasLaunched()) return;
  document.getElementById('instructionOverlay').classList.remove('hidden');
  document.getElementById('instructionPanel').classList.remove('hidden');
}

function hideInstruction() {
  document.getElementById('instructionOverlay').classList.add('hidden');
  document.getElementById('instructionPanel').classList.add('hidden');
}


// ── HELPERS ──────────────────────────────────────────────

function closeFeaturePanels() {
  document.getElementById('favsPanel')?.remove();
  document.getElementById('slistPanel')?.remove();
}


// ── DOM ──────────────────────────────────────────────────

const menuPanel   = document.getElementById('menuPanel');
const menuOverlay = document.getElementById('menuOverlay');
const langPanel   = document.getElementById('langPanel');
const main        = document.querySelector('main');


// ── MENU ─────────────────────────────────────────────────

document.getElementById('menuBtn').addEventListener('click', (e) => {
  e.stopPropagation();

  const open = !menuPanel.classList.contains('hidden');

  if (open) {
    menuPanel.classList.add('hidden');
    menuOverlay.classList.add('hidden');
    main.classList.remove('menu-open');
  } else {
    markLaunched();
    hideInstruction();
    menuPanel.classList.remove('hidden');
    menuOverlay.classList.remove('hidden');
    main.classList.add('menu-open');
  }
});

menuPanel.addEventListener('click', (e) => e.stopPropagation());
langPanel.addEventListener('click', (e) => e.stopPropagation());


// ── LANGUAGE CLICKS (delegation — buttons are built async) ────

document.getElementById('middle').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;

  const lang = (btn.dataset.language || '').toLowerCase();
  if (!lang) return;

  markLaunched();
  hideInstruction();
  closeFeaturePanels();

  if (typeof removeNavArrows === 'function') removeNavArrows();

  menuPanel.classList.add('hidden');
  menuOverlay.classList.add('hidden');
  main.classList.remove('menu-open');

  main.innerHTML = '';

  document.querySelectorAll('#middle button')
    .forEach(b => b.classList.remove('active'));

  btn.classList.add('active');
  langPanel.dataset.activeLang = lang;

  if (typeof showGenrePanel === 'function') showGenrePanel(lang);
});




// ── MENU OVERLAY CLOSES MENU ──────────────────────────────

menuOverlay.addEventListener('click', () => {
  menuPanel.classList.add('hidden');
  menuOverlay.classList.add('hidden');
  main.classList.remove('menu-open');
  // click is swallowed here — hymns never see it
});


// ── SEARCH OVERLAY ────────────────────────────────────────

const searchOverlay = document.getElementById('searchOverlay');

searchOverlay.addEventListener('click', () => {
  document.getElementById('searchQuery').blur();
  searchOverlay.classList.add('hidden');
  // click is swallowed here — hymns never see it
});

document.getElementById('searchQuery').addEventListener('focus', () => {
  markLaunched();
  hideInstruction();
  searchOverlay.classList.remove('hidden');
});

document.getElementById('searchQuery').addEventListener('blur', () => {
  // small delay so clicking a search result still registers
  setTimeout(() => searchOverlay.classList.add('hidden'), 150);
});

// ── INIT ─────────────────────────────────────────────────

if (!hasLaunched()) showInstruction();
