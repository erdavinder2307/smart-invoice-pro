import { isAutoFillEnabledForHost } from '../../utils/autoFillAccess';

describe('autoFillAccess', () => {
  it('enables auto fill for azure static apps domain', () => {
    expect(isAutoFillEnabledForHost('polite-rock-016dcf900.1.azurestaticapps.net')).toBe(true);
  });

  it('disables auto fill for www.solidevbooks.com', () => {
    expect(isAutoFillEnabledForHost('www.solidevbooks.com')).toBe(false);
  });

  it('enables auto fill for localhost', () => {
    expect(isAutoFillEnabledForHost('localhost')).toBe(true);
  });
});
