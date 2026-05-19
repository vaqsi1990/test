const PROJECTS_URL = './projects/projects.json';
const DESKTOP_BREAKPOINT = '(min-width: 900px)';
const GAP_PX = 16;
const AUTOPLAY_MS = 5000;

const carousel = document.getElementById('projectsCarousel');
const viewport = carousel?.querySelector('.carousel__viewport');
const track = document.getElementById('carouselTrack');
const dotsContainer = document.getElementById('carouselDots');
const prevBtn = document.getElementById('carouselPrev');
const nextBtn = document.getElementById('carouselNext');

let projects = [];
let currentIndex = 0;
let autoplayTimer = null;
let slideStepPx = 0;

const desktopMedia = window.matchMedia(DESKTOP_BREAKPOINT);

init();

async function init() {
  if (!track || !viewport) return;

  try {
    const response = await fetch(PROJECTS_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    projects = await response.json();
  } catch {
    track.innerHTML =
      '<p class="carousel__empty">Не удалось загрузить проекты.</p>';
    return;
  }

  if (!projects.length) {
    track.innerHTML = '<p class="carousel__empty">Проекты не найдены.</p>';
    return;
  }

  renderSlides();
  renderDots();
  bindControls();

  desktopMedia.addEventListener('change', onLayoutChange);
  window.addEventListener('resize', onLayoutChange);

  onLayoutChange();
  goTo(0);
  startAutoplay();
}

function getVisibleSlides() {
  return desktopMedia.matches ? 3 : 1;
}

function getMaxIndex() {
  return Math.max(0, projects.length - getVisibleSlides());
}

function getPageCount() {
  return getMaxIndex() + 1;
}

function onLayoutChange() {
  const visible = getVisibleSlides();
  const width = viewport.clientWidth;
  const slideWidth = (width - GAP_PX * (visible - 1)) / visible;

  carousel.style.setProperty('--carousel-gap', `${GAP_PX}px`);
  carousel.style.setProperty('--slide-width', `${slideWidth}px`);
  carousel.style.setProperty('--media-height', `${(slideWidth * 9) / 16}px`);
  slideStepPx = slideWidth + GAP_PX;

  if (currentIndex > getMaxIndex()) {
    currentIndex = getMaxIndex();
  }

  renderDots();
  applyTransform();
  updateDots();
}

function renderSlides() {
  track.innerHTML = projects
    .map(
      (project, index) => `
    <article class="carousel__slide" data-index="${index}">
      <div class="carousel__card">
        <div class="carousel__media">
          <img
            class="carousel__image"
            src="${escapeAttr(project.image)}"
            alt="${escapeAttr(project.title)}"
            loading="lazy"
          >
        </div>
        <div class="carousel__footer">
          <p class="carousel__title">${escapeHtml(project.title)}</p>
          ${
            project.contribution
              ? `<p class="carousel__contribution-label">Что делал лично</p>
          <p class="carousel__contribution">${escapeHtml(project.contribution)}</p>`
              : ''
          }
          <p class="carousel__links">
            <a href="${escapeAttr(project.url)}" target="_blank" rel="noopener noreferrer">Сайт</a>
            <span aria-hidden="true">·</span>
            <a href="${escapeAttr(project.github)}" target="_blank" rel="noopener noreferrer">GitHub</a>
          </p>
        </div>
      </div>
    </article>
  `,
    )
    .join('');
}

function renderDots() {
  if (!dotsContainer) return;

  const pageCount = getPageCount();

  if (pageCount <= 1) {
    dotsContainer.innerHTML = '';
    dotsContainer.hidden = true;
    return;
  }

  dotsContainer.hidden = false;
  dotsContainer.innerHTML = Array.from({ length: pageCount }, (_, index) => `
    <button
      type="button"
      class="carousel__dot"
      role="tab"
      aria-label="Страница ${index + 1}"
      aria-selected="false"
      data-index="${index}"
    ></button>
  `).join('');
}

function updateDots() {
  if (!dotsContainer || dotsContainer.hidden) return;

  dotsContainer.querySelectorAll('.carousel__dot').forEach((dot, i) => {
    const active = i === currentIndex;
    dot.classList.toggle('carousel__dot--active', active);
    dot.setAttribute('aria-selected', String(active));
  });
}

function bindControls() {
  prevBtn?.addEventListener('click', () => goTo(currentIndex - 1));
  nextBtn?.addEventListener('click', () => goTo(currentIndex + 1));

  dotsContainer?.addEventListener('click', (event) => {
    const dot = event.target.closest('.carousel__dot');
    if (!dot) return;
    goTo(Number(dot.dataset.index), false);
  });

  carousel?.addEventListener('mouseenter', stopAutoplay);
  carousel?.addEventListener('mouseleave', startAutoplay);

  carousel?.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') goTo(currentIndex - 1);
    if (event.key === 'ArrowRight') goTo(currentIndex + 1);
  });

  let touchStartX = 0;

  track.addEventListener(
    'touchstart',
    (event) => {
      touchStartX = event.changedTouches[0].screenX;
    },
    { passive: true },
  );

  track.addEventListener(
    'touchend',
    (event) => {
      const delta = event.changedTouches[0].screenX - touchStartX;
      if (Math.abs(delta) < 40) return;
      goTo(currentIndex + (delta < 0 ? 1 : -1));
    },
    { passive: true },
  );
}

function goTo(index, wrap = true) {
  const max = getMaxIndex();

  if (wrap) {
    if (index < 0) currentIndex = max;
    else if (index > max) currentIndex = 0;
    else currentIndex = index;
  } else {
    currentIndex = Math.max(0, Math.min(index, max));
  }

  applyTransform();
  updateDots();

  const project = projects[currentIndex];
  carousel?.setAttribute('aria-label', `Проекты: ${project?.title ?? ''}`);
}

function applyTransform() {
  track.style.transform = `translateX(-${currentIndex * slideStepPx}px)`;
}

function startAutoplay() {
  stopAutoplay();
  if (getMaxIndex() === 0) return;
  autoplayTimer = setInterval(() => goTo(currentIndex + 1), AUTOPLAY_MS);
}

function stopAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function escapeAttr(text) {
  return escapeHtml(text).replaceAll("'", '&#39;');
}
