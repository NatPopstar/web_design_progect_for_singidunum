
/**
 * @typedef {object} City
 * @property {string} name    - City name.
 * @property {string} airport - Airport name / code.
 */

/**
 * @typedef {object} Destination
 * @property {string} id          - Matches data-id on the card element.
 * @property {string} title       - Country name.
 * @property {string} description - Short paragraph about the destination.
 * @property {City[]} cities      - List of partner cities with airports.
 * @property {string} mapSrc      - Google Maps embed URL.
 */

/** @type {Destination[]} */
const DESTINATIONS = [
  {
    id: 'usa',
    title: 'USA',
    description:
      'The USA is a vast country with an incredible variety of landscapes, from the canyons of Arizona to the beaches of Florida. Natalia\'s Birds partners with leading American carriers and guarantees you a seat on any of the popular routes.',
    cities: [
      { name: 'Нью-Йорк',    airport: 'JFK — John F. Kennedy International' },
      { name: 'Лос-Анджелес', airport: 'LAX — Los Angeles International' },
      { name: 'Майами',       airport: 'MIA — Miami International' },
      { name: 'Чикаго',       airport: 'ORD — O\'Hare International' },
    ],
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25000000!2d-98.5795!3d39.8283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54eab584e432360b%3A0x1c3bb99243deb742!2sUnited%20States!5e0!3m2!1sen!2srs!4v1700000000001',
  },
  {
    id: 'canada',
    title: 'Канада',
    description:
      'Канада покоряет своими природными чудесами — Ниагарским водопадом, Скалистыми горами и бескрайними лесами. Мы бронируем билеты в крупнейшие города страны с гарантированным местом на борту.',
    cities: [
      { name: 'Торонто',   airport: 'YYZ — Toronto Pearson International' },
      { name: 'Ванкувер',  airport: 'YVR — Vancouver International' },
      { name: 'Монреаль',  airport: 'YUL — Montréal–Trudeau International' },
      { name: 'Калгари',   airport: 'YYC — Calgary International' },
    ],
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d20000000!2d-96.8!3d56.13!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4b0d03d337cc6ad9%3A0x9968b72aa2438fa5!2sCanada!5e0!3m2!1sen!2srs!4v1700000000002',
  },
  {
    id: 'ireland',
    title: 'Ирландия',
    description:
      'Изумрудный остров с замками, утёсами Мохер и гостеприимными пабами. Ирландия — идеальное направление для тех, кто хочет объединить природу, историю и культуру. Мы работаем с Ryanair и Aer Lingus.',
    cities: [
      { name: 'Дублин',  airport: 'DUB — Dublin Airport' },
      { name: 'Корк',    airport: 'ORK — Cork Airport' },
      { name: 'Шеннон',  airport: 'SNN — Shannon Airport' },
    ],
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000000!2d-8.24!3d53.41!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x485e5960a76bff2d%3A0xcd9a83e13f0db4b!2sIreland!5e0!3m2!1sen!2srs!4v1700000000003',
  },
  {
    id: 'england',
    title: 'Англия',
    description:
      'Лондон, Оксфорд, Озёрный край — Англия сочетает в себе богатую историю и современный динамизм. Natalia\'s Birds обеспечивает прямые и стыковочные рейсы в крупнейшие аэропорты страны.',
    cities: [
      { name: 'Лондон',      airport: 'LHR — Heathrow International' },
      { name: 'Лондон',      airport: 'LGW — Gatwick Airport' },
      { name: 'Манчестер',   airport: 'MAN — Manchester Airport' },
      { name: 'Бирмингем',   airport: 'BHX — Birmingham Airport' },
    ],
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000000!2d-1.17!3d52.36!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a00baf21de75%3A0x52963a5addd52a99!2sEngland%2C%20UK!5e0!3m2!1sen!2srs!4v1700000000004',
  },
  {
    id: 'australia',
    title: 'Австралия',
    description:
      'Сиднейская опера, Большой барьерный риф, красные пустыни — Австралия поражает масштабом и разнообразием. Длинный перелёт превращается в удовольствие, когда место забронировано заранее.',
    cities: [
      { name: 'Сидней',    airport: 'SYD — Kingsford Smith International' },
      { name: 'Мельбурн',  airport: 'MEL — Melbourne Airport' },
      { name: 'Брисбен',   airport: 'BNE — Brisbane Airport' },
      { name: 'Перт',      airport: 'PER — Perth Airport' },
    ],
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15000000!2d133.7!3d-25.27!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2b2bfd076787c5df%3A0x538267a1955b1352!2sAustralia!5e0!3m2!1sen!2srs!4v1700000000005',
  },
  {
    id: 'newzealand',
    title: 'Новая Зеландия',
    description:
      'Горные пейзажи, фьорды и маорийская культура делают Новую Зеландию одним из самых удивительных мест на Земле. Мы сотрудничаем с Air New Zealand и обеспечим вам комфортный перелёт.',
    cities: [
      { name: 'Окленд',       airport: 'AKL — Auckland Airport' },
      { name: 'Веллингтон',   airport: 'WLG — Wellington Airport' },
      { name: 'Крайстчерч',   airport: 'CHC — Christchurch Airport' },
    ],
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000000!2d172.5!3d-41.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6d2d8de2ebab9597%3A0xa00ef63a213b470!2sNew%20Zealand!5e0!3m2!1sen!2srs!4v1700000000006',
  },
  {
    id: 'malta',
    title: 'Мальта',
    description:
      'Солнечная Мальта — жемчужина Средиземноморья с рыцарскими крепостями, лазурными лагунами и вкуснейшей кухней. Короткий перелёт — и вы в сказке. Идеально для семейного отдыха.',
    cities: [
      { name: 'Валлетта',  airport: 'MLA — Malta International Airport' },
    ],
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d200000!2d14.37!3d35.94!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x130e45281d8647c5%3A0xa2b35e15d6d37d29!2sMalta!5e0!3m2!1sen!2srs!4v1700000000007',
  },
  {
    id: 'singapore',
    title: 'Сингапур',
    description:
      'Сингапур — город будущего, где небоскрёбы соседствуют с тропическими садами. Гастрономия, шопинг, культура — всё на высшем уровне. Natalia\'s Birds работает с Singapore Airlines и Scoot.',
    cities: [
      { name: 'Сингапур',  airport: 'SIN — Changi Airport' },
    ],
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d200000!2d103.8!3d1.35!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da11238a8b9375%3A0x887869cf52abf5c4!2sSingapore!5e0!3m2!1sen!2srs!4v1700000000008',
  },
  {
    id: 'scotland',
    title: 'Шотландия',
    description:
      'Горные замки, туманные хайленды и знаменитый виски — Шотландия окутает вас особой атмосферой. Мы бронируем билеты в Эдинбург, Глазго и другие города через ведущих европейских перевозчиков.',
    cities: [
      { name: 'Эдинбург',  airport: 'EDI — Edinburgh Airport' },
      { name: 'Глазго',    airport: 'GLA — Glasgow Airport' },
      { name: 'Инвернесс', airport: 'INV — Inverness Airport' },
    ],
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1500000!2d-4.2!3d56.8!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4886405e87bb8b51%3A0x5cfe1aeb4c3dc3ac!2sScotland%2C%20UK!5e0!3m2!1sen!2srs!4v1700000000009',
  },
];

/**
 * Find a destination object by its id.
 *
 * @param {string} id
 * @returns {Destination|undefined}
 */
function getDestinationById(id) {
  return DESTINATIONS.find((d) => d.id === id);
}

/**
 * Manages the destination detail modal.
 * Handles open, close, content population, and keyboard/backdrop interactions.
 */
class DestinationModal {
  /**
   * @param {object} selectors
   * @param {string} selectors.backdropId   - id of the backdrop element.
   * @param {string} selectors.closeButtonId - id of the close button.
   * @param {string} selectors.titleId       - id of the title element.
   * @param {string} selectors.descriptionId - id of the description element.
   * @param {string} selectors.citiesListId  - id of the cities <ul>.
   * @param {string} selectors.mapId         - id of the <iframe> map.
   */
  constructor({ backdropId, closeButtonId, titleId, descriptionId, citiesListId, mapId }) {
    this.backdrop    = document.getElementById(backdropId);
    this.closeButton = document.getElementById(closeButtonId);
    this.titleEl     = document.getElementById(titleId);
    this.descriptionEl = document.getElementById(descriptionId);
    this.citiesListEl  = document.getElementById(citiesListId);
    this.mapEl         = document.getElementById(mapId);

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

  /** @returns {boolean} Whether the modal is currently visible. */
  isOpen() {
    return this.backdrop.classList.contains('is-open');
  }

  /**
   * Populate the modal with destination data and show it.
   *
   * @param {Destination} destination
   */
  open(destination) {
    this._populate(destination);
    this.backdrop.classList.add('is-open');
    this.backdrop.setAttribute('aria-hidden', 'false');
    this.closeButton?.focus();
  }

  /** Hide the modal and clear the map src to stop the iframe loading. */
  close() {
    this.backdrop.classList.remove('is-open');
    this.backdrop.setAttribute('aria-hidden', 'true');
    // clear map to stop background network requests
    if (this.mapEl) this.mapEl.src = '';
  }

  /**
   * Fill modal elements with destination content.
   *
   * @param {Destination} destination
   */
  _populate(destination) {
    if (this.titleEl)       this.titleEl.textContent = destination.title;
    if (this.descriptionEl) this.descriptionEl.textContent = destination.description;

    if (this.citiesListEl) {
      this.citiesListEl.innerHTML = destination.cities
        .map((city) => `<li><strong>${city.name}</strong> — ${city.airport}</li>`)
        .join('');
    }

    if (this.mapEl) this.mapEl.src = destination.mapSrc;
  }
}

/**
 * Attach click (and Enter/Space keyboard) listeners to every destination card.
 *
 * @param {DestinationModal} modal - The modal instance to open on card activation.
 */
function initDestinationCards(modal) {
  const cards = document.querySelectorAll('.destination-card');

  cards.forEach((card) => {
    const activateCard = () => {
      const destination = getDestinationById(card.dataset.id);
      if (destination) modal.open(destination);
    };

    card.addEventListener('click', activateCard);

    // Allow keyboard activation with Enter or Space
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activateCard();
      }
    });
  });
}

// ---- Bootstrap on DOMContentLoaded ----
document.addEventListener('DOMContentLoaded', () => {
  const modal = new DestinationModal({
    backdropId:    'modalBackdrop',
    closeButtonId: 'modalClose',
    titleId:       'modalTitle',
    descriptionId: 'modalDescription',
    citiesListId:  'modalCitiesList',
    mapId:         'modalMap',
  });

  initDestinationCards(modal);
});

// Export for unit testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DESTINATIONS, getDestinationById, DestinationModal, initDestinationCards };
}
