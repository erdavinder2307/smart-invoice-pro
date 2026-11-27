import React from 'react';
import fs from 'fs';
import path from 'path';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SITE_CONFIG } from '../../seo/siteConfig';

const mockSeoProps = [];
jest.mock('../../seo/SeoHead', () => (props) => {
  mockSeoProps.push(props);
  return null;
});
jest.mock('../../components/Layout/Header', () => () => null);
jest.mock('../../components/Layout/Footer', () => () => null);

// SeoHead appends " | Solidev Books" itself, so a page must pass the bare title.
const SRC = path.join(__dirname, '..', '..');
const listSources = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : listSources(full);
    return /\.(jsx?|tsx?)$/.test(entry.name) ? [full] : [];
  });

describe('page titles', () => {
  it('the Privacy page reads "Privacy Policy | Solidev Books"', () => {
    const Privacy = require('../../pages/Privacy').default;
    mockSeoProps.length = 0;
    render(
      <MemoryRouter>
        <Privacy />
      </MemoryRouter>
    );
    expect(mockSeoProps[0].title).toBe('Privacy Policy');
    expect(`${mockSeoProps[0].title} | ${SITE_CONFIG.siteName}`).toBe('Privacy Policy | Solidev Books');
  });

  it('no page passes the brand name to SeoHead itself', () => {
    const offenders = listSources(SRC).flatMap((file) => {
      const text = fs.readFileSync(file, 'utf8');
      return (text.match(/<SeoHead[\s\S]*?\/>/g) || [])
        .map((tag) => (tag.match(/title=\{?[^\n]*/) || [''])[0])
        .filter((line) => line.includes(SITE_CONFIG.siteName))
        .map((line) => `${path.relative(SRC, file)}: ${line.trim()}`);
    });
    expect(offenders).toEqual([]);
  });
});
