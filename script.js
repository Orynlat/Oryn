// ORYN — light interactions + "drawing" animations

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------
   1. HANDWRITE — reveal text character by character (left→right)
   Walks text nodes so <em> / <br> structure is preserved.
   ------------------------------------------------------------ */
const handwriteTargets = [
  '.hero__title',
  '.hero__sub',
  '.hero__triplet span',
  '.display',
  '.arch__core-label',
  '.arch__text',
  '.vision__lead',
  '.manifesto__lines p'
];

function splitIntoChars(el) {
  let i = 0;
  const walk = (parent) => {
    [...parent.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        [...node.textContent].forEach((ch) => {
          const span = document.createElement('span');
          span.className = 'char';
          span.textContent = ch;
          span.style.setProperty('--i', i++);
          frag.appendChild(span);
        });
        parent.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'BR') return;   // keep line breaks
        walk(node);                          // recurse into <em>, etc.
      }
    });
  };
  walk(el);
  el.classList.add('handwrite');
}

const handwriteEls = [];
if (!reduceMotion) {
  document.querySelectorAll(handwriteTargets.join(',')).forEach((el) => {
    splitIntoChars(el);
    handwriteEls.push(el);
  });
}

/* ------------------------------------------------------------
   2. DRAW STROKES — animate SVG ink lines as if being drawn
   ------------------------------------------------------------ */
if (!reduceMotion) {
  document
    .querySelectorAll('.ink-stroke, .ink-line, .prim__icon path, .prim__icon circle')
    .forEach((el) => {
      el.setAttribute('pathLength', '1');     // normalise every stroke length
      el.classList.add('draw-stroke');
    });
}

/* ------------------------------------------------------------
   3. Generic reveal for the remaining blocks
   ------------------------------------------------------------ */
const reveals = [
  '.hero__tag', '.hero__lead', '.hero__actions', '.hero__sketch',
  '.band__head', '.problem__visual',
  '.chain', '.prim', '.arch__diagram',
  '.res-card', '.res-tags', '.road__item',
  '.repo', '.repos__motto'
];
document.querySelectorAll(reveals.join(',')).forEach((el) => {
  el.setAttribute('data-reveal', '');
});

/* ------------------------------------------------------------
   4. One observer drives everything
   ------------------------------------------------------------ */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('in');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('[data-reveal]').forEach((el, i) => {
  el.style.transitionDelay = (Math.min(i % 6, 5) * 60) + 'ms';
  io.observe(el);
});
handwriteEls.forEach((el) => io.observe(el));
document.querySelectorAll('.hero__sketch, .prim').forEach((el) => io.observe(el));

if (reduceMotion) {
  document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('in'));
}

/* ------------------------------------------------------------
   5. Active nav link on scroll
   ------------------------------------------------------------ */
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = [...document.querySelectorAll('.nav__links a')];
const navIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const id = e.target.id;
      navLinks.forEach((a) => {
        a.style.color = a.getAttribute('href') === '#' + id ? 'var(--ink)' : '';
      });
    }
  });
}, { threshold: 0.4 });
sections.forEach((s) => navIO.observe(s));
