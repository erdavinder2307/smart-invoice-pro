import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

// App uses <AppRoutes> which includes its own <BrowserRouter>,
// so we render it without any extra router wrapper.

// Mock the entire routes module to avoid loading all page components
jest.mock('./routes', () => () => <div data-testid="app-routes">Routes</div>);

test('renders without crashing', () => {
  render(<App />);
  const appDiv = document.querySelector('.App');
  expect(appDiv).toBeInTheDocument();
});
