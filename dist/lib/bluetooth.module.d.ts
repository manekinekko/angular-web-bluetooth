import { ModuleWithProviders, OpaqueToken } from '@angular/core';
import { BrowserWebBluetooth } from './platform/browser';
import { ConsoleLoggerService } from './logger.service';
export interface AWBOptions {
    enableTracing?: boolean;
}
export declare function browserWebBluetooth(): BrowserWebBluetooth;
export declare function consoleLoggerServiceConfig(options: AWBOptions): ConsoleLoggerService;
export declare function makeMeTokenInjector(): OpaqueToken;
export declare class WebBluetoothModule {
    static forRoot(options?: AWBOptions): ModuleWithProviders;
}
