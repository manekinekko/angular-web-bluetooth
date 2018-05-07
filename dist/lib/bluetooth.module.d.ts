import { ModuleWithProviders, InjectionToken } from '@angular/core';
import { BrowserWebBluetooth } from './platform/browser';
import { ConsoleLoggerService, NoLoggerService } from './logger.service';
export interface AWBOptions {
    enableTracing?: boolean;
}
export declare function browserWebBluetooth(): BrowserWebBluetooth;
export declare function consoleLoggerServiceConfig(options: AWBOptions): ConsoleLoggerService | NoLoggerService;
export declare function makeMeTokenInjector(): InjectionToken<{}>;
export declare class WebBluetoothModule {
    static forRoot(options?: AWBOptions): ModuleWithProviders;
}
