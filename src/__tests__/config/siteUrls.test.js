import fs from 'fs';
import path from 'path';

// The bare domain (solidevbooks.com/<path>) answers 404, so every URL we hand to
// search engines must use the www host, which serves every page.
const WWW = 'https://www.solidevbooks.com/';
const read = (file) => fs.readFileSync(path.join(process.cwd(), file), 'utf8');

describe('public site URLs use the www host', () => {
  const sitemapLocs = [...read('public/sitemap.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

  it('lists at least the home page in the sitemap', () => {
    expect(sitemapLocs).toContain(WWW);
  });

  it.each(sitemapLocs)('sitemap entry %s uses https://www.', (loc) => {
    expect(loc.startsWith(WWW)).toBe(true);
  });

  it('every sitemap path has a route (so it answers 200, not the 404 page)', () => {
    const routes = read('src/routes.js');
    sitemapLocs
      .map((loc) => new URL(loc).pathname)
      .filter((p) => p !== '/')
      .forEach((p) => expect(routes).toContain(`path="${p}"`));
  });

  it('robots.txt points at the www sitemap', () => {
    expect(read('public/robots.txt')).toMatch(/^Sitemap: https:\/\/www\.solidevbooks\.com\/sitemap\.xml$/m);
  });

  it('index.html canonical uses the www host', () => {
    expect(read('public/index.html')).toContain(`<link rel="canonical" href="${WWW}" />`);
  });

  it('SEO site URL defaults to the www host', () => {
    jest.isolateModules(() => {
      const saved = process.env.REACT_APP_SITE_URL;
      delete process.env.REACT_APP_SITE_URL;
      const { SITE_CONFIG, toAbsoluteUrl } = require('../../seo/siteConfig');
      expect(SITE_CONFIG.siteUrl).toBe('https://www.solidevbooks.com');
      expect(toAbsoluteUrl('/pricing')).toBe(`${WWW}pricing`);
      if (saved !== undefined) process.env.REACT_APP_SITE_URL = saved;
    });
  });

  it('no public file links to the bare domain', () => {
    ['public/sitemap.xml', 'public/robots.txt', 'public/index.html'].forEach((f) => {
      expect(read(f)).not.toMatch(/https?:\/\/solidevbooks\.com/);
    });
  });
});
