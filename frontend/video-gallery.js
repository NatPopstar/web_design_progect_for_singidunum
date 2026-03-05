/**
 * video-gallery.js
 * Manages the video grid and modal on video-gallery.html.
 *
 * Each VIDEO entry holds a YouTube embed URL and a short
 * "client story" description. The VideoModal class handles
 * open/close and stops the video when the modal is closed.
 */

/**
 * @typedef {object} VideoEntry
 * @property {string} id          - Matches data-id on the card element.
 * @property {string} title       - Country name used as modal heading.
 * @property {string} description - Short "client story" paragraph.
 * @property {string} embedUrl    - YouTube embed URL (without autoplay).
 */

/** @type {VideoEntry[]} */
const VIDEOS = [
  {
    id: 'usa',
    title: 'USA',
    description:
      'Our client, Mikhail, flew to the USA via New York and decided to explore the West Coast: Los Angeles, the Grand Canyon, and Las Vegas. He captured this journey on camera — see what real America looks like through the eyes of a traveler from Belgrade.',
    embedUrl: 'https://www.youtube.com/embed/oNIMjCzM0WU',
  },
  {
    id: 'canada',
    title: 'Канада',
    description:
      'Юлия и её семья отправились к Ниагарскому водопаду и в Скалистые горы. Natalia\'s Birds заблаговременно зарезервировала четыре места на стыковочном рейсе — и поездка прошла без единой накладки. Смотрите их видеодневник.',
    embedUrl: 'https://www.youtube.com/embed/OFW6J8HQNUA',
  },
  {
    id: 'ireland',
    title: 'Ирландия',
    description:
      'Ольга мечтала об Ирландии с детства. Утёсы Мохер, замок Бунратти, дождливый Дублин и лучший Irish stew в маленьком пабе — всё это она сняла на телефон и смонтировала в это видео специально для нас.',
    embedUrl: 'https://www.youtube.com/embed/C6M3OMGCHkI',
  },
  {
    id: 'england',
    title: 'Англия',
    description:
      'Андрей провёл десять дней в Англии: Лондон, Оксфорд, Котсуолдс и Озёрный край. Билеты через Heathrow были зарезервированы за два месяца — ни одной проблемы при регистрации. Его влог уже набрал тысячи просмотров.',
    embedUrl: 'https://www.youtube.com/embed/3PHdpDmANgM',
  },
  {
    id: 'australia',
    title: 'Австралия',
    description:
      'Наташа и Сергей решились на перелёт в Австралию — и не пожалели ни секунды. Сидней, Большой барьерный риф и встреча с кенгуру в дикой природе. Длинный перелёт стал первой страницей их истории.',
    embedUrl: 'https://www.youtube.com/embed/sL7yUBn5s8s',
  },
  {
    id: 'newzealand',
    title: 'Новая Зеландия',
    description:
      'Денис снял Новую Зеландию с дрона: фьорды Милфорд-Саунд, долины Квинстауна и вулканическое плато. Natalia\'s Birds организовала перелёт с пересадкой в Сингапуре — всё прошло как по маслу.',
    embedUrl: 'https://www.youtube.com/embed/jTe8VFPUPiY',
  },
  {
    id: 'malta',
    title: 'Мальта',
    description:
      'Катя с подругами провели на Мальте две недели. Голубая лагуна острова Комино, старинный Мдина и ночная Валлетта — всё это уместилось в одно яркое видео, которым они поделились с нами.',
    embedUrl: 'https://www.youtube.com/embed/HWqHUqpNNGg',
  },
  {
    id: 'singapore',
    title: 'Сингапур',
    description:
      'Максим летел в Сингапур в командировку, но выкроил три дня для туризма. Gardens by the Bay, стритфуд на Lau Pa Sat и закат с Marina Bay Sands — в его видео всё это выглядит как из рекламы.',
    embedUrl: 'https://www.youtube.com/embed/DQrVDfTiimw',
  },
  {
    id: 'scotland',
    title: 'Шотландия',
    description:
      'Ирина поехала в Шотландию одна — с рюкзаком и фотоаппаратом. Эдинбургский замок, Лох-Несс в тумане и виски-тур по Speyside. Она говорит, что это лучшее путешествие в её жизни. Судите сами.',
    embedUrl: 'https://www.youtube.com/embed/6SyE9_8OLdQ',
  },
];

/* Helpers */

/**
 * Find a video entry by its id.
 * @param {string} id
 * @returns {VideoEntry|undefined}
 */
function getVideoById(id) {
  return VIDEOS.find((v) => v.id === id);
}

/**
 * Build a YouTube embed URL with autoplay enabled.
 * Autoplay is activated only when the modal opens so the video
 * starts immediately without user having to press play.
 *
 * @param {string} baseEmbedUrl - URL without query params.
 * @returns {string}
 */
function buildAutoplayUrl(baseEmbedUrl) {
  return `${baseEmbedUrl}?autoplay=1&rel=0`;
}

/* Video Modals */

/**
 * Manages the video modal: open, populate, close, stop video.
 */
class VideoModal {
  /**
   * @param {object} selectors
   * @param {string} selectors.backdropId    - id of the backdrop element.
   * @param {string} selectors.closeButtonId - id of the ✕ button.
   * @param {string} selectors.titleId       - id of the <h2> title element.
   * @param {string} selectors.descriptionId - id of the description <p>.
   * @param {string} selectors.iframeId      - id of the YouTube <iframe>.
   */
  constructor({ backdropId, closeButtonId, titleId, descriptionId, iframeId }) {
    this.backdrop    = document.getElementById(backdropId);
    this.closeButton = document.getElementById(closeButtonId);
    this.titleEl     = document.getElementById(titleId);
    this.descriptionEl = document.getElementById(descriptionId);
    this.iframeEl    = document.getElementById(iframeId);

    if (!this.backdrop) return;
    this._bindEvents();
  }

  /** Attach close button, backdrop click and Escape key listeners. */
  _bindEvents() {
    this.closeButton?.addEventListener('click', () => this.close());

    this.backdrop.addEventListener('click', (event) => {
      if (event.target === this.backdrop) this.close();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen()) this.close();
    });
  }

  /** @returns {boolean} */
  isOpen() {
    return this.backdrop.classList.contains('is-open');
  }

  /**
   * Populate the modal with a video entry and show it.
   * @param {VideoEntry} video
   */
  open(video) {
    this._populate(video);
    this.backdrop.classList.add('is-open');
    this.backdrop.setAttribute('aria-hidden', 'false');
    this.closeButton?.focus();
  }

  /**
   * Hide the modal and stop the video by clearing the iframe src.
   * Clearing src is the only reliable cross-browser way to stop
   * a YouTube iframe without the YouTube IFrame API.
   */
  close() {
    this.backdrop.classList.remove('is-open');
    this.backdrop.setAttribute('aria-hidden', 'true');
    if (this.iframeEl) this.iframeEl.src = '';
  }

  /**
   * Fill modal elements with video entry content.
   * @param {VideoEntry} video
   */
  _populate(video) {
    if (this.titleEl)       this.titleEl.textContent = video.title;
    if (this.descriptionEl) this.descriptionEl.textContent = video.description;
    if (this.iframeEl)      this.iframeEl.src = buildAutoplayUrl(video.embedUrl);
  }
}

/* Card installation */

/**
 * Attach click and keyboard listeners to every video card.
 * @param {VideoModal} modal
 */
function initVideoCards(modal) {
  const cards = document.querySelectorAll('.destination-card');

  cards.forEach((card) => {
    const activate = () => {
      const video = getVideoById(card.dataset.id);
      if (video) modal.open(video);
    };

    card.addEventListener('click', activate);

    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
  });
}

/* Bootstrap */

document.addEventListener('DOMContentLoaded', () => {
  const modal = new VideoModal({
    backdropId:    'videoModalBackdrop',
    closeButtonId: 'videoModalClose',
    titleId:       'videoModalTitle',
    descriptionId: 'videoModalDescription',
    iframeId:      'videoModalIframe',
  });

  initVideoCards(modal);
});

/* Exports */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VIDEOS, getVideoById, buildAutoplayUrl, VideoModal, initVideoCards };
}
