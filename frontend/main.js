/**
 * Initialise the hamburger navigation menu.
 * Toggles the menu open/closed state and keeps aria-expanded in sync.
 *
 * @param {string} toggleId - The id of the toggle button element.
 * @param {string} menuId   - The id of the menu element to show/hide.
 * @returns {{ toggle: HTMLElement, menu: HTMLElement } | null}
 *   References to both elements, or null if either is missing in the DOM.
 */
function initNavMenu(toggleId, menuId) {
  const toggle = document.getElementById(toggleId);
  const menu   = document.getElementById(menuId);

  if (!toggle || !menu) return null;

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  // Close the menu when clicking outside of the nav
  document.addEventListener('click', (event) => {
    const nav = toggle.closest('.nav');
    if (nav && !nav.contains(event.target)) {
      closeMenu(toggle, menu);
    }
  });

  // Close the menu when pressing Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu(toggle, menu);
    }
  });

  return { toggle, menu };
}

/**
 * Close the navigation menu and reset aria state.
 *
 * @param {HTMLElement} toggle - The toggle button element.
 * @param {HTMLElement} menu   - The menu element to close.
 */
function closeMenu(toggle, menu) {
  menu.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
}

// ---- Bootstrap on DOMContentLoaded ----
document.addEventListener('DOMContentLoaded', () => {
  initNavMenu('navToggle', 'navMenu');
});

// Export functions for unit testing (CommonJS / ESM compatible)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initNavMenu, closeMenu };
}
