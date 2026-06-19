import { waitForElement, waitForAnyElement } from '../../utils/waitForElement';

describe('waitForElement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('resolves when element appears before timeout', async () => {
    const promise = waitForElement('.target', { timeout: 2000, interval: 50 });

    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'target';
      document.body.appendChild(el);
    }, 100);

    const result = await promise;
    expect(result).toBeTruthy();
    expect(result.className).toBe('target');
  });

  it('resolves null after timeout when element never appears', async () => {
    const result = await waitForElement('.missing', { timeout: 200, interval: 50 });
    expect(result).toBeNull();
  });

  it('resolves null immediately for empty selector', async () => {
    const result = await waitForElement('', { timeout: 200 });
    expect(result).toBeNull();
  });

  it('accepts connected elements without offsetParent when visible', async () => {
    const el = document.createElement('div');
    el.className = 'connected';
    document.body.appendChild(el);

    const result = await waitForElement('.connected', { timeout: 200, interval: 20 });
    expect(result).toBe(el);
  });

  it('does not resolve display:none elements within timeout', async () => {
    const hidden = document.createElement('div');
    hidden.className = 'only-hidden';
    hidden.style.display = 'none';
    document.body.appendChild(hidden);

    const result = await waitForElement('.only-hidden', { timeout: 150, interval: 50 });
    expect(result).toBeNull();
  });
});

describe('waitForAnyElement', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('returns the first matching selector in priority order', async () => {
    const fallback = document.createElement('div');
    fallback.className = 'fallback';
    document.body.appendChild(fallback);

    const primary = document.createElement('div');
    primary.className = 'primary';
    document.body.appendChild(primary);

    const result = await waitForAnyElement(['.primary', '.fallback'], { timeout: 500, interval: 20 });
    expect(result.className).toBe('primary');
  });

  it('falls back to later selectors when earlier ones are missing', async () => {
    const fallback = document.createElement('div');
    fallback.className = 'fallback';
    document.body.appendChild(fallback);

    const result = await waitForAnyElement(['.missing', '.fallback'], { timeout: 500, interval: 20 });
    expect(result.className).toBe('fallback');
  });

  it('resolves null when no selectors match within timeout', async () => {
    const result = await waitForAnyElement(['.a', '.b'], { timeout: 150, interval: 50 });
    expect(result).toBeNull();
  });

  it('resolves null for empty selector list', async () => {
    const result = await waitForAnyElement([], { timeout: 200 });
    expect(result).toBeNull();
  });
});
