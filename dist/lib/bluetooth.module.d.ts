import { ModuleWithProviders } from '@angular/core';
import { BrowserWebBluetooth } from './platform/browser';
import { ConsoleLoggerService } from './logger.service';
export declare function browserWebBluetooth(): BrowserWebBluetooth;
export declare function consoleLoggerService(options: Options): () => ConsoleLoggerService;
export interface Options {
    enableTracing: boolean;
}
export declare class WebBluetoothModule {
    static forRoot(options: Options): ModuleWithProviders;
}
