import { Injectable } from '@angular/core';

@Injectable()
export class BrowserWebBluetooth {

  private _ble;

  constructor() {
    this._ble = (<ExtendedNavigator>navigator).bluetooth;
    if( !this._ble ) {
      throw ('Your browser does not support Smart Bluetooth. See http://caniuse.com/#search=Bluetooth for more details.')
    }
  }

  requestDevice(options:any): Promise<any> {
    return this._ble.requestDevice(options);
  }

}
