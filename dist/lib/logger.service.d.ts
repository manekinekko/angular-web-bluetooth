export interface Logger {
    log(args: string[]): void;
    error(args: string[]): void;
    warn(args: string[]): void;
}
export declare class ConsoleLoggerService implements Logger {
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
}
export declare class NoLoggerService implements Logger {
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
}
