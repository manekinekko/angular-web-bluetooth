// Typings reference file, see links for more information
// https://github.com/typings/typings
// https://www.typescriptlang.org/docs/handbook/writing-declaration-files.html

declare var System: any;

/**
 * Add the browser API to the Navigator object and make TypeScript happy ^^
 */
interface ExtendedNavigator extends Navigator {
  bluetooth: any;
}

interface ExtendedWindow extends Window {
  TextDecoder: any;
  SmoothieChart: any;
  TimeSeries: any;
}
