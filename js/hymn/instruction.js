
const miniCursor   = document.getElementById('miniCursor');
const miniOverlay  = document.getElementById('miniOverlay');
const miniGenreBar = document.getElementById('miniGenreBar');
const miniHymnBody = document.getElementById('miniHymnBody');
const miniMockup   = document.querySelector('.mini-mockup');

const mpEng        = document.getElementById('mp-eng');
const mpTwi        = document.getElementById('mp-twi');
const mgp1         = document.getElementById('mgp1');
const mgp2         = document.getElementById('mgp2');

const demoHymns = [
  { num: '1', title: 'Oh praise the Lord' },
  { num: '2', title: 'Jesus is standing' },
  { num: '3', title: 'Walking with Jesus' },
  { num: '4', title: 'After the midnight' },
];

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function getElementCenter(el) {
  const mockupRect = miniMockup.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();

  return {
    x: elRect.left - mockupRect.left + elRect.width / 2,
    y: elRect.top - mockupRect.top + elRect.height / 2
  };
}

function moveCursorToElement(el) {
  const pos = getElementCenter(el);

  return new Promise(r => {
    miniCursor.style.left = pos.x + 'px';
    miniCursor.style.top  = pos.y + 'px';
    setTimeout(r, 600);
  });
}

function moveCursorToMockupCenter() {
  return new Promise(r => {
    miniCursor.style.left = (miniMockup.offsetWidth / 2) + 'px';
    miniCursor.style.top  = (miniMockup.offsetHeight / 2) + 'px';
    setTimeout(r, 600);
  });
}

function tap() {
  return new Promise(r => {
    miniCursor.classList.add('tap');
    setTimeout(() => {
      miniCursor.classList.remove('tap');
      r();
    }, 300);
  });
}

function clearMiniHymns() {
  miniHymnBody.innerHTML = '';
}

function showMiniHymns() {
  clearMiniHymns();

  demoHymns.forEach((h, i) => {
    const el = document.createElement('div');
    el.className = 'mini-hymn';
    el.innerHTML = `<span class="mini-num">${h.num}</span><span class="mini-title">${h.title}</span>`;
    miniHymnBody.appendChild(el);

    setTimeout(() => el.classList.add('show'), i * 120);
  });
}

function resetDemo() {
  [mpEng, mpTwi].forEach(e => e.classList.remove('active'));
  [mgp1, mgp2].forEach(e => e.classList.remove('active'));

  mgp1.classList.add('active');
  miniGenreBar.classList.remove('show');
  clearMiniHymns();

  miniOverlay.classList.remove('hide');
  miniCursor.style.opacity = '0';
}

async function runDemo() {
  await wait(4500);

  while (true) {
    resetDemo();
    await wait(1200);

    // cursor appears in the middle of the mockup
    miniCursor.style.opacity = '1';
    await moveCursorToMockupCenter();
    await wait(500);

    // move to English button and tap
    await moveCursorToElement(mpEng);
    await tap();

    // mini overlay fades away
    miniOverlay.classList.add('hide');
    mpEng.classList.add('active');
    await wait(400);

    // genre bar slides in and hymns appear
    miniGenreBar.classList.add('show');
    showMiniHymns();
    await wait(1500);

    // tap second genre
    await moveCursorToElement(mgp2);
    await tap();

    mgp1.classList.remove('active');
    mgp2.classList.add('active');

    clearMiniHymns();
    showMiniHymns();
    await wait(1500);

    // tap second hymn
    const items = miniHymnBody.querySelectorAll('.mini-hymn');

    if (items[1]) {
      await moveCursorToElement(items[1]);
      await tap();
      items[1].classList.add('selected');
    }

    await wait(1500);

    // switch to Twi
    await moveCursorToElement(mpTwi);
    await tap();

    mpEng.classList.remove('active');
    mpTwi.classList.add('active');

    mgp1.classList.add('active');
    mgp2.classList.remove('active');

    clearMiniHymns();
    showMiniHymns();

    await wait(2000);

    miniCursor.style.opacity = '0';
    await wait(800);
  }
}

// only run demo if instruction overlay is visible
if (!document.getElementById('instructionOverlay').classList.contains('hidden')) {
  runDemo();
}