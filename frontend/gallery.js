/**
 * gallery.js
 * Manages the vertical photo carousel and the horizontal reviews carousel
 * on gallery.html.
 *
 * Both carousels share the same generic Carousel class to avoid code duplication.
 */

/**
 * Generic carousel controller.
 * Works for both horizontal (reviews) and vertical (photos) carousels.
 *
 * @param {object} config
 * @param {string}  config.trackId      - id of the scrolling track element
 * @param {string}  config.prevBtnId    - id of the "previous" button
 * @param {string}  config.nextBtnId    - id of the "next" button
 * @param {string}  config.dotsId       - id of the dots container
 * @param {'horizontal'|'vertical'} config.direction - scroll axis
 */
class Carousel {
  /**
   * @param {object} config - See JSDoc above.
   */
  constructor({ trackId, prevBtnId, nextBtnId, dotsId, direction = 'horizontal' }) {
    this.track     = document.getElementById(trackId);
    this.prevBtn   = document.getElementById(prevBtnId);
    this.nextBtn   = document.getElementById(nextBtnId);
    this.dotsEl    = document.getElementById(dotsId);
    this.direction = direction;

    if (!this.track) return; // guard: element not in DOM

    this.slides      = Array.from(this.track.children);
    this.total       = this.slides.length;
    this.currentIndex = 0;

    this._buildDots();
    this._bindEvents();
    this._update();
  }

  /** Build one dot button per slide. */
  _buildDots() {
    if (!this.dotsEl) return;
    this.slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => this.goTo(i));
      this.dotsEl.appendChild(dot);
    });
    this.dots = Array.from(this.dotsEl.querySelectorAll('.dot'));
  }

  /** Attach click listeners to prev/next buttons. */
  _bindEvents() {
    this.prevBtn?.addEventListener('click', () => this.prev());
    this.nextBtn?.addEventListener('click', () => this.next());
  }

  /** Apply CSS transform and update dot active states. */
  _update() {
    const offset = this.currentIndex * 100;
    const transform = this.direction === 'vertical'
      ? `translateY(-${offset}%)`
      : `translateX(-${offset}%)`;

    this.track.style.transform = transform;

    this.dots?.forEach((dot, i) => {
      dot.classList.toggle('is-active', i === this.currentIndex);
      dot.setAttribute('aria-selected', String(i === this.currentIndex));
    });
  }

  /** Navigate to a specific slide index. */
  goTo(index) {
    this.currentIndex = (index + this.total) % this.total;
    this._update();
  }

  /** Go to the previous slide. */
  prev() {
    this.goTo(this.currentIndex - 1);
  }

  /** Go to the next slide. */
  next() {
    this.goTo(this.currentIndex + 1);
  }

  /** Returns the current index (useful for tests). */
  getIndex() {
    return this.currentIndex;
  }
}

// ---- Bootstrap on DOMContentLoaded ----
document.addEventListener('DOMContentLoaded', () => {
  // Vertical photo carousel
  new Carousel({
    trackId:   'photoTrack',
    prevBtnId: 'photoPrev',
    nextBtnId: 'photoNext',
    dotsId:    'photoDots',
    direction: 'vertical',
  });

  // Reviews carousel is initialised inside renderApprovedReviews()
  // (called from the second DOMContentLoaded below) so that
  // dynamically added approved review cards are included from the start.
});

// Export for unit testing (CommonJS compatible)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Carousel };
}

/* Review modal */

const REVIEW_STORAGE_KEY = 'natalias_birds_posts';

/**
 * Generate a simple unique id.
 * @returns {string}
 */
function generateReviewId() {
  return `review-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Format today as DD.MM.YYYY.
 * @returns {string}
 */
function todayFormatted() {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${d.getFullYear()}`;
}

/**
 * Load posts array from localStorage (shared with blog.js).
 * @returns {object[]}
 */
function loadPosts() {
  try {
    const raw = localStorage.getItem(REVIEW_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) { return []; }
}

/**
 * Save posts array back to localStorage.
 * @param {object[]} posts
 */
function savePosts(posts) {
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(posts));
}

/**
 * Escape HTML to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeReviewHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Build interactive star buttons inside the given container.
 * Stores chosen rating in the container's dataset.rating.
 * @param {HTMLElement} container
 */
function buildReviewStars(container) {
  container.dataset.rating = '0';

  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'review-form__star';
    btn.dataset.value = String(i);
    btn.setAttribute('aria-label', `${i} из 5`);
    btn.innerHTML = '&#9733;';
    container.appendChild(btn);
  }

  const stars = Array.from(container.querySelectorAll('.review-form__star'));

  const highlight = (upTo) => {
    stars.forEach((s, idx) => s.classList.toggle('review-form__star--lit', idx < upTo));
  };

  stars.forEach((btn, i) => {
    btn.addEventListener('mouseenter', () => highlight(i + 1));
    btn.addEventListener('mouseleave', () => highlight(Number(container.dataset.rating)));
    btn.addEventListener('click', () => {
      container.dataset.rating = String(i + 1);
      highlight(i + 1);
    });
  });
}

/**
 * Initialise the review modal: open/close, star widget, form submit.
 */
function initReviewModal() {
  const openBtn   = document.getElementById('openReviewModal');
  const backdrop  = document.getElementById('reviewModalBackdrop');
  const closeBtn  = document.getElementById('reviewModalClose');
  const form      = document.getElementById('reviewForm');
  const starsEl   = document.getElementById('reviewStars');
  const errorEl   = document.getElementById('reviewFormError');

  if (!openBtn || !backdrop) return;

  // Build star widget
  if (starsEl) buildReviewStars(starsEl);

  const openModal = () => {
    backdrop.classList.add('is-open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.getElementById('reviewName')?.focus();
  };

  const closeModal = () => {
    backdrop.classList.remove('is-open');
    backdrop.setAttribute('aria-hidden', 'true');
  };

  openBtn.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('is-open')) closeModal();
  });

  // Form submit
  form?.addEventListener('submit', (e) => {
    e.preventDefault();

    const name      = document.getElementById('reviewName')?.value.trim();
    const text      = document.getElementById('reviewText')?.value.trim();
    const recommend = document.getElementById('reviewRecommend')?.value;
    const rating    = Number(starsEl?.dataset.rating ?? 0);

    // Validate
    if (!name) {
      errorEl.textContent = 'Пожалуйста, введите ваше имя.';
      return;
    }
    if (rating === 0) {
      errorEl.textContent = 'Пожалуйста, выберите оценку.';
      return;
    }
    if (!text) {
      errorEl.textContent = 'Пожалуйста, напишите текст отзыва.';
      return;
    }
    if (!recommend) {
      errorEl.textContent = 'Пожалуйста, ответьте на вопрос о рекомендации.';
      return;
    }
    errorEl.textContent = '';

    // Build review object — same shape as a blog post + extra fields
    const review = {
      id:          generateReviewId(),
      type:        'review',              // distinguishes from regular posts
      title:       `Отзыв от ${escapeReviewHtml(name)}`,
      body:        text,
      author:      name,
      date:        todayFormatted(),
      imageDataUrl: '',
      ratings:     [rating],
      rating,                             // the single chosen star value
      recommend,                          // 'yes' | 'no'
      status:      'pending',             // awaits admin approval
    };

    const posts = loadPosts();
    posts.unshift(review);
    savePosts(posts);

    form.reset();
    if (starsEl) {
      starsEl.dataset.rating = '0';
      starsEl.querySelectorAll('.review-form__star').forEach((s) => s.classList.remove('review-form__star--lit'));
    }

    closeModal();

    // Redirect to blog moderation page with a flag so admin sees the reviews tab
    window.location.href = 'blog.html?newReview=1';
  });
}

/**
 * Build one review card element from a stored review object.
 * Matches the existing HTML structure of the static review cards.
 * @param {object} review
 * @returns {HTMLElement}
 */
function buildApprovedReviewCard(review) {
  const stars = Array.from({ length: 5 }, (_, i) =>
    `<span class="star ${i < review.rating ? 'star--filled' : ''}">&#9733;</span>`
  ).join('');

  const recommendBadge = review.recommend === 'yes'
    ? '<span class="review-card__recommend">👍 Рекомендует</span>'
    : '';

  const article = document.createElement('article');
  article.className = 'review-card';
  article.setAttribute('aria-label', `Review by ${escapeReviewHtml(review.author)}`);
  article.innerHTML = `
    <div class="review-card__header">
      <div class="review-card__avatar" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="40" height="40">
          <circle cx="20" cy="20" r="20" fill="rgb(123 88 113)"/>
          <circle cx="20" cy="15" r="7" fill="rgb(241 220 205)"/>
          <ellipse cx="20" cy="35" rx="12" ry="8" fill="rgb(241 220 205)"/>
        </svg>
      </div>
      <span class="review-card__name">${escapeReviewHtml(review.author)}</span>
    </div>
    <div class="review-card__rating">
      <div class="review-card__stars" aria-hidden="true">${stars}</div>
      <span class="review-card__score">${review.rating}/5</span>
    </div>
    <p class="review-card__text">${escapeReviewHtml(review.body)}</p>
    ${recommendBadge}
  `;
  return article;
}

/**
 * Load approved reviews from localStorage and append them to the
 * reviews carousel track. The Carousel is then re-initialised so
 * dots and navigation include the new slides.
 */
function renderApprovedReviews() {
  const track = document.getElementById('reviewsTrack');
  if (!track) return;

  const approved = loadPosts().filter(
    (p) => p.type === 'review' && p.status === 'published'
  );

  if (!approved.length) return;

  const isAdmin = localStorage.getItem('natalias_birds_admin') === 'true';

  approved.forEach((review) => {
    const card = buildApprovedReviewCard(review);

    if (isAdmin) {
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'review-card__delete-btn';
      deleteBtn.textContent = '🗑 Удалить';
      deleteBtn.addEventListener('click', () => {
        if (!confirm('Удалить этот отзыв безвозвратно?')) return;

        const posts = loadPosts().filter((p) => p.id !== review.id);
        savePosts(posts);
        card.remove();
      });
      card.appendChild(deleteBtn);
    }

  track.appendChild(card);
});

  // Re-initialise the reviews carousel so new slides get dots/nav
  const dotsEl = document.getElementById('reviewsDots');
  if (dotsEl) dotsEl.innerHTML = '';   // clear old dots before rebuild

  new Carousel({
    trackId:   'reviewsTrack',
    prevBtnId: 'reviewsPrev',
    nextBtnId: 'reviewsNext',
    dotsId:    'reviewsDots',
    direction: 'horizontal',
  });
}

// Bootstrap
document.addEventListener('DOMContentLoaded', () => {
  initReviewModal();
  renderApprovedReviews();
});
