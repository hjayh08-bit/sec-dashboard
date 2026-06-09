const MAX_POINTS = 600;
const BAR_MAX_PX = 280;

// Animate bars on load
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

function showTip(i, direction) {
  tips[currentTip].classList.remove('active', 'slide-left', 'slide-right');
  dots[currentTip].classList.remove('active');
  currentTip = (i + tips.length) % tips.length;
  tips[currentTip].classList.add('active', direction === 'left' ? 'slide-left' : 'slide-right');
  dots[currentTip].classList.add('active');
}

dots.forEach(dot => dot.addEventListener('click', () => {
  const i = parseInt(dot.dataset.i);
  showTip(i, i > currentTip ? 'left' : 'right');
}));

// Auto-rotate
let autoTimer = setInterval(() => showTip(currentTip + 1, 'left'), 6000);

function resetTimer() {
  clearInterval(autoTimer);
  autoTimer = setInterval(() => showTip(currentTip + 1, 'left'), 6000);
}

// Swipe support
const carousel = document.querySelector('.tips-carousel');
let touchStartX = 0;
let touchStartY = 0;

carousel.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

carousel.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
    dx < 0 ? showTip(currentTip + 1, 'left') : showTip(currentTip - 1, 'right');
    resetTimer();
  }
}, { passive: true });

// Mouse drag swipe (desktop)
let mouseStartX = 0;
let dragging = false;

carousel.addEventListener('mousedown', e => {
  mouseStartX = e.clientX;
  dragging = true;
});
carousel.addEventListener('mouseup', e => {
  if (!dragging) return;
  dragging = false;
  const dx = e.clientX - mouseStartX;
  if (Math.abs(dx) > 50) {
    dx < 0 ? showTip(currentTip + 1, 'left') : showTip(currentTip - 1, 'right');
    resetTimer();
  }
});
carousel.addEventListener('mouseleave', () => { dragging = false; });

animateBars();

// POLL
function castVote(choice) {
  const stored = JSON.parse(localStorage.getItem('poll_pingpong') || '{"yes":0,"no":0}');
  const voted = localStorage.getItem('poll_pingpong_voted');
  if (voted) { showResults(stored); return; }
  stored[choice]++;
  localStorage.setItem('poll_pingpong', JSON.stringify(stored));
  localStorage.setItem('poll_pingpong_voted', choice);
  showResults(stored);
}

function showResults(data) {
  const total = data.yes + data.no || 1;
  const yesPct = Math.round(data.yes / total * 100);
  const noPct = 100 - yesPct;
  document.getElementById('poll-buttons').style.display = 'none';
  const results = document.getElementById('poll-results');
  results.style.display = 'block';
  setTimeout(() => {
    document.getElementById('yes-bar').style.width = yesPct + '%';
    document.getElementById('no-bar').style.width  = noPct  + '%';
    document.getElementById('yes-pct').textContent = yesPct + '%';
    document.getElementById('no-pct').textContent  = noPct  + '%';
  }, 50);
}

// Show results straight away if already voted
const existingVote = localStorage.getItem('poll_pingpong_voted');
if (existingVote) {
  const stored = JSON.parse(localStorage.getItem('poll_pingpong') || '{"yes":0,"no":0}');
  showResults(stored);
}
