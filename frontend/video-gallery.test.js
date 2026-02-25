/**
 * video-gallery.test.js
 * Unit tests for video-gallery.js.
 *
 * Run with:  npx jest video-gallery.test.js
 * Requires:  npm install --save-dev jest jest-environment-jsdom
 *
 * In package.json add:
 *   "jest": { "testEnvironment": "jsdom" }
 */

const {
  VIDEOS,
  getVideoById,
  buildAutoplayUrl,
  VideoModal,
  initVideoCards,
} = require('./video-gallery');


// Helpers


function buildModalFixture() {
  document.body.innerHTML = `
    <div id="videoModalBackdrop" aria-hidden="true">
      <div id="videoModal">
        <button id="videoModalClose"></button>
        <h2 id="videoModalTitle"></h2>
        <p id="videoModalDescription"></p>
        <iframe id="videoModalIframe" src=""></iframe>
      </div>
    </div>
  `;
}

function makeModal() {
  return new VideoModal({
    backdropId:    'videoModalBackdrop',
    closeButtonId: 'videoModalClose',
    titleId:       'videoModalTitle',
    descriptionId: 'videoModalDescription',
    iframeId:      'videoModalIframe',
  });
}

beforeEach(() => {
  document.body.innerHTML = '';
});


// VIDEOS data integrity


describe('VIDEOS data', () => {
  test('contains exactly 9 entries', () => {
    expect(VIDEOS).toHaveLength(9);
  });

  test('every entry has a non-empty id', () => {
    VIDEOS.forEach((v) => expect(v.id.length).toBeGreaterThan(0));
  });

  test('every entry has a non-empty title', () => {
    VIDEOS.forEach((v) => expect(v.title.length).toBeGreaterThan(0));
  });

  test('every entry has a non-empty description', () => {
    VIDEOS.forEach((v) => expect(v.description.length).toBeGreaterThan(0));
  });

  test('every entry has a YouTube embed URL', () => {
    VIDEOS.forEach((v) => {
      expect(v.embedUrl).toContain('youtube.com/embed/');
    });
  });

  test('all ids are unique', () => {
    const ids = VIDEOS.map((v) => v.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});


// getVideoById


describe('getVideoById', () => {
  test('returns the correct entry for a known id', () => {
    const result = getVideoById('malta');
    expect(result).toBeDefined();
    expect(result.title).toBe('Мальта');
  });

  test('returns undefined for an unknown id', () => {
    expect(getVideoById('pluto')).toBeUndefined();
  });

  test('returns undefined for an empty string', () => {
    expect(getVideoById('')).toBeUndefined();
  });

  test('finds every entry by its own id', () => {
    VIDEOS.forEach((v) => {
      expect(getVideoById(v.id)).toBe(v);
    });
  });
});


// buildAutoplayUrl


describe('buildAutoplayUrl', () => {
  const base = 'https://www.youtube.com/embed/abc123';

  test('appends autoplay=1 parameter', () => {
    expect(buildAutoplayUrl(base)).toContain('autoplay=1');
  });

  test('appends rel=0 to suppress related videos', () => {
    expect(buildAutoplayUrl(base)).toContain('rel=0');
  });

  test('preserves the original base URL', () => {
    expect(buildAutoplayUrl(base)).toContain(base);
  });

  test('returns a string', () => {
    expect(typeof buildAutoplayUrl(base)).toBe('string');
  });
});


// VideoModal — construction


describe('VideoModal — construction', () => {
  test('does not throw when backdrop element is missing', () => {
    expect(() => makeModal()).not.toThrow();
  });

  test('isOpen() returns false on init', () => {
    buildModalFixture();
    const modal = makeModal();
    expect(modal.isOpen()).toBe(false);
  });
});


// VideoModal — open


describe('VideoModal — open', () => {
  test('adds is-open class to backdrop', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(VIDEOS[0]);
    expect(document.getElementById('videoModalBackdrop').classList.contains('is-open')).toBe(true);
  });

  test('sets aria-hidden to "false"', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(VIDEOS[0]);
    expect(document.getElementById('videoModalBackdrop').getAttribute('aria-hidden')).toBe('false');
  });

  test('populates the title element', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(getVideoById('canada'));
    expect(document.getElementById('videoModalTitle').textContent).toBe('Канада');
  });

  test('populates the description element', () => {
    buildModalFixture();
    const modal = makeModal();
    const video = getVideoById('singapore');
    modal.open(video);
    expect(document.getElementById('videoModalDescription').textContent).toBe(video.description);
  });

  test('sets the iframe src with autoplay', () => {
    buildModalFixture();
    const modal = makeModal();
    const video = getVideoById('malta');
    modal.open(video);
    const src = document.getElementById('videoModalIframe').src;
    expect(src).toContain('autoplay=1');
  });

  test('isOpen() returns true after open()', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(VIDEOS[0]);
    expect(modal.isOpen()).toBe(true);
  });
});


// VideoModal — close


describe('VideoModal — close', () => {
  test('removes is-open class', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(VIDEOS[0]);
    modal.close();
    expect(document.getElementById('videoModalBackdrop').classList.contains('is-open')).toBe(false);
  });

  test('sets aria-hidden back to "true"', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(VIDEOS[0]);
    modal.close();
    expect(document.getElementById('videoModalBackdrop').getAttribute('aria-hidden')).toBe('true');
  });

  test('clears iframe src to stop the video', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(VIDEOS[0]);
    modal.close();
    expect(document.getElementById('videoModalIframe').getAttribute('src')).toBe('');
  });

  test('isOpen() returns false after close()', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(VIDEOS[0]);
    modal.close();
    expect(modal.isOpen()).toBe(false);
  });

  test('clicking the close button closes the modal', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(VIDEOS[0]);
    document.getElementById('videoModalClose').click();
    expect(modal.isOpen()).toBe(false);
  });

  test('pressing Escape closes the modal', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(VIDEOS[0]);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(modal.isOpen()).toBe(false);
  });

  test('clicking the backdrop closes the modal', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(VIDEOS[0]);
    document.getElementById('videoModalBackdrop').click();
    expect(modal.isOpen()).toBe(false);
  });
});


// initVideoCards


describe('initVideoCards', () => {
  function buildCardsFixture() {
    document.body.innerHTML = `
      <div id="videoModalBackdrop" aria-hidden="true">
        <button id="videoModalClose"></button>
        <h2 id="videoModalTitle"></h2>
        <p id="videoModalDescription"></p>
        <iframe id="videoModalIframe" src=""></iframe>
      </div>
      <article class="destination-card" data-id="usa"      role="button" tabindex="0"></article>
      <article class="destination-card" data-id="scotland" role="button" tabindex="0"></article>
    `;
  }

  test('clicking a card opens the modal with the correct title', () => {
    buildCardsFixture();
    const modal = makeModal();
    initVideoCards(modal);
    document.querySelector('[data-id="scotland"]').click();
    expect(modal.isOpen()).toBe(true);
    expect(document.getElementById('videoModalTitle').textContent).toBe('Шотландия');
  });

  test('pressing Enter on a card opens the modal', () => {
    buildCardsFixture();
    const modal = makeModal();
    initVideoCards(modal);
    const card = document.querySelector('[data-id="usa"]');
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(modal.isOpen()).toBe(true);
    expect(document.getElementById('videoModalTitle').textContent).toBe('США');
  });

  test('pressing Space on a card opens the modal', () => {
    buildCardsFixture();
    const modal = makeModal();
    initVideoCards(modal);
    const card = document.querySelector('[data-id="usa"]');
    card.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(modal.isOpen()).toBe(true);
  });
});
