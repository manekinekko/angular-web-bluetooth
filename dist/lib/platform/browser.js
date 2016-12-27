import { Injectable } from '@angular/core';
export var BrowserWebBluetooth = (function () {
    function BrowserWebBluetooth() {
        this._ble = navigator.bluetooth;
        if (!this._ble) {
            throw ('Your browser does not support Smart Bluetooth. See http://caniuse.com/#search=Bluetooth for more details.');
        }
    }
    BrowserWebBluetooth.prototype.requestDevice = function (options) {
        return this._ble.requestDevice(options);
    };
    BrowserWebBluetooth.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    BrowserWebBluetooth.ctorParameters = function () { return []; };
    return BrowserWebBluetooth;
}());
//# sourceMappingURL=/Users/wassimchegham/Sandbox/oss/angular-web-bluetooth/lib/platform/browser.js.map