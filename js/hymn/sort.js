const sortBtn = document.getElementById('sortBtn');
const sortPopup = document.getElementById('sortPopup');
const sortAlpha = document.getElementById('sortAlpha');
const sortNumber = document.getElementById('sortNumber');

sortBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  sortPopup.classList.toggle('hidden');
});

sortPopup.addEventListener('click', (e) => {
  e.stopPropagation();
});

document.addEventListener('click', () => {
  sortPopup.classList.add('hidden');
});

sortAlpha.addEventListener('click', () => {
  if (!Array.isArray(currentHymns) || currentHymns.length === 0) return;

  const sorted = [...currentHymns].sort((a, b) => {
    return a.title.localeCompare(b.title);
  });

  renderHymnList(sorted, currentGenre);
  sortPopup.classList.add('hidden');
});

sortNumber.addEventListener('click', () => {
  if (!Array.isArray(currentHymns) || currentHymns.length === 0) return;

  const sorted = [...currentHymns].sort((a, b) => {
    const numA = parseFloat(a.number) || 0;
    const numB = parseFloat(b.number) || 0;

    if (numA !== numB) return numA - numB;

    return String(a.number).localeCompare(String(b.number));
  });

  renderHymnList(sorted, currentGenre);
  sortPopup.classList.add('hidden');
});