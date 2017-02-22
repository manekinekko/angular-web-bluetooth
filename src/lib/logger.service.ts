import { Injectable } from '@angular/core';

export interface Logger {
  log(args: string[]): void;
  error(args: string[]): void;
}

@Injectable()
export class ConsoleLoggerService implements Logger {
  log(...args) {
    console.log.apply(console, args);
  }
  error(...args) {
    console.error.apply(console, args);
  }
}

@Injectable()
export class NoLoggerService implements Logger {
  log(...args) {}
  error(...args) {}
}