import { ModuleWithProviders } from '@angular/core';
import { BrowserWebBluetooth } from './platform/browser';
export declare function browserWebBluetooth(): BrowserWebBluetooth;
export interface Options {
    enableTracing?: boolean;
}
export declare class WebBluetoothModule {
    static forRoot(options?: Options): ModuleWithProviders;
}
