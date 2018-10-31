import { Injectable } from '@angular/core';

@Injectable()
export class BrowserWebBluetooth {
  private _ble;

  constructor() {
    this._ble = navigator.bluetooth;
    if (!this._ble) {
      throw new Error('Your browser does not support Smart Bluetooth. See http://caniuse.com/#search=Bluetooth for more details.');
    }
  }

  requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice> {
    return this._ble.requestDevice(options);
  }
}
