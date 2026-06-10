import { resolveMediaUrl } from '../../utils/mediaUrl';

jest.mock('../../config/api', () => ({
  getApiBaseUrl: () => 'http://127.0.0.1:5001',
}));

describe('resolveMediaUrl', () => {
  it('prefixes API base for relative upload paths', () => {
    expect(resolveMediaUrl('/uploads/org_logos/logo.png')).toBe(
      'http://127.0.0.1:5001/uploads/org_logos/logo.png'
    );
  });

  it('leaves absolute and blob URLs unchanged', () => {
    expect(resolveMediaUrl('https://cdn.example.com/logo.png')).toBe(
      'https://cdn.example.com/logo.png'
    );
    expect(resolveMediaUrl('blob:http://localhost/abc')).toBe(
      'blob:http://localhost/abc'
    );
  });

  it('returns empty string for falsy input', () => {
    expect(resolveMediaUrl('')).toBe('');
    expect(resolveMediaUrl(null)).toBe('');
  });
});
