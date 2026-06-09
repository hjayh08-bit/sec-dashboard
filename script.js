// Animate bars on load
const MAX_POINTS = 600;
const BAR_MAX_HEIGHT = 240; // px

function animateBars() {
  document.querySelectorAll('.bar-group').forEach((g, i) => {
    const pts = parseInt(g.dataset.points);
    const color = g.dataset.color;
    const fill = g.querySelector('.bar-fill');
    fill.style.setProperty('--c', color);
    fill.style.background = color;
    setTimeout(() => {
      fill.style.height = (pts / MAX_POINTS * BAR_MAX_HEIGHT) + 'px';
    }, 200 + i * 100);
  });
}

// Animate cards when they scroll into view
function animateCards() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), idx * 80);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.card').forEach(c => observer.observe(c));
}

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

dots.forEach(dot => {
  dot.addEventListener('click', () => showTip(parseInt(dot.dataset.i)));
});

// Auto-rotate tips every 6 seconds
setInterval(() => showTip((currentTip + 1) % tips.length), 6000);

// Init
animateBars();
animateCards();
