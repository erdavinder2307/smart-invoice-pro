/**
 * Poll the DOM until `selector` matches a visible element or timeout elapses.
 * @param {string} selector - CSS selector (e.g. '.tour-customer-list')
 * @param {{ timeout?: number, interval?: number, root?: ParentNode }} options
 * @returns {Promise<Element|null>}
 */
function isUsableElement(el) {
  if (!el) return false;
  if (el.offsetParent !== null) return true;
  if (getComputedStyle(el).display === 'none') return false;
  if (getComputedStyle(el).visibility === 'hidden') return false;
  return el.isConnected;
}

export function waitForElement(selector, { timeout = 5000, interval = 100, root = document } = {}) {
  if (!selector) return Promise.resolve(null);

  return new Promise((resolve) => {
    const started = Date.now();

    const probe = () => {
      const el = root.querySelector(selector);
      if (isUsableElement(el)) {
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

/** Try selectors in order; returns first match within the shared timeout budget. */
export function waitForAnyElement(selectors, options = {}) {
  const list = (selectors || []).filter(Boolean);
  if (!list.length) return Promise.resolve(null);

  return new Promise((resolve) => {
    const timeout = options.timeout ?? 5000;
    const interval = options.interval ?? 100;
    const root = options.root ?? document;
    const started = Date.now();

    const probe = () => {
      for (const selector of list) {
        const el = root.querySelector(selector);
        if (isUsableElement(el)) {
          resolve(el);
          return;
        }
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
