import { Injectable } from '@angular/core';

export interface Logger {
  log(args: string[]): void;
  error(args: string[]): void;
  warn(args: string[]): void;
}

@Injectable({
  providedIn: 'root'
})
export class ConsoleLoggerService implements Logger {
  log(...args: any[]) {
    console.log.apply(console, args);
  }
  error(...args: any[]) {
    console.error.apply(console, args);
  }
  warn(...args: any[]) {
    console.warn.apply(console, args);
  }
}

@Injectable({
  providedIn: 'root'
})
export class NoLoggerService implements Logger {
  log(...args: any[]) {}
  error(...args: any[]) {}
  warn(...args: any[]) {}
}
