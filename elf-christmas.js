(function () {
  const TOTAL_ELVES = 7;
  const MIN_SIZE = 70;
  const MAX_SIZE = 140;
  const PATH = 'assets/elf-images/elf-';

  // ?elfday=3 in the URL forces a day for testing
  const params = new URLSearchParams(window.location.search);
  let day = parseInt(params.get('elfday'), 10);

  if (!day) {
    const now = new Date();
    if (now.getMonth() !== 11 || now.getDate() > TOTAL_ELVES) return; // 1st–7th December only
    day = now.getDate();
  }

  // Day 8 shows elf-1 again, and so on through December
  const elfNumber = ((day - 1) % TOTAL_ELVES) + 1;

  function placeElf() {
    const size = Math.floor(Math.random() * (MAX_SIZE - MIN_SIZE + 1)) + MIN_SIZE;
    const doc = document.documentElement;
    const maxX = Math.max(0, doc.clientWidth - size);
    const maxY = Math.max(0, doc.scrollHeight - size);

    const elf = document.createElement('img');
    elf.src = `${PATH}${elfNumber}.png`;
    elf.alt = '';
    elf.setAttribute('aria-hidden', 'true');
    elf.className = 'foi-elf';
    elf.style.width = `${size}px`;
    elf.style.left = `${Math.floor(Math.random() * maxX)}px`;
    elf.style.top = `${Math.floor(Math.random() * maxY)}px`;

    document.body.appendChild(elf);
  }

  if (document.readyState === 'complete') {
    placeElf();
  } else {
    window.addEventListener('load', placeElf);
  }
})();