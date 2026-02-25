/**
 * blog.js
 * Handles:
 *  - BlogStore      : read/write articles to localStorage
 *  - AdminSession   : login / logout / session check
 *  - MiniCalendar   : renders a navigable mini calendar
 *  - BlogFeed       : renders article preview cards (published only)
 *  - RecentList     : renders the "latest posts" sidebar list
 *  - PostForm       : validates and submits new articles (→ pending)
 *  - AdminPanel     : moderation queue — approve / reject posts
 *  - RatingWidget   : interactive star rating on the article page
 *  - ArticlePage    : populates the full article view (blog-article.html)
 */

/* Contacts */

const STORAGE_KEY       = 'natalias_birds_posts';
const ADMIN_SESSION_KEY = 'natalias_birds_admin';

/*Password for the demo admin. */
const ADMIN_PASSWORD = 'admin123';

const MONTH_NAMES_RU = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь',
];

const DAY_NAMES_SHORT = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];

const EXCERPT_LENGTH = 220;

/* Seed data */

/**
 * @typedef {'published'|'pending'} ArticleStatus
 *
 * @typedef {object} Article
 * @property {string}        id           - Unique identifier.
 * @property {string}        title        - Article headline.
 * @property {string}        body         - Full article text.
 * @property {string}        author       - Author name / nickname.
 * @property {string}        date         - Formatted date string (DD.MM.YYYY).
 * @property {string}        imageDataUrl - Base64 image or empty string.
 * @property {number[]}      ratings      - Array of 1–5 star ratings.
 * @property {ArticleStatus} status       - 'published' or 'pending'.
 */

/** @type {Article[]} */
const SEED_ARTICLES = [
  {
    id: 'seed-1',
    title: 'Неделя на Мальте: солнце, рыцари и лазурные лагуны',
    body: 'Мальта оказалась именно такой, как я мечтала: тёплое море, мощёные улочки Валлетты и невероятные закаты над бухтой Марсашлокк. Благодаря Natalia\'s Birds место на рейсе было за мной ещё за три месяца до отъезда — никакого стресса в аэропорту, только предвкушение приключения. Отдельно хочу отметить скромный, но очень атмосферный остров Гозо — там я нашла лучший в своей жизни местный сыр и вид, который буду помнить всегда.',
    author: 'Анастасия',
    date: formatDate(daysAgo(2)),
    imageDataUrl: '',
    ratings: [5, 5, 4, 5],
    status: 'published',
  },
  {
    id: 'seed-2',
    title: 'Сингапур за 48 часов: гайд для тех, кто ценит время',
    body: 'Транзит через Сингапур превратился в одно из лучших путешествий в моей жизни. Я заранее договорилась с Natalia\'s Birds о резервировании обоих рейсов — туда и обратно — и у меня осталось ровно 48 часов на город. Gardens by the Bay ночью, Chinatown с рассветом, лучший laksa в Maxwell Food Centre и подъём на смотровую площадку Marina Bay Sands — всё это реально уместить в двое суток, если не тратить нервы на очереди в аэропорту.',
    author: 'Виктория',
    date: formatDate(daysAgo(5)),
    imageDataUrl: '',
    ratings: [5, 4, 5],
    status: 'published',
  },
  {
    id: 'seed-3',
    title: 'Шотландия в октябре: туман, вереск и правильный виски',
    body: 'Октябрь — лучшее время для Шотландии. Туристов мало, хайленды окрашены в золото и багрянец, а в каждом пабе тебя угощают историями не хуже, чем виски. Я летела через Эдинбург, и весь маршрут — замок, Loch Ness, Glencoe, Isle of Skye — занял ровно 10 дней. Natalia\'s Birds помогла зарезервировать место ещё летом, что в октябре оказалось просто незаменимым: рейсы были под завязку.',
    author: 'Дарья',
    date: formatDate(daysAgo(9)),
    imageDataUrl: '',
    ratings: [5, 5, 5, 4, 5],
    status: 'published',
  },
];

/* Utility functions */

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}.${m}.${date.getFullYear()}`;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function generateId() {
  return `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function truncate(text, maxLen) {
  return text.length <= maxLen ? text : text.slice(0, maxLen).trimEnd() + '…';
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function pluralRu(n) {
  if (n % 100 >= 11 && n % 100 <= 19) return 'ов';
  if (n % 10 === 1) return '';
  if (n % 10 >= 2 && n % 10 <= 4) return 'а';
  return 'ов';
}

/* Blog store */

const BlogStore = {
  getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) { /* fall through */ }
    this.saveAll(SEED_ARTICLES);
    return [...SEED_ARTICLES];
  },

  /** @returns {Article[]} Only published articles. */
  getPublished() {
  return this.getAll().filter((a) => a.status === 'published' && a.type !== 'review');
  },

  /** @returns {Article[]} Only pending articles, oldest first. */
  getPending() {
    return this.getAll().filter((a) => a.status === 'pending').reverse();
  },

  saveAll(articles) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  },

  getById(id) {
    return this.getAll().find((a) => a.id === id);
  },

  /** Add a new article. Status is set by the caller. */
  add(article) {
    const all = this.getAll();
    all.unshift(article);
    this.saveAll(all);
  },

  /** Approve a pending article → published. */
  approve(id) {
    const all = this.getAll();
    const article = all.find((a) => a.id === id);
    if (article) {
      article.status = 'published';
      this.saveAll(all);
    }
  },

  /** Reject and permanently delete a pending article. */
  reject(id) {
    this.saveAll(this.getAll().filter((a) => a.id !== id));
  },

  /** Delete any article (admin). */
  remove(id) {
    this.saveAll(this.getAll().filter((a) => a.id !== id));
  },

  addRating(id, rating) {
    const all = this.getAll();
    const article = all.find((a) => a.id === id);
    if (article) {
      article.ratings.push(rating);
      this.saveAll(all);
    }
  },
};

/* Admin session */

const AdminSession = {
  isActive() {
    return localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
  },

  /** @returns {boolean} True if password matched. */
  login(password) {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_SESSION_KEY, 'true');
      return true;
    }
    return false;
  },

  logout() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  },
};

/* Mini calendar */

class MiniCalendar {
  constructor(containerId, today, markedDates = []) {
    this.container   = document.getElementById(containerId);
    this.today       = today;
    this.markedDates = markedDates;
    this.current     = new Date(today.getFullYear(), today.getMonth(), 1);
    if (!this.container) return;
    this.render();
  }

  render() {
    const year        = this.current.getFullYear();
    const month       = this.current.getMonth();
    const firstDow    = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = `
      <div class="calendar__header">
        <button class="calendar__nav-btn" id="calPrev" aria-label="Previous month">&#8592;</button>
        <span class="calendar__month-name">${MONTH_NAMES_RU[month]} ${year}</span>
        <button class="calendar__nav-btn" id="calNext" aria-label="Next month">&#8594;</button>
      </div>
      <div class="calendar__grid">
        ${DAY_NAMES_SHORT.map((n) => `<div class="calendar__day-name">${n}</div>`).join('')}
        ${Array(firstDow).fill('<div class="calendar__day calendar__day--empty"></div>').join('')}
    `;

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDate(new Date(year, month, d));
      const isToday = d === this.today.getDate() && month === this.today.getMonth() && year === this.today.getFullYear();
      const hasPost = this.markedDates.includes(dateStr);
      let cls = 'calendar__day';
      if (isToday) cls += ' calendar__day--today';
      if (hasPost) cls += ' calendar__day--has-post';
      html += `<div class="${cls}">${d}</div>`;
    }

    html += '</div>';
    this.container.innerHTML = html;
    document.getElementById('calPrev')?.addEventListener('click', () => this._navigate(-1));
    document.getElementById('calNext')?.addEventListener('click', () => this._navigate(1));
  }

  _navigate(delta) {
    this.current.setMonth(this.current.getMonth() + delta);
    this.render();
  }
}

/* Blog feed */

function renderBlogFeed(containerId, articles) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!articles.length) {
    container.innerHTML = '<p class="blog-feed__empty">Статей пока нет. Будьте первым!</p>';
    return;
  }
  container.innerHTML = articles.map(buildArticleCardHTML).join('');
}

function buildArticleCardHTML(article) {
  const avgRating   = average(article.ratings);
  const ratingCount = article.ratings.length;
  const imageHTML   = article.imageDataUrl
    ? `<img class="article-card__image" src="${article.imageDataUrl}" alt="" loading="lazy" />`
    : '';

  return `
    <article class="article-card">
      ${imageHTML}
      <div class="article-card__body">
        <div class="article-card__meta">
          <span class="article-card__author">${escapeHtml(article.author)}</span>
          <span class="article-card__date">${article.date}</span>
        </div>
        <h2 class="article-card__title">${escapeHtml(article.title)}</h2>
        <p class="article-card__excerpt">${escapeHtml(truncate(article.body, EXCERPT_LENGTH))}</p>
        <div class="article-card__footer">
          <div class="rating-display">
            <div class="rating-display__stars">${buildStarsHTML(avgRating, 5)}</div>
            <span>${ratingCount ? avgRating.toFixed(1) + ' / 5' : 'нет оценок'}</span>
          </div>
          <a class="btn btn--primary" href="blog-article.html?id=${article.id}">Далее &rarr;</a>
        </div>
      </div>
    </article>
  `;
}

function buildStarsHTML(value, total) {
  return Array.from({ length: total }, (_, i) => {
    const cls = i < Math.round(value) ? 'star-icon star-icon--filled' : 'star-icon';
    return `<span class="${cls}" aria-hidden="true">&#9733;</span>`;
  }).join('');
}

/* Recent list */

function renderRecentList(containerId, articles, limit = 6) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = articles.slice(0, limit).map((a) => `
    <li class="recent-list__item">
      <a class="recent-list__link" href="blog-article.html?id=${a.id}">${escapeHtml(a.title)}</a>
      <span class="recent-list__date">${a.date}</span>
    </li>
  `).join('');
}

/* Post form */

function initPostForm(formId) {
  const form        = document.getElementById(formId);
  const errorEl     = document.getElementById('postFormError');
  const fileInput   = document.getElementById('postImages');
  const filePreview = document.getElementById('filePreview');
  if (!form) return;

  fileInput?.addEventListener('change', () => {
    if (!filePreview) return;
    filePreview.innerHTML = Array.from(fileInput.files)
      .map((f) => `<li title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</li>`)
      .join('');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title  = document.getElementById('postTitle')?.value.trim();
    const body   = document.getElementById('postBody')?.value.trim();
    const author = document.getElementById('postAuthor')?.value.trim();
    const error  = validatePostForm({ title, body, author });

    if (error) {
      if (errorEl) errorEl.textContent = error;
      return;
    }
    if (errorEl) errorEl.textContent = '';

    const imageDataUrl = fileInput?.files[0]
      ? await readFileAsDataURL(fileInput.files[0])
      : '';

    BlogStore.add({
      id: generateId(),
      title,
      body,
      author,
      date: formatDate(new Date()),
      imageDataUrl,
      ratings: [],
      status: 'pending',
    });

    form.reset();
    if (filePreview) filePreview.innerHTML = '';
    showSubmitSuccess();

    // Refresh moderation panel if admin is watching
    if (AdminSession.isActive()) renderAdminPanel('adminPanel');
  });
}

function showSubmitSuccess() {
  const el = document.getElementById('postFormError');
  if (!el) return;
  el.style.color = 'var(--clr-plum)';
  el.textContent = '✓ Статья отправлена на модерацию. Спасибо!';
  setTimeout(() => { el.textContent = ''; el.style.color = ''; }, 4000);
}

function validatePostForm({ title, body, author }) {
  if (!title)  return 'Пожалуйста, укажите заголовок статьи.';
  if (!body)   return 'Пожалуйста, напишите текст статьи.';
  if (!author) return 'Пожалуйста, укажите ваше имя или никнейм.';
  return null;
}

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

/* Admin login */

function initAdminWidget(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (AdminSession.isActive()) {
    container.innerHTML = `
      <div class="admin-widget admin-widget--active">
        <span class="admin-widget__badge">👑 Режим администратора</span>
        <button class="btn btn--outline admin-widget__logout" id="adminLogout">Выйти</button>
      </div>
    `;
    document.getElementById('adminLogout')?.addEventListener('click', () => {
      AdminSession.logout();
      location.reload();
    });
  } else {
    container.innerHTML = `
      <div class="admin-widget">
        <button class="admin-widget__login-btn" id="adminLoginToggle">🔐 Войти как администратор</button>
        <form class="admin-widget__form" id="adminLoginForm" style="display:none;" novalidate>
          <input
            class="post-form__input"
            id="adminPassword"
            type="password"
            placeholder="Введите пароль"
            autocomplete="current-password"
          />
          <p class="post-form__error" id="adminLoginError" role="alert"></p>
          <button class="btn btn--primary" type="submit">Войти</button>
        </form>
      </div>
    `;

    document.getElementById('adminLoginToggle')?.addEventListener('click', () => {
      const form      = document.getElementById('adminLoginForm');
      const isVisible = form.style.display !== 'none';
      form.style.display = isVisible ? 'none' : 'flex';
      document.getElementById('adminPassword')?.focus();
    });

    document.getElementById('adminLoginForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const pw      = document.getElementById('adminPassword')?.value;
      const errorEl = document.getElementById('adminLoginError');
      if (AdminSession.login(pw)) {
        location.reload();
      } else {
        if (errorEl) errorEl.textContent = 'Неверный пароль.';
      }
    });
  }
}

/* Admin panel */

function renderAdminPanel(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const pending        = BlogStore.getPending();
  const pendingArticles = pending.filter((p) => p.type !== 'review');
  const pendingReviews  = pending.filter((p) => p.type === 'review');
  const total           = pending.length;

  if (!total) {
    container.innerHTML = `
      <div class="admin-panel">
        <h2 class="admin-panel__heading">Модерация</h2>
        <p class="admin-panel__empty">Нет материалов, ожидающих проверки.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="admin-panel">
      <h2 class="admin-panel__heading">
        Модерация
        <span class="admin-panel__count">${total}</span>
      </h2>

      <!-- Tabs -->
      <div class="admin-tabs" role="tablist">
        <button
          class="admin-tabs__tab admin-tabs__tab--active"
          id="tabArticles"
          role="tab"
          aria-selected="true"
          aria-controls="panelArticles"
        >
          Статьи
          ${pendingArticles.length ? `<span class="admin-panel__count">${pendingArticles.length}</span>` : ''}
        </button>
        <button
          class="admin-tabs__tab"
          id="tabReviews"
          role="tab"
          aria-selected="false"
          aria-controls="panelReviews"
        >
          Отзывы
          ${pendingReviews.length ? `<span class="admin-panel__count admin-panel__count--review">${pendingReviews.length}</span>` : ''}
        </button>
      </div>

      <!-- Articles panel -->
      <div class="admin-panel__list" id="panelArticles" role="tabpanel" aria-labelledby="tabArticles">
        ${pendingArticles.length
          ? pendingArticles.map(buildPendingCardHTML).join('')
          : '<p class="admin-panel__empty">Нет статей на проверке.</p>'}
      </div>

      <!-- Reviews panel -->
      <div class="admin-panel__list" id="panelReviews" role="tabpanel" aria-labelledby="tabReviews" style="display:none;">
        ${pendingReviews.length
          ? pendingReviews.map(buildPendingReviewHTML).join('')
          : '<p class="admin-panel__empty">Нет отзывов на проверке.</p>'}
      </div>
    </div>
  `;

  // Tab switching
  container.querySelector('#tabArticles')?.addEventListener('click', () => {
    container.querySelector('#tabArticles').classList.add('admin-tabs__tab--active');
    container.querySelector('#tabArticles').setAttribute('aria-selected', 'true');
    container.querySelector('#tabReviews').classList.remove('admin-tabs__tab--active');
    container.querySelector('#tabReviews').setAttribute('aria-selected', 'false');
    container.querySelector('#panelArticles').style.display = '';
    container.querySelector('#panelReviews').style.display  = 'none';
  });

  container.querySelector('#tabReviews')?.addEventListener('click', () => {
    container.querySelector('#tabReviews').classList.add('admin-tabs__tab--active');
    container.querySelector('#tabReviews').setAttribute('aria-selected', 'true');
    container.querySelector('#tabArticles').classList.remove('admin-tabs__tab--active');
    container.querySelector('#tabArticles').setAttribute('aria-selected', 'false');
    container.querySelector('#panelReviews').style.display = '';
    container.querySelector('#panelArticles').style.display = 'none';
  });

  // Approve / reject listeners
  container.querySelectorAll('[data-approve]').forEach((btn) => {
    btn.addEventListener('click', () => {
      BlogStore.approve(btn.dataset.approve);
      refreshBlogPage();
    });
  });

  container.querySelectorAll('[data-reject]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const label = btn.closest('.pending-review-card') ? 'отзыв' : 'статью';
      if (confirm(`Удалить ${label} безвозвратно?`)) {
        BlogStore.reject(btn.dataset.reject);
        refreshBlogPage();
      }
    });
  });
}

/** Build pending article card HTML (unchanged from before). */
function buildPendingCardHTML(article) {
  const imageHTML = article.imageDataUrl
    ? `<img class="pending-card__image" src="${article.imageDataUrl}" alt="" />`
    : '';

  return `
    <div class="pending-card" id="pending-${article.id}">
      ${imageHTML}
      <div class="pending-card__body">
        <div class="pending-card__meta">
          <span class="pending-card__author">${escapeHtml(article.author)}</span>
          <span class="pending-card__date">${article.date}</span>
        </div>
        <h3 class="pending-card__title">${escapeHtml(article.title)}</h3>
        <p class="pending-card__excerpt">${escapeHtml(truncate(article.body, 180))}</p>
        <div class="pending-card__full" id="full-${article.id}" style="display:none;">
          <p class="pending-card__full-text">${escapeHtml(article.body)}</p>
        </div>
        <button class="admin-panel__read-btn" data-toggle="${article.id}">Читать полностью ▾</button>
      </div>
      <div class="pending-card__actions">
        <button class="btn admin-panel__approve" data-approve="${article.id}">✓ Опубликовать</button>
        <button class="btn admin-panel__reject"  data-reject="${article.id}">✕ Отклонить</button>
      </div>
    </div>
  `;
}

/** Build pending review card HTML. */
function buildPendingReviewHTML(review) {
  const stars = Array.from({ length: 5 }, (_, i) =>
    `<span class="${i < review.rating ? 'star-icon star-icon--filled' : 'star-icon'}" aria-hidden="true">&#9733;</span>`
  ).join('');

  const recommendText = review.recommend === 'yes' ? '👍 Да, порекомендует' : '👎 Нет';

  return `
    <div class="pending-review-card" id="pending-${review.id}">
      <div class="pending-review-card__header">
        <span class="pending-card__author">${escapeHtml(review.author)}</span>
        <span class="pending-card__date">${review.date}</span>
        <div class="pending-review-card__stars">${stars}</div>
      </div>
      <p class="pending-card__excerpt">${escapeHtml(review.body)}</p>
      <p class="pending-review-card__recommend">${recommendText}</p>
      <div class="pending-card__actions" style="padding: 0 0 0.5rem;">
        <button class="btn admin-panel__approve" data-approve="${review.id}">✓ Опубликовать</button>
        <button class="btn admin-panel__reject"  data-reject="${review.id}">✕ Отклонить</button>
      </div>
    </div>
  `;
}

/* Re-render all dynamic parts without full page reload */
function refreshBlogPage() {
  const published = BlogStore.getPublished();
  renderBlogFeed('blogFeed', published);
  renderRecentList('recentList', published);
  new MiniCalendar('calendar', new Date(), published.map((a) => a.date));
  if (AdminSession.isActive()) renderAdminPanel('adminPanel');
}

/*Rating widget */

function initRatingWidget(containerId, articleId) {
  const container      = document.getElementById(containerId);
  if (!container) return;
  const starsContainer = container.querySelector('.rating-widget__stars');
  const feedbackEl     = container.querySelector('.rating-widget__feedback');
  const avgEl          = container.querySelector('.rating-widget__avg');
  const stars          = Array.from(starsContainer?.querySelectorAll('.rating-widget__star') ?? []);
  if (!stars.length) return;

  const MESSAGES = ['', 'Плохо', 'Так себе', 'Нормально', 'Хорошо', 'Отлично!'];

  const highlightUpTo  = (i) => stars.forEach((s, j) => s.classList.toggle('is-hovered', j <= i));
  const clearHighlight = ()  => stars.forEach((s) => s.classList.remove('is-hovered'));

  const updateAvg = () => {
    const a = BlogStore.getById(articleId);
    if (!a || !avgEl) return;
    const avg = average(a.ratings);
    avgEl.textContent = a.ratings.length
      ? `Средняя оценка: ${avg.toFixed(1)} / 5 (${a.ratings.length} голос${pluralRu(a.ratings.length)})`
      : '';
  };

  stars.forEach((star, i) => {
    star.addEventListener('mouseenter', () => highlightUpTo(i));
    star.addEventListener('mouseleave', clearHighlight);
    star.addEventListener('click', () => {
      BlogStore.addRating(articleId, i + 1);
      stars.forEach((s, j) => s.classList.toggle('is-selected', j <= i));
      if (feedbackEl) feedbackEl.textContent = `Вы поставили: ${MESSAGES[i + 1]}`;
      stars.forEach((s) => { s.removeEventListener('mouseenter', highlightUpTo); s.style.cursor = 'default'; });
      updateAvg();
    });
  });

  updateAvg();
}

/* Article page */

function initArticlePage() {
  const container = document.getElementById('articlePage');
  if (!container) return;

  const id      = new URLSearchParams(window.location.search).get('id');
  const article = id ? BlogStore.getById(id) : null;

  if (!article) {
    container.innerHTML = `
      <a class="article-page__back" href="blog.html">&larr; Назад в блог</a>
      <p style="font-family:var(--font-body);color:var(--clr-slate);">Статья не найдена.</p>
    `;
    return;
  }

  document.title = `Natalia's Birds — ${article.title}`;

  const imageHTML      = article.imageDataUrl
    ? `<img class="article-page__image" src="${article.imageDataUrl}" alt="" />`
    : '';
  const adminActionsHTML = AdminSession.isActive() ? `
    <div class="article-page__admin-actions">
      <button class="btn admin-panel__reject" id="deleteArticleBtn">🗑 Удалить статью</button>
    </div>
  ` : '';
  const avg   = average(article.ratings);
  const count = article.ratings.length;

  container.innerHTML = `
    <a class="article-page__back" href="blog.html">&larr; Назад в блог</a>
    ${imageHTML}
    <div class="article-page__meta">
      <span class="article-page__author">${escapeHtml(article.author)}</span>
      <span class="article-page__date">${article.date}</span>
    </div>
    <h1 class="article-page__title">${escapeHtml(article.title)}</h1>
    <p class="article-page__body">${escapeHtml(article.body)}</p>
    ${adminActionsHTML}
    <div class="rating-widget" id="ratingWidget">
      <p class="rating-widget__heading">Оцените статью</p>
      <div class="rating-widget__stars" role="group">
        ${[1,2,3,4,5].map((n) => `<button class="rating-widget__star" aria-label="${n} из 5">&#9733;</button>`).join('')}
      </div>
      <p class="rating-widget__feedback" id="ratingFeedback"></p>
      <p class="rating-widget__avg" id="ratingAvg">
        ${count ? `Средняя оценка: ${avg.toFixed(1)} / 5 (${count} голос${pluralRu(count)})` : ''}
      </p>
    </div>
  `;

  const headerTitle = document.getElementById('articlePageTitle');
  if (headerTitle) headerTitle.textContent = article.title;

  initRatingWidget('ratingWidget', article.id);

  document.getElementById('deleteArticleBtn')?.addEventListener('click', () => {
    if (confirm('Удалить эту статью безвозвратно?')) {
      BlogStore.remove(article.id);
      window.location.href = 'blog.html';
    }
  });
}

/* Bootstrap */

document.addEventListener('DOMContentLoaded', () => {
  const isBlogPage    = !!document.getElementById('blogFeed');
  const isArticlePage = !!document.getElementById('articlePage');

  if (isBlogPage) {
    const published = BlogStore.getPublished();

    new MiniCalendar('calendar', new Date(), published.map((a) => a.date));
    renderBlogFeed('blogFeed', published);
    renderRecentList('recentList', published);
    initPostForm('postForm');
    initAdminWidget('adminWidget');

    if (AdminSession.isActive()) {
    renderAdminPanel('adminPanel');

    // If redirected from gallery after a new review, auto-switch to Reviews tab
    if (new URLSearchParams(window.location.search).get('newReview')) {
      setTimeout(() => {
        document.getElementById('tabReviews')?.click();
      }, 300);
    }
  }

    // Delegated toggle for "read full" inside pending cards
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-toggle]');
      if (!btn) return;
      const full = document.getElementById(`full-${btn.dataset.toggle}`);
      if (!full) return;
      const isOpen = full.style.display !== 'none';
      full.style.display = isOpen ? 'none' : 'block';
      btn.textContent    = isOpen ? 'Читать полностью ▾' : 'Свернуть ▴';
    });
  }

  if (isArticlePage) initArticlePage();
});

/* Exports */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatDate, daysAgo, truncate, average, escapeHtml,
    buildStarsHTML, validatePostForm, pluralRu,
    SEED_ARTICLES, AdminSession, BlogStore,
  };
}
