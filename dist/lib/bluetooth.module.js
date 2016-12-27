import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebBluetooth } from './bluetooth.service';
export var WebBluetoothModule = (function () {
    function WebBluetoothModule() {
    }
    WebBluetoothModule.forRoot = function () {
        return {
            ngModule: WebBluetoothModule,
            providers: [WebBluetooth]
        };
    };
    WebBluetoothModule.decorators = [
        { type: NgModule, args: [{
                    imports: [CommonModule]
                },] },
    ];
    /** @nocollapse */
    WebBluetoothModule.ctorParameters = function () { return []; };
    return WebBluetoothModule;
}());
//# sourceMappingURL=/Users/wassimchegham/Sandbox/oss/angular-web-bluetooth/lib/bluetooth.module.js.map