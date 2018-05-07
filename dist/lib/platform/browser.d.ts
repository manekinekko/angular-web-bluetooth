/// <reference types="web-bluetooth" />
export declare class BrowserWebBluetooth {
    private _ble;
    constructor();
    requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice>;
}
