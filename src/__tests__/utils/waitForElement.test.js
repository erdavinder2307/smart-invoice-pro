import { waitForElement } from '../../utils/waitForElement';

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
});
