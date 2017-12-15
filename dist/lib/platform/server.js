import { Injectable } from '@angular/core';
var ServerWebBluetooth = (function () {
    function ServerWebBluetooth() {
    }
    ServerWebBluetooth.instance = function () {
        // mocked object for now
        return {};
    };
    ServerWebBluetooth.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    ServerWebBluetooth.ctorParameters = function () { return []; };
    return ServerWebBluetooth;
}());
export { ServerWebBluetooth };
