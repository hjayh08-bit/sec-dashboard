const MAX_POINTS = 600;
const BAR_MAX_PX = 280;

function animateBars() {
  document.querySelectorAll('.house').forEach((house, i) => {
    const pts = parseInt(house.dataset.points);
    const bar = house.querySelector('.bar');
    const label = house.querySelector('.bar-pts');
    const targetH = (pts / MAX_POINTS) * BAR_MAX_PX;

    setTimeout(() => {
      bar.style.height = targetH + 'px';
      label.classList.add('visible');
    }, 200 + i * 120);
  });
}

// Hover: collapse and re-erect bar
document.querySelectorAll('.house').forEach(house => {
  const pts = parseInt(house.dataset.points);
  const bar = house.querySelector('.bar');
  const targetH = (pts / MAX_POINTS) * BAR_MAX_PX;

  house.addEventListener('mouseenter', () => {
    bar.style.transition = 'height .3s ease, filter .3s ease';
    bar.style.height = '0px';
    setTimeout(() => {
      bar.style.transition = 'height 1s cubic-bezier(.22,1,.36,1), filter .3s ease';
      bar.style.height = targetH + 'px';
    }, 320);
  });
});

// Study tips carousel
let currentTip = 0;
const tips = document.querySelectorAll('.tip');
const dots = document.querySelectorAll('.dot');

function showTip(i) {
  tips[currentTip].classList.remove('active');
  dots[currentTip].classList.remove('active');
  currentTip = i;
  tips[currentTip].classList.add('active');
  dots[currentTip].classList.add('active');
}

dots.forEach(dot => dot.addEventListener('click', () => showTip(parseInt(dot.dataset.i))));
setInterval(() => showTip((currentTip + 1) % tips.length), 6000);

// Init
animateBars();
