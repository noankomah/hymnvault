// ── STATIC PAGES ─────────────────────────────────────────
// One generic overlay, each page just passes its content.
// No complex logic — open, read, close.

function openStaticPage(title, contentHTML) {
  document.getElementById('staticOverlay')?.remove();
  document.getElementById('staticPanel')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'staticOverlay';
  overlay.className = 'static-overlay';

  const panel = document.createElement('div');
  panel.id = 'staticPanel';
  panel.className = 'static-panel';

  panel.innerHTML = `
    <div class="static-header">
      <h2 class="static-title">${title}</h2>
      <button class="static-close-btn" aria-label="Close">✕</button>
    </div>
    <div class="static-body">${contentHTML}</div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(panel);

  requestAnimationFrame(() => {
    overlay.classList.add('show');
    panel.classList.add('show');
  });

  function close() {
    overlay.classList.remove('show');
    panel.classList.remove('show');
    setTimeout(() => { overlay.remove(); panel.remove(); }, 280);
  }

  overlay.addEventListener('click', close);
  panel.querySelector('.static-close-btn').addEventListener('click', close);
}


// ── PAGE CONTENT ──────────────────────────────────────────

function showAbout() {
  openStaticPage('About', `
    <p>This is a hymn resource for the church — bringing together hymns in Twi, Dangme, English, Ga, Ewe and French in one place.</p>
    <p>Songs are drawn from the church's hymn books and made searchable by title and lyrics.</p>
    <p class="static-version">Version 1.0</p>
  `);
}

function showHelp() {
  openStaticPage('How to Use', `
    <ol class="static-steps">
      <li><strong>Pick a language</strong> from the bar at the top.</li>
      <li><strong>Pick a genre</strong> from the sub-bar that appears below.</li>
      <li><strong>Tap a hymn</strong> from the list to read its lyrics.</li>
      <li>Use the <strong>search bar</strong> to find hymns by title or lyrics. Type a language prefix first — E for English, T for Twi, D for Dangme, etc.</li>
      <li>Tap <strong>♡ Favourite</strong> on a hymn to save it for quick access.</li>
      <li>Tap <strong>♪ Singlist</strong> to build a set list for a service.</li>
    </ol>
  `);
}

function showContact() {
  openStaticPage('Contact & Feedback', `
    <p>Have a correction, a suggestion, or a hymn to contribute?</p>
    <p>We would love to hear from you.</p>
    <a class="static-link-btn" href="mailto:feedback@yourdomain.com">
      Send a message
    </a>
  `);
}

function showTerms() {
  openStaticPage('Terms of Use', `
    <p>This app is provided for personal and congregational use within the church.</p>
    <p>Hymn lyrics are reproduced for worship purposes. All rights to the original compositions remain with their respective authors and publishers.</p>
    <p>Do not redistribute or reproduce this content for commercial purposes.</p>
  `);
}

function inviteFriend() {
  const url  = window.location.href;
  const text = 'Check out this hymn app — Twi, Dangme, English and more in one place.';

  if (navigator.share) {
    navigator.share({ title: 'Hymn App', text, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url).then(() => {
      openStaticPage('Invite a Friend', `
        <p>Share this link with a friend:</p>
        <p class="static-url">${url}</p>
        <p class="static-copied">✓ Link copied to clipboard</p>
      `);
    });
  }
}


// ── WIRE MENU ITEMS ───────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const actions = {
    'invite':   inviteFriend,
    'contact':  showContact,
    'about':    showAbout,
    'help':     showHelp,
    'terms':    showTerms,
  };

  Object.entries(actions).forEach(([key, fn]) => {
    const el = document.querySelector(`[data-action="${key}"]`);
    if (el) el.addEventListener('click', fn);
  });
});