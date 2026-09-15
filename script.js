// ---------- Reveal on scroll ----------
// Applies to elements marked with .reveal (added dynamically below to
// section leads so we don't animate every single element on the page).
const revealTargets = document.querySelectorAll(
  '.about__lead, .about__body, .skills__inner, .github__inner, .drawings__inner, .connect__inner'
);
revealTargets.forEach(el => el.classList.add('reveal'));

const io = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
revealTargets.forEach(el => io.observe(el));

// ---------- Nav scroll progress & active spy ----------
const navProgress = document.getElementById('navProgress');
const navLinks = document.querySelectorAll('.nav__links a');
const spySections = document.querySelectorAll('header[id], section[id], footer[id]');

function updateScrollProgress() {
  if (navProgress) {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    navProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
  }
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

if ('IntersectionObserver' in window && spySections.length > 0) {
  const spyIo = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.toggle('is-active', href === `#${id}`);
          });
        }
      });
    },
    { threshold: 0.25, rootMargin: '-15% 0px -35% 0px' }
  );
  spySections.forEach(el => spyIo.observe(el));
}

// ---------- GitHub repositories ----------
const GITHUB_USER = 'Yugal-Varshney';
const repoList = document.getElementById('repoList');

async function loadRepos() {
  try {
    const res = await fetch(
      `https://api.github.com/users/${GITHUB_USER}/repos?sort=updated&per_page=8`
    );
    if (!res.ok) throw new Error('GitHub API request failed');
    const repos = await res.json();

    const visible = repos.filter(r => !r.fork).slice(0, 5);

    if (visible.length === 0) {
      repoList.innerHTML = '<li class="github__loading">No public repositories yet.</li>';
      return;
    }

    repoList.innerHTML = visible
      .map(repo => {
        const date = new Date(repo.updated_at);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        const stars = repo.stargazers_count > 0 ? `<span class="repo__stars">★ ${repo.stargazers_count}</span>` : '';
        const lang = repo.language
          ? `<span class="repo__lang-badge"><span class="repo__lang-dot"></span>${escapeHtml(repo.language)}</span>`
          : '';

        return `
        <li>
          <a class="repo__card" href="${repo.html_url}" target="_blank" rel="noopener">
            <div class="repo__top">
              <span class="repo__name">${escapeHtml(repo.name)}</span>
              <span class="repo__arrow" aria-hidden="true">→</span>
            </div>
            <div class="repo__meta">
              ${lang}
              ${stars}
              <span class="repo__updated">Updated ${dateStr}</span>
            </div>
            ${repo.description ? `<p class="repo__desc">${escapeHtml(repo.description)}</p>` : ''}
          </a>
        </li>`;
      })
      .join('');
  } catch (err) {
    repoList.innerHTML = '<li class="github__loading">Couldn\u2019t load repositories right now \u2014 <a class="github__all" href="https://github.com/' + GITHUB_USER + '" target="_blank" rel="noopener">view on GitHub</a> instead.</li>';
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

loadRepos();

// ---------- Drawings gallery ----------
// Drop image files into /assets/drawings/ and list their filenames here.
// Once populated, the placeholder message is replaced automatically.
const DRAWINGS = [
  'sketch_01.png',
  'sketch_02.png',
  'sketch_03.jpg',
  'sketch_04.jpg',
  'sketch_05.jpeg',
  'sketch_06.jpg',
  'sketch_07.jpg',
];

function loadDrawings() {
  if (DRAWINGS.length === 0) return; // keep the placeholder as-is

  const gallery = document.getElementById('drawingsGallery');
  gallery.innerHTML = DRAWINGS
    .map(name => `<img src="assets/${name}" alt="Drawing by Yugal Varshney" loading="lazy">`)
    .join('');
}

loadDrawings();

// ---------- Hero kicker typewriter ----------
const kickerEl = document.querySelector('.hero__kicker');
 
if (kickerEl) {
  let kickerTextEl = kickerEl.querySelector('.hero__kicker-text');
  if (!kickerTextEl) {
    const initialText = kickerEl.textContent.trim() || 'printf("Yugal Varshney");';
    kickerEl.innerHTML = `<span class="hero__kicker-text">${escapeHtml(initialText)}</span><span class="hero__cursor" aria-hidden="true"></span>`;
    kickerTextEl = kickerEl.querySelector('.hero__kicker-text');
  }
 
  const KICKER_PHRASES = [
    'printf("Yugal Varshney");',
    'std::cout << "Yugal Varshney";',
    'print("Yugal Varshney")',
    'console.log("Yugal Varshney");'
  ];
 
  let phraseIndex = 0;
  let charIndex = KICKER_PHRASES[0].length;
  let isDeleting = true;
  const HOLD_DURATION = 1800;   // calm, readable hold duration
  const TYPE_SPEED = 55;         // typing speed per char (ms)
  const DELETE_SPEED = 30;       // deleting speed per char (ms)
  const PAUSE_BEFORE_TYPE = 400; // gentle pause before typing next
 
  function typeStep() {
    const currentPhrase = KICKER_PHRASES[phraseIndex];
 
    if (isDeleting) {
      charIndex--;
      kickerTextEl.textContent = currentPhrase.substring(0, charIndex);
 
      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % KICKER_PHRASES.length;
        setTimeout(typeStep, PAUSE_BEFORE_TYPE);
        return;
      }
      setTimeout(typeStep, DELETE_SPEED);
    } else {
      charIndex++;
      kickerTextEl.textContent = currentPhrase.substring(0, charIndex);
 
      if (charIndex === currentPhrase.length) {
        isDeleting = true;
        setTimeout(typeStep, HOLD_DURATION);
        return;
      }
      setTimeout(typeStep, TYPE_SPEED);
    }
  }
 
  // Hold initial phrase for calm duration, then loop through all phrases forever
  setTimeout(typeStep, HOLD_DURATION);
}

// ---------- Hero title dynamic word fade ----------
const titleDynamicEl = document.querySelector('.hero__title-dynamic');

if (titleDynamicEl) {
  const TITLE_WORDS = ['build', 'learn', 'create'];
  let wordIndex = TITLE_WORDS.indexOf(titleDynamicEl.textContent.trim());
  if (wordIndex === -1) wordIndex = 0;

  const FADE_DURATION = 350;       // matches CSS transition duration
  const WORD_HOLD_DURATION = 2000; // time to display each word

  function cycleTitleWord() {
    titleDynamicEl.classList.add('is-fading');

    setTimeout(() => {
      wordIndex = (wordIndex + 1) % TITLE_WORDS.length;
      titleDynamicEl.textContent = TITLE_WORDS[wordIndex];
      titleDynamicEl.classList.add('is-entering');
      titleDynamicEl.classList.remove('is-fading');

      // Force synchronous reflow so transition runs on subsequent frame
      void titleDynamicEl.offsetWidth;
      titleDynamicEl.classList.remove('is-entering');

      setTimeout(cycleTitleWord, WORD_HOLD_DURATION);
    }, FADE_DURATION);
  }

  setTimeout(cycleTitleWord, WORD_HOLD_DURATION);
}
