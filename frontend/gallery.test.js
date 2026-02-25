const { Carousel } = require('./gallery');

// ---- DOM fixture helpers ----

/**
 * Build a minimal carousel DOM with N slides.
 *
 * @param {object} opts
 * @param {number}  opts.slideCount  - How many slide divs to create.
 * @param {string}  opts.trackId
 * @param {string}  opts.prevBtnId
 * @param {string}  opts.nextBtnId
 * @param {string}  opts.dotsId
 */
function buildCarouselFixture({
  slideCount = 3,
  trackId    = 'track',
  prevBtnId  = 'prev',
  nextBtnId  = 'next',
  dotsId     = 'dots',
} = {}) {
  const slides = Array.from({ length: slideCount })
    .map(() => '<div class="slide"></div>')
    .join('');

  document.body.innerHTML = `
    <div id="${trackId}">${slides}</div>
    <button id="${prevBtnId}"></button>
    <button id="${nextBtnId}"></button>
    <div id="${dotsId}"></div>
  `;
}

/**
 * Create a Carousel instance with default test IDs.
 *
 * @param {object} [overrides] - Any Carousel config overrides.
 * @returns {Carousel}
 */
function makeCarousel(overrides = {}) {
  return new Carousel({
    trackId:   'track',
    prevBtnId: 'prev',
    nextBtnId: 'next',
    dotsId:    'dots',
    direction: 'horizontal',
    ...overrides,
  });
}

// ---- Clean DOM between tests ----
beforeEach(() => {
  document.body.innerHTML = '';
});


// Construction & initial state


describe('Carousel — construction', () => {
  test('starts at index 0', () => {
    buildCarouselFixture();
    const carousel = makeCarousel();
    expect(carousel.getIndex()).toBe(0);
  });

  test('does not throw when trackId does not exist in DOM', () => {
    document.body.innerHTML = '';
    expect(() => new Carousel({ trackId: 'missing', prevBtnId: 'x', nextBtnId: 'y', dotsId: 'z' })).not.toThrow();
  });

  test('creates the correct number of dot buttons', () => {
    buildCarouselFixture({ slideCount: 4 });
    makeCarousel();
    const dots = document.querySelectorAll('.dot');
    expect(dots.length).toBe(4);
  });

  test('first dot has is-active class on init', () => {
    buildCarouselFixture({ slideCount: 3 });
    makeCarousel();
    const dots = document.querySelectorAll('.dot');
    expect(dots[0].classList.contains('is-active')).toBe(true);
    expect(dots[1].classList.contains('is-active')).toBe(false);
  });

  test('sets initial horizontal transform to translateX(0%)', () => {
    buildCarouselFixture();
    const carousel = makeCarousel({ direction: 'horizontal' });
    expect(document.getElementById('track').style.transform).toBe('translateX(-0%)');
  });

  test('sets initial vertical transform to translateY(0%)', () => {
    buildCarouselFixture();
    const carousel = makeCarousel({ direction: 'vertical' });
    expect(document.getElementById('track').style.transform).toBe('translateY(-0%)');
  });
});


// goTo


describe('Carousel — goTo', () => {
  test('moves to the specified index', () => {
    buildCarouselFixture({ slideCount: 3 });
    const carousel = makeCarousel();
    carousel.goTo(2);
    expect(carousel.getIndex()).toBe(2);
  });

  test('wraps around to last slide when going before index 0', () => {
    buildCarouselFixture({ slideCount: 3 });
    const carousel = makeCarousel();
    carousel.goTo(-1);
    expect(carousel.getIndex()).toBe(2);
  });

  test('wraps around to index 0 when going past last slide', () => {
    buildCarouselFixture({ slideCount: 3 });
    const carousel = makeCarousel();
    carousel.goTo(3);
    expect(carousel.getIndex()).toBe(0);
  });

  test('updates the active dot', () => {
    buildCarouselFixture({ slideCount: 3 });
    const carousel = makeCarousel();
    carousel.goTo(1);
    const dots = document.querySelectorAll('.dot');
    expect(dots[1].classList.contains('is-active')).toBe(true);
    expect(dots[0].classList.contains('is-active')).toBe(false);
  });

  test('sets correct horizontal CSS transform', () => {
    buildCarouselFixture({ slideCount: 3 });
    const carousel = makeCarousel({ direction: 'horizontal' });
    carousel.goTo(2);
    expect(document.getElementById('track').style.transform).toBe('translateX(-200%)');
  });

  test('sets correct vertical CSS transform', () => {
    buildCarouselFixture({ slideCount: 3 });
    const carousel = makeCarousel({ direction: 'vertical' });
    carousel.goTo(1);
    expect(document.getElementById('track').style.transform).toBe('translateY(-100%)');
  });
});


// next / prev


describe('Carousel — next', () => {
  test('advances index by 1', () => {
    buildCarouselFixture({ slideCount: 3 });
    const carousel = makeCarousel();
    carousel.next();
    expect(carousel.getIndex()).toBe(1);
  });

  test('wraps from last slide back to 0', () => {
    buildCarouselFixture({ slideCount: 3 });
    const carousel = makeCarousel();
    carousel.goTo(2);
    carousel.next();
    expect(carousel.getIndex()).toBe(0);
  });
});

describe('Carousel — prev', () => {
  test('decreases index by 1', () => {
    buildCarouselFixture({ slideCount: 3 });
    const carousel = makeCarousel();
    carousel.goTo(2);
    carousel.prev();
    expect(carousel.getIndex()).toBe(1);
  });

  test('wraps from index 0 back to last slide', () => {
    buildCarouselFixture({ slideCount: 3 });
    const carousel = makeCarousel();
    carousel.prev();
    expect(carousel.getIndex()).toBe(2);
  });
});


// Button click integration


describe('Carousel — button clicks', () => {
  test('clicking next button advances the carousel', () => {
    buildCarouselFixture({ slideCount: 3 });
    const carousel = makeCarousel();
    document.getElementById('next').click();
    expect(carousel.getIndex()).toBe(1);
  });

  test('clicking prev button goes back', () => {
    buildCarouselFixture({ slideCount: 3 });
    const carousel = makeCarousel();
    carousel.goTo(2);
    document.getElementById('prev').click();
    expect(carousel.getIndex()).toBe(1);
  });

  test('clicking a dot navigates to that slide', () => {
    buildCarouselFixture({ slideCount: 3 });
    const carousel = makeCarousel();
    const dots = document.querySelectorAll('.dot');
    dots[2].click();
    expect(carousel.getIndex()).toBe(2);
  });
});
