/**
 * Poll the DOM until `selector` matches a visible element or timeout elapses.
 * @param {string} selector - CSS selector (e.g. '.tour-customer-list')
 * @param {{ timeout?: number, interval?: number, root?: ParentNode }} options
 * @returns {Promise<Element|null>}
 */
export function waitForElement(selector, { timeout = 5000, interval = 100, root = document } = {}) {
  if (!selector) return Promise.resolve(null);

  return new Promise((resolve) => {
    const started = Date.now();

    const probe = () => {
      const el = root.querySelector(selector);
      if (el && el.offsetParent !== null) {
        resolve(el);
        return;
      }
      // offsetParent is null for display:none; still accept detached-but-present during layout
      if (el && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden') {
        resolve(el);
        return;
      }
      if (el && el.isConnected) {
        resolve(el);
        return;
      }
      if (Date.now() - started >= timeout) {
        resolve(null);
        return;
      }
      setTimeout(probe, interval);
    };

    probe();
  });
}
