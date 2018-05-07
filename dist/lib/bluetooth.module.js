import { NgModule, InjectionToken } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BluetoothCore } from './bluetooth.service';
import { BrowserWebBluetooth } from './platform/browser';
import { ConsoleLoggerService, NoLoggerService } from './logger.service';
export function browserWebBluetooth() {
    return new BrowserWebBluetooth();
}
;
export function consoleLoggerServiceConfig(options) {
    if (options && options.enableTracing) {
        return new ConsoleLoggerService();
    }
    else {
        return new NoLoggerService();
    }
}
export function makeMeTokenInjector() {
    return new InjectionToken('AWBOptions');
}
var WebBluetoothModule = /** @class */ (function () {
    function WebBluetoothModule() {
    }
    WebBluetoothModule.forRoot = function (options) {
        if (options === void 0) { options = {}; }
        return {
            ngModule: WebBluetoothModule,
            providers: [
                BluetoothCore,
                {
                    provide: BrowserWebBluetooth,
                    useFactory: browserWebBluetooth
                },
                {
                    provide: makeMeTokenInjector, useValue: options
                },
                {
                    provide: ConsoleLoggerService,
                    useFactory: consoleLoggerServiceConfig,
                    deps: [
                        makeMeTokenInjector
                    ]
                }
            ]
        };
    };
    WebBluetoothModule.decorators = [
        { type: NgModule, args: [{
                    imports: [CommonModule]
                },] },
    ];
    return WebBluetoothModule;
}());
export { WebBluetoothModule };
