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
    BrowserWebBluetooth.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    BrowserWebBluetooth.ctorParameters = function () { return []; };
    return BrowserWebBluetooth;
}());
export { BrowserWebBluetooth };
