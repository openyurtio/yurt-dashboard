// fix: `matchMedia` not present, legacy browsers require a polyfill
global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    };
  };
