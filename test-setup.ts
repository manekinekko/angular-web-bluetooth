import 'jest-preset-angular/setup-jest';

Object.defineProperty(navigator, 'bluetooth', {
  value: jest.fn().mockImplementation(() => ({
    requestDevice: jest.fn(),
  })),
});
