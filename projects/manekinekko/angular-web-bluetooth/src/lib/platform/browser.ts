import { Injectable } from '@angular/core';

@Injectable()
export class BrowserWebBluetooth {
  private ble;

  constructor() {
    this.ble = navigator.bluetooth;
    if (!this.ble) {
      throw new Error('Your browser does not support Smart Bluetooth. See http://caniuse.com/#search=Bluetooth for more details.');
    }
  }

  requestDevice(options: RequestDeviceOptions): Promise<BluetoothDevice> {
    return this.ble.requestDevice(options);
  }
}
