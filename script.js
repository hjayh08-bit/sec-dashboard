const MAX_POINTS = 600;
const BAR_MAX_PX = 280;
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============ NAV: condense on scroll ============ */
const nav = document.getElementById('nav');
function onScroll() {
  if (window.scrollY > 30) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ============ SCROLL REVEAL ============ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ============ LEADERBOARD: count-up + bars when in view ============ */
function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

function runHouse(house, i) {
  const pts = parseInt(house.dataset.points);
  const bar = house.querySelector('.bar');
  const label = house.querySelector('.bar-pts');
  const targetH = (pts / MAX_POINTS) * BAR_MAX_PX;

  setTimeout(() => {
    bar.style.height = targetH + 'px';
    label.classList.add('visible');

    // count-up number
    if (prefersReduced) { label.textContent = pts; return; }
    const dur = 1300;
    const start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      label.textContent = Math.round(easeOut(p) * pts);
      if (p < 1) requestAnimationFrame(tick);
      else label.textContent = pts;
    }
    requestAnimationFrame(tick);
  }, 150 + i * 110);
}

const leaderboard = document.querySelector('.leaderboard');
const lbObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.house').forEach((h, i) => runHouse(h, i));
      lbObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
lbObserver.observe(leaderboard);

// Hover: collapse and re-erect bar
document.querySelectorAll('.house').forEach(house => {
  const pts = parseInt(house.dataset.points);
  const bar = house.querySelector('.bar');
  const targetH = (pts / MAX_POINTS) * BAR_MAX_PX;
  house.addEventListener('mouseenter', () => {
    if (prefersReduced || !bar.style.height) return;
    bar.style.transition = 'height .3s ease, filter .3s ease';
    bar.style.height = '0px';
    setTimeout(() => {
      bar.style.transition = 'height 1s cubic-bezier(.22,1,.36,1), filter .3s ease';
      bar.style.height = targetH + 'px';
    }, 300);
  });
});

/* ============ MAGNETIC BUTTONS ============ */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !prefersReduced) {
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.28}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ============ STUDY TIPS CAROUSEL ============ */
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
  resetTimer();
}));

let autoTimer = setInterval(() => showTip(currentTip + 1, 'left'), 6000);
function resetTimer() {
  clearInterval(autoTimer);
  autoTimer = setInterval(() => showTip(currentTip + 1, 'left'), 6000);
}

// Swipe support
const carousel = document.querySelector('.tips-carousel');
let touchStartX = 0, touchStartY = 0;
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
let mouseStartX = 0, dragging = false;
carousel.addEventListener('mousedown', e => { mouseStartX = e.clientX; dragging = true; });
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

/* ============ PWA SERVICE WORKER ============ */
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/eddies-grit-hub/sw.js');
}

/* ============ POLL — Firebase backend ============ */
const DB = 'https://eddies-grit-hub-default-rtdb.firebaseio.com/polls/pingpong.json';

async function getVotes() {
  const res = await fetch(DB);
  const data = await res.json();
  return data || { yes: 0, no: 0 };
}
async function setVotes(data) {
  await fetch(DB, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}
async function castVote(choice) {
  if (localStorage.getItem('poll_pingpong_voted')) return;
  const data = await getVotes();
  data[choice] = (data[choice] || 0) + 1;
  await setVotes(data);
  localStorage.setItem('poll_pingpong_voted', choice);
  showResults(data);
}
async function removeVote() {
  const voted = localStorage.getItem('poll_pingpong_voted');
  if (!voted) return;
  const data = await getVotes();
  if (data[voted] > 0) data[voted]--;
  await setVotes(data);
  localStorage.removeItem('poll_pingpong_voted');
  document.getElementById('poll-results').style.display = 'none';
  document.getElementById('poll-buttons').style.display = 'flex';
}
function showResults(data) {
  const yes = data.yes || 0;
  const no  = data.no  || 0;
  const total = yes + no || 1;
  const yesPct = Math.round(yes / total * 100);
  const noPct  = 100 - yesPct;
  document.getElementById('poll-buttons').style.display = 'none';
  document.getElementById('poll-results').style.display = 'block';
  document.getElementById('poll-total').textContent =
    `${yes + no} ${yes + no === 1 ? 'person has' : 'people have'} voted`;
  setTimeout(() => {
    document.getElementById('yes-bar').style.width = yesPct + '%';
    document.getElementById('no-bar').style.width  = noPct  + '%';
    document.getElementById('yes-pct').textContent = `${yesPct}% (${yes})`;
    document.getElementById('no-pct').textContent  = `${noPct}% (${no})`;
  }, 50);
}
if (localStorage.getItem('poll_pingpong_voted')) {
  getVotes().then(showResults);
}

/* ============ FEEDBACK FORM (FormSubmit) ============ */
const FEEDBACK_ENDPOINT = 'https://formsubmit.co/ajax/hjayh08@gmail.com';
const feedbackForm = document.getElementById('feedback-form');
const feedbackStatus = document.getElementById('feedback-status');

feedbackForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = feedbackForm.querySelector('.feedback-btn');
  btn.disabled = true;
  btn.textContent = 'Sending…';
  feedbackStatus.className = 'feedback-status';
  feedbackStatus.textContent = '';

  try {
    const res = await fetch(FEEDBACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name: feedbackForm.name.value,
        message: feedbackForm.message.value,
        _subject: 'New Eddies Grit Hub feedback'
      })
    });
    if (res.ok) {
      feedbackForm.reset();
      feedbackStatus.className = 'feedback-status ok';
      feedbackStatus.textContent = 'Thanks! Your feedback has been sent. 🎉';
    } else {
      throw new Error('Request failed');
    }
  } catch (err) {
    feedbackStatus.className = 'feedback-status err';
    feedbackStatus.textContent = 'Something went wrong — please try again later.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send feedback →';
  }
});
