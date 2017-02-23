var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BluetoothCore } from './bluetooth.service';
import { BrowserWebBluetooth } from './platform/browser';
import { ConsoleLoggerService, NoLoggerService } from './logger.service';
export function browserWebBluetooth() {
    return new BrowserWebBluetooth();
}
;
var WebBluetoothModule = WebBluetoothModule_1 = (function () {
    function WebBluetoothModule() {
    }
    WebBluetoothModule.forRoot = function (options) {
        if (options === void 0) { options = {}; }
        function consoleLoggerServiceConfig() {
            if (options.enableTracing) {
                return new ConsoleLoggerService();
            }
            else {
                return new NoLoggerService();
            }
        }
        return {
            ngModule: WebBluetoothModule_1,
            providers: [
                BluetoothCore,
                {
                    provide: BrowserWebBluetooth,
                    useFactory: browserWebBluetooth
                },
                {
                    provide: ConsoleLoggerService,
                    useFactory: consoleLoggerServiceConfig
                }
            ]
        };
    };
    return WebBluetoothModule;
}());
WebBluetoothModule = WebBluetoothModule_1 = __decorate([
    NgModule({
        imports: [CommonModule]
    })
], WebBluetoothModule);
export { WebBluetoothModule };
var WebBluetoothModule_1;
//# sourceMappingURL=/Users/wassimchegham/Sandbox/oss/angular-web-bluetooth/lib/bluetooth.module.js.map