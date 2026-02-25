const { initNavMenu, closeMenu } = require('./main');
/**
 * A toggle button and a menu.
 *
 * @param {string} toggleId
 * @param {string} menuId
 * @returns {{ toggle: HTMLElement, menu: HTMLElement }}
 */
function buildFixture(toggleId = 'navToggle', menuId = 'navMenu') {
  document.body.innerHTML = `
    <nav class="nav">
      <button id="${toggleId}" aria-expanded="false" aria-label="Open menu"></button>
      <ul id="${menuId}"></ul>
    </nav>
  `;
  return {
    toggle: document.getElementById(toggleId),
    menu:   document.getElementById(menuId),
  };
}

// initNavMenu

describe('initNavMenu', () => {
  test('returns null when toggle element does not exist', () => {
    document.body.innerHTML = '<ul id="navMenu"></ul>';
    const result = initNavMenu('missingToggle', 'navMenu');
    expect(result).toBeNull();
  });

  test('returns null when menu element does not exist', () => {
    document.body.innerHTML = '<button id="navToggle"></button>';
    const result = initNavMenu('navToggle', 'missingMenu');
    expect(result).toBeNull();
  });

  test('returns references to both elements when both exist', () => {
    const { toggle, menu } = buildFixture();
    const result = initNavMenu('navToggle', 'navMenu');
    expect(result).not.toBeNull();
    expect(result.toggle).toBe(toggle);
    expect(result.menu).toBe(menu);
  });

  test('clicking toggle opens the menu (adds is-open class)', () => {
    const { toggle, menu } = buildFixture();
    initNavMenu('navToggle', 'navMenu');

    toggle.click();

    expect(menu.classList.contains('is-open')).toBe(true);
  });

  test('clicking toggle sets aria-expanded to "true" when opening', () => {
    const { toggle } = buildFixture();
    initNavMenu('navToggle', 'navMenu');

    toggle.click();

    expect(toggle.getAttribute('aria-expanded')).toBe('true');
  });

  test('clicking toggle twice closes the menu (removes is-open class)', () => {
    const { toggle, menu } = buildFixture();
    initNavMenu('navToggle', 'navMenu');

    toggle.click(); // open
    toggle.click(); // close

    expect(menu.classList.contains('is-open')).toBe(false);
  });

  test('clicking toggle twice resets aria-expanded to "false"', () => {
    const { toggle } = buildFixture();
    initNavMenu('navToggle', 'navMenu');

    toggle.click();
    toggle.click();

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  test('pressing Escape closes an open menu', () => {
    const { toggle, menu } = buildFixture();
    initNavMenu('navToggle', 'navMenu');

    toggle.click(); // open first

    const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(escEvent);

    expect(menu.classList.contains('is-open')).toBe(false);
  });

  test('pressing Escape on a closed menu leaves it closed', () => {
    const { menu } = buildFixture();
    initNavMenu('navToggle', 'navMenu');

    const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    document.dispatchEvent(escEvent);

    expect(menu.classList.contains('is-open')).toBe(false);
  });

  test('clicking outside the nav closes an open menu', () => {
    document.body.innerHTML = `
      <nav class="nav">
        <button id="navToggle" aria-expanded="false"></button>
        <ul id="navMenu"></ul>
      </nav>
      <main id="outside">Content</main>
    `;
    const toggle = document.getElementById('navToggle');
    const menu   = document.getElementById('navMenu');
    const outside = document.getElementById('outside');

    initNavMenu('navToggle', 'navMenu');
    toggle.click(); // open

    outside.click();

    expect(menu.classList.contains('is-open')).toBe(false);
  });

  test('clicking inside the nav does not close the menu', () => {
    const { toggle, menu } = buildFixture();
    initNavMenu('navToggle', 'navMenu');
    toggle.click(); // open

    // Simulate click inside the nav (on the menu itself)
    menu.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(menu.classList.contains('is-open')).toBe(true);
  });
});

// closeMenu

describe('closeMenu', () => {
  test('removes is-open class from menu', () => {
    const { toggle, menu } = buildFixture();
    menu.classList.add('is-open');

    closeMenu(toggle, menu);

    expect(menu.classList.contains('is-open')).toBe(false);
  });

  test('sets aria-expanded to "false" on toggle', () => {
    const { toggle, menu } = buildFixture();
    toggle.setAttribute('aria-expanded', 'true');

    closeMenu(toggle, menu);

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  test('sets aria-label to "Open menu" on toggle', () => {
    const { toggle, menu } = buildFixture();
    toggle.setAttribute('aria-label', 'Close menu');

    closeMenu(toggle, menu);

    expect(toggle.getAttribute('aria-label')).toBe('Open menu');
  });

  test('is safe to call on an already-closed menu', () => {
    const { toggle, menu } = buildFixture();

    expect(() => closeMenu(toggle, menu)).not.toThrow();
    expect(menu.classList.contains('is-open')).toBe(false);
  });
});
