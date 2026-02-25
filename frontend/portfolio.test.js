
const {
  DESTINATIONS,
  getDestinationById,
  DestinationModal,
  initDestinationCards,
} = require('./portfolio');


// Helpers


/** Build a minimal modal DOM fixture. */
function buildModalFixture() {
  document.body.innerHTML = `
    <div id="modalBackdrop" aria-hidden="true">
      <div id="modal">
        <button id="modalClose"></button>
        <h2 id="modalTitle"></h2>
        <p id="modalDescription"></p>
        <ul id="modalCitiesList"></ul>
        <iframe id="modalMap" src=""></iframe>
      </div>
    </div>
  `;
}

/** Create a DestinationModal with default test IDs. */
function makeModal() {
  return new DestinationModal({
    backdropId:    'modalBackdrop',
    closeButtonId: 'modalClose',
    titleId:       'modalTitle',
    descriptionId: 'modalDescription',
    citiesListId:  'modalCitiesList',
    mapId:         'modalMap',
  });
}

beforeEach(() => {
  document.body.innerHTML = '';
});


// DESTINATIONS data


describe('DESTINATIONS data', () => {
  test('contains exactly 9 destinations', () => {
    expect(DESTINATIONS).toHaveLength(9);
  });

  test('every destination has a non-empty id', () => {
    DESTINATIONS.forEach((d) => {
      expect(typeof d.id).toBe('string');
      expect(d.id.length).toBeGreaterThan(0);
    });
  });

  test('every destination has a non-empty title', () => {
    DESTINATIONS.forEach((d) => {
      expect(typeof d.title).toBe('string');
      expect(d.title.length).toBeGreaterThan(0);
    });
  });

  test('every destination has at least one city', () => {
    DESTINATIONS.forEach((d) => {
      expect(d.cities.length).toBeGreaterThan(0);
    });
  });

  test('every city has name and airport fields', () => {
    DESTINATIONS.forEach((d) => {
      d.cities.forEach((city) => {
        expect(typeof city.name).toBe('string');
        expect(typeof city.airport).toBe('string');
      });
    });
  });

  test('every destination has a mapSrc string', () => {
    DESTINATIONS.forEach((d) => {
      expect(typeof d.mapSrc).toBe('string');
      expect(d.mapSrc.length).toBeGreaterThan(0);
    });
  });

  test('all ids are unique', () => {
    const ids = DESTINATIONS.map((d) => d.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});


// getDestinationById


describe('getDestinationById', () => {
  test('returns the correct destination for a known id', () => {
    const result = getDestinationById('usa');
    expect(result).toBeDefined();
    expect(result.title).toBe('США');
  });

  test('returns undefined for an unknown id', () => {
    expect(getDestinationById('mars')).toBeUndefined();
  });

  test('returns undefined for an empty string', () => {
    expect(getDestinationById('')).toBeUndefined();
  });

  test('finds every destination by its own id', () => {
    DESTINATIONS.forEach((d) => {
      expect(getDestinationById(d.id)).toBe(d);
    });
  });
});


// DestinationModal — construction


describe('DestinationModal — construction', () => {
  test('does not throw when backdrop element is missing', () => {
    document.body.innerHTML = '';
    expect(() => makeModal()).not.toThrow();
  });

  test('modal is closed on init', () => {
    buildModalFixture();
    const modal = makeModal();
    expect(modal.isOpen()).toBe(false);
  });
});


// DestinationModal — open


describe('DestinationModal — open', () => {
  test('adds is-open class to backdrop', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(DESTINATIONS[0]);
    expect(document.getElementById('modalBackdrop').classList.contains('is-open')).toBe(true);
  });

  test('sets aria-hidden to "false" on backdrop', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(DESTINATIONS[0]);
    expect(document.getElementById('modalBackdrop').getAttribute('aria-hidden')).toBe('false');
  });

  test('populates the title', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(getDestinationById('canada'));
    expect(document.getElementById('modalTitle').textContent).toBe('Канада');
  });

  test('populates the description', () => {
    buildModalFixture();
    const modal = makeModal();
    const dest = getDestinationById('malta');
    modal.open(dest);
    expect(document.getElementById('modalDescription').textContent).toBe(dest.description);
  });

  test('renders the correct number of city list items', () => {
    buildModalFixture();
    const modal = makeModal();
    const dest = getDestinationById('usa'); // 4 cities
    modal.open(dest);
    const items = document.querySelectorAll('#modalCitiesList li');
    expect(items.length).toBe(dest.cities.length);
  });

  test('sets map src to the destination mapSrc', () => {
    buildModalFixture();
    const modal = makeModal();
    const dest = getDestinationById('singapore');
    modal.open(dest);
    expect(document.getElementById('modalMap').src).toBe(dest.mapSrc);
  });

  test('isOpen() returns true after open()', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(DESTINATIONS[0]);
    expect(modal.isOpen()).toBe(true);
  });
});


// DestinationModal — close


describe('DestinationModal — close', () => {
  test('removes is-open class from backdrop', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(DESTINATIONS[0]);
    modal.close();
    expect(document.getElementById('modalBackdrop').classList.contains('is-open')).toBe(false);
  });

  test('sets aria-hidden to "true" on close', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(DESTINATIONS[0]);
    modal.close();
    expect(document.getElementById('modalBackdrop').getAttribute('aria-hidden')).toBe('true');
  });

  test('clears map src on close', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(DESTINATIONS[0]);
    modal.close();
    expect(document.getElementById('modalMap').getAttribute('src')).toBe('');
  });

  test('isOpen() returns false after close()', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(DESTINATIONS[0]);
    modal.close();
    expect(modal.isOpen()).toBe(false);
  });

  test('clicking close button closes the modal', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(DESTINATIONS[0]);
    document.getElementById('modalClose').click();
    expect(modal.isOpen()).toBe(false);
  });

  test('pressing Escape closes an open modal', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(DESTINATIONS[0]);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(modal.isOpen()).toBe(false);
  });

  test('clicking the backdrop closes the modal', () => {
    buildModalFixture();
    const modal = makeModal();
    modal.open(DESTINATIONS[0]);
    document.getElementById('modalBackdrop').click();
    expect(modal.isOpen()).toBe(false);
  });
});


// initDestinationCards


describe('initDestinationCards', () => {
  function buildCardsFixture() {
    document.body.innerHTML = `
      <div id="modalBackdrop" aria-hidden="true">
        <button id="modalClose"></button>
        <h2 id="modalTitle"></h2>
        <p id="modalDescription"></p>
        <ul id="modalCitiesList"></ul>
        <iframe id="modalMap" src=""></iframe>
      </div>
      <article class="destination-card" data-id="usa"  role="button" tabindex="0"></article>
      <article class="destination-card" data-id="malta" role="button" tabindex="0"></article>
    `;
  }

  test('clicking a card opens the modal with the correct destination', () => {
    buildCardsFixture();
    const modal = makeModal();
    initDestinationCards(modal);

    document.querySelector('[data-id="malta"]').click();

    expect(modal.isOpen()).toBe(true);
    expect(document.getElementById('modalTitle').textContent).toBe('Мальта');
  });

  test('pressing Enter on a card opens the modal', () => {
    buildCardsFixture();
    const modal = makeModal();
    initDestinationCards(modal);

    const card = document.querySelector('[data-id="usa"]');
    card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(modal.isOpen()).toBe(true);
    expect(document.getElementById('modalTitle').textContent).toBe('США');
  });

  test('pressing Space on a card opens the modal', () => {
    buildCardsFixture();
    const modal = makeModal();
    initDestinationCards(modal);

    const card = document.querySelector('[data-id="usa"]');
    card.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

    expect(modal.isOpen()).toBe(true);
  });
});
