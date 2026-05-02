/* ============================================================
   WEDDING INVITATION — script.js
   Controls: petals, countdown, scroll reveals, RSVP, PIX copy
   ============================================================ */

// ── CONFIG ─────────────────────────────────────────────────
const CONFIG = {
  weddingDate: new Date('2026-05-23T19:30:00'),
  pixKey: 'nossocasamentowilsonecicera@gmail.com',
  web3Key: 'f8149f96-011a-4c34-8a38-8910b6f88fbf'  // ✅ Web3Forms
};

// ── COUNTDOWN ───────────────────────────────────────────────
function updateCountdown() {
  const now  = new Date();
  const diff = CONFIG.weddingDate - now;

  if (diff <= 0) {
    ['days', 'hours', 'minutes', 'seconds'].forEach(id =>
      document.getElementById(id).textContent = '00'
    );
    return;
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days    = Math.floor(totalSeconds / 86400);
  const hours   = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = n => String(n).padStart(2, '0');

  document.getElementById('days').textContent    = pad(days);
  document.getElementById('hours').textContent   = pad(hours);
  document.getElementById('minutes').textContent = pad(minutes);
  document.getElementById('seconds').textContent = pad(seconds);
}

// ── SCROLL REVEAL ────────────────────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll('.section-reveal').forEach(el => observer.observe(el));
}

// ── FORM VALIDATION ──────────────────────────────────────────
function validateForm() {
  let valid = true;

  const name       = document.getElementById('name');
  const email      = document.getElementById('email');
  const nameError  = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');

  name.classList.remove('error');
  email.classList.remove('error');
  nameError.classList.remove('visible');
  emailError.classList.remove('visible');

  if (!name.value.trim() || name.value.trim().length < 2) {
    name.classList.add('error');
    nameError.classList.add('visible');
    valid = false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
    email.classList.add('error');
    emailError.classList.add('visible');
    valid = false;
  }

  return valid;
}

// ── RSVP SUBMISSION ──────────────────────────────────────────
async function submitRSVP(type) {
  if (!validateForm()) return;

  const btnConfirm = document.getElementById('btnConfirm');
  const btnDecline = document.getElementById('btnDecline');

  btnConfirm.disabled = true;
  btnDecline.disabled = true;
  btnConfirm.textContent = type === 'yes' ? 'Enviando…' : '✓ Confirmar Presença';
  btnDecline.textContent = type === 'no'  ? 'Enviando…' : 'Não Poderei Ir';

  const formData = new FormData();
  formData.append('access_key', CONFIG.web3Key);
  formData.append('subject',    'RSVP — Casamento Wilson & Cicera');
  formData.append('from_name',  document.getElementById('name').value.trim());
  formData.append('replyto',    document.getElementById('email').value.trim());
  formData.append('name',       document.getElementById('name').value.trim());
  formData.append('email',      document.getElementById('email').value.trim());
  formData.append('message',    document.getElementById('message').value.trim());
  formData.append('presenca',   type === 'yes' ? 'Sim, estarei presente!' : 'Não poderei comparecer.');
  formData.append('casamento',  'Wilson & Cicera — 23/05/2026');

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    if (!result.success) {
      console.warn('Web3Forms retornou erro:', result.message);
    }
  } catch (err) {
    console.warn('Erro ao enviar:', err.message);
  }

  showRSVPResult(type);
}

function showRSVPResult(type) {
  const formDiv    = document.getElementById('rsvpForm');
  const successDiv = document.getElementById('rsvpSuccess');
  const declineDiv = document.getElementById('rsvpDecline');

  formDiv.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
  formDiv.style.opacity    = '0';
  formDiv.style.transform  = 'scale(0.95)';

  setTimeout(() => {
    formDiv.style.display = 'none';
    if (type === 'yes') {
      successDiv.classList.add('show');
      launchConfetti();
    } else {
      declineDiv.classList.add('show');
    }
  }, 400);
}

// ── CONFETTI BURST ───────────────────────────────────────────
function launchConfetti() {
  const emojis = ['🎊', '🎉', '💛', '✨', '🌸', '❤️'];

  for (let i = 0; i < 24; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed;
      left: ${20 + Math.random() * 60}%;
      top: ${30 + Math.random() * 20}%;
      font-size: ${1 + Math.random()}rem;
      opacity: 1;
      pointer-events: none;
      z-index: 9999;
      animation: confettiBurst ${0.8 + Math.random()}s ease-out ${Math.random() * 0.4}s forwards;
    `;
    el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }

  if (!document.getElementById('confettiStyle')) {
    const style = document.createElement('style');
    style.id = 'confettiStyle';
    style.textContent = `
      @keyframes confettiBurst {
        0%   { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
        100% { transform: translate(80px, 140px) rotate(360deg) scale(0.4); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ── PIX COPY ─────────────────────────────────────────────────
function copyPix() {
  const key      = CONFIG.pixKey;
  const copiedEl = document.getElementById('pixCopied');
  const copyBtn  = document.getElementById('btnCopy');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(key).then(showCopied).catch(() => fallbackCopy(key));
  } else {
    fallbackCopy(key);
  }

  function showCopied() {
    copyBtn.textContent = '✓ Copiado!';
    copyBtn.style.background = 'linear-gradient(135deg, #5a8a5a, #7ab87a)';
    copiedEl.classList.add('show');
    setTimeout(() => {
      copyBtn.innerHTML = '<span id="copyIcon">📋</span> Copiar';
      copyBtn.style.background = '';
      copiedEl.classList.remove('show');
    }, 3000);
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); showCopied(); } catch (e) { console.error(e); }
    document.body.removeChild(ta);
  }
}

// ── SMOOTH SCROLL ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ── INPUT FEEDBACK ────────────────────────────────────────────
['name', 'email'].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('input', () => {
    el.classList.remove('error');
    document.getElementById(id + 'Error').classList.remove('visible');
  });
});

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCountdown();
  setInterval(updateCountdown, 1000);
  initScrollReveal();
});

// ── STORY CAROUSEL ────────────────────────────────────────────
(function () {
  let current = 0;
  const slides = document.querySelectorAll('.story-slide');
  const dots   = document.querySelectorAll('.carousel-dot');
  const total  = slides.length;
  let autoTimer = null;

  function setSlideBackground(slide) {
    const img = slide.querySelector('.story-photo-wrap img');
    const wrap = slide.querySelector('.story-photo-wrap');
    if (img && wrap) {
      wrap.style.setProperty('--slide-bg', 'url(' + img.src + ')');
    }
  }

  function goTo(idx) {
    if (idx === current) return;
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (idx + total) % total;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    setSlideBackground(slides[current]);
  }

  window.carouselMove = function (dir) {
    resetAuto();
    goTo(current + dir);
  };

  window.carouselGoTo = function (idx) {
    resetAuto();
    goTo(idx);
  };

  function resetAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => goTo(current + 1), 8000);
  }

  // Touch/swipe support
  let touchStartX = 0;
  const carousel = document.getElementById('storyCarousel');
  if (carousel) {
    carousel.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { resetAuto(); goTo(current + (diff > 0 ? 1 : -1)); }
    });
  }

  // Start autoplay after DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    slides.forEach(slide => {
      const img = slide.querySelector('.story-photo-wrap img');
      const wrap = slide.querySelector('.story-photo-wrap');
      if (img && wrap) {
        const apply = () => wrap.style.setProperty('--slide-bg', 'url(' + img.src + ')');
        img.complete ? apply() : img.addEventListener('load', apply);
      }
    });
    resetAuto();
  });
})();
