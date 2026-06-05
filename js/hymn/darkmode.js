// ── DARK MODE ─────────────────────────────────────────────

const darkToggle  = document.getElementById('darkToggle');
const DARK_KEY    = 'hymn-dark-mode';

// ── Apply ─────────────────────────────────────────────────

function applyDark(isDark) {
  document.body.classList.toggle('dark', isDark);
  darkToggle.checked = isDark;
}

// ── Time-based default ────────────────────────────────────
// Dark between 6pm (18:00) and 6am (06:00)

function isNightTime() {
  const hour = new Date().getHours();
  return hour >= 18 || hour < 6;
}

// ── Init ──────────────────────────────────────────────────
// Priority: saved preference → time of day

function initDarkMode() {
  const saved = localStorage.getItem(DARK_KEY);

  if (saved !== null) {
    applyDark(saved === 'true');   // user has made a choice before
  } else {
    applyDark(isNightTime());      // first visit — use the clock
  }
}

// ── Toggle ────────────────────────────────────────────────
// User action saves to localStorage, clock no longer decides for them

darkToggle.addEventListener('change', () => {
  const isDark = darkToggle.checked;
  applyDark(isDark);
  localStorage.setItem(DARK_KEY, isDark);
});

initDarkMode();