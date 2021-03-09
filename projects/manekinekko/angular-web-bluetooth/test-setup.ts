import 'jest-preset-angular/setup-jest';

Object.defineProperty(navigator, 'bluetooth', {
  // @ts-ignore
  value: jest.fn().mockImplementation(() => ({
    // @ts-ignore
    requestDevice: jest.fn(),
  })),
});
