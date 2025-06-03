import { render } from '@testing-library/react';

import App from './App';

// JSDOM comapatity with browser DOM environment
// https://jestjs.io/docs/manual-mocks#mocking-methods-which-are-not-implemented-in-jsdom
beforeAll(() => {
  global.matchMedia =
    global.matchMedia ||
    function () {
      return {
        addListener: jest.fn(),
        removeListener: jest.fn(),
      };
    };
});

describe('APP Test', () => {
  // https://jestjs.io/docs/snapshot-testing
  it('Snapshot test for home page', () => {
    const { asFragment } = render(<App />);

    expect(asFragment(<App />)).toMatchSnapshot();
  });
});
