// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import i18n from './i18n';

i18n.changeLanguage('en');

// ── Polyfills for JSDOM (needed by react-router v7) ──────────────────────────
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;

// ReadableStream is used by react-router v7 internally
if (typeof global.ReadableStream === 'undefined') {
  const { ReadableStream } = require('stream/web');
  global.ReadableStream = ReadableStream;
}

// ── Global mocks ─────────────────────────────────────────────────────────────
// Silence framer-motion in JSDOM
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: new Proxy({}, {
      get: (_target, prop) =>
        React.forwardRef((props, ref) => {
          const { children, ...rest } = props;
          // Strip framer-motion-specific props to avoid React warnings
          const safe = Object.fromEntries(
            Object.entries(rest).filter(
              ([k]) =>
                !['initial', 'animate', 'exit', 'transition', 'variants',
                  'whileHover', 'whileTap', 'whileFocus', 'whileInView',
                  'viewport', 'layout', 'layoutId', 'drag', 'dragConstraints',
                ].includes(k)
            )
          );
          return React.createElement(prop, { ...safe, ref }, children);
        }),
    }),
    AnimatePresence: ({ children }) => children,
    useAnimation: () => ({ start: jest.fn(), stop: jest.fn() }),
    useInView: () => [null, true],
  };
});

// Silence recharts/chart.js canvas warnings in JSDOM
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  fillRect: jest.fn(), clearRect: jest.fn(), getImageData: jest.fn(() => ({ data: [] })),
  putImageData: jest.fn(), createImageData: jest.fn(() => []), setTransform: jest.fn(),
  drawImage: jest.fn(), save: jest.fn(), fillText: jest.fn(), restore: jest.fn(),
  beginPath: jest.fn(), moveTo: jest.fn(), lineTo: jest.fn(), closePath: jest.fn(),
  stroke: jest.fn(), translate: jest.fn(), scale: jest.fn(), rotate: jest.fn(),
  arc: jest.fn(), fill: jest.fn(), measureText: jest.fn(() => ({ width: 0 })),
  transform: jest.fn(), rect: jest.fn(), clip: jest.fn(), createLinearGradient: jest.fn(() => ({
    addColorStop: jest.fn(),
  })),
}));

// Silence window.matchMedia (used by MUI breakpoints)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suppress ResizeObserver errors in JSDOM
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
