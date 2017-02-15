var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
var BrowserWebBluetooth = (function () {
    function BrowserWebBluetooth() {
        this._ble = navigator.bluetooth;
        if (!this._ble) {
            throw ('Your browser does not support Smart Bluetooth. See http://caniuse.com/#search=Bluetooth for more details.');
        }
    }
    BrowserWebBluetooth.prototype.requestDevice = function (options) {
        return this._ble.requestDevice(options);
    };
    return BrowserWebBluetooth;
}());
BrowserWebBluetooth = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], BrowserWebBluetooth);
export { BrowserWebBluetooth };
//# sourceMappingURL=/Users/wassimchegham/Sandbox/oss/angular-web-bluetooth/lib/platform/browser.js.map