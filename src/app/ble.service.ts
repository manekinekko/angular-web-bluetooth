import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { BluetoothCore, BrowserWebBluetooth, ConsoleLoggerService } from '@manekinekko/angular-web-bluetooth';

type ServiceOptions = {
    characteristic: string;
    service: string,
    decoder(value: DataView): number | {[key: string]: number}
};

export function makeSingleton() {
  return [{
    provide: BluetoothCore,
    useFactory: (b, l) => new BluetoothCore(b, l),
    deps: [BrowserWebBluetooth, ConsoleLoggerService]
  }, {
    provide: BleService,
    useFactory: (b) => new BleService(b),
    deps: [BluetoothCore]
  }];
}

@Injectable({
  providedIn: 'root'
})
export class BleService {

    private _config: ServiceOptions;

  constructor(public ble: BluetoothCore) { }

  config(options: ServiceOptions) {
    this._config = options;
  }

  getDevice() {
    return this.ble.getDevice$();
  }

  stream() {
    return this.ble.streamValues$().pipe(
      map(this._config.decoder)
    );
  }

  value() {
    return this.ble
      .value$({
        service: this._config.service,
        characteristic: this._config.characteristic
      });
  }

  disconnectDevice() {
    this.ble.disconnectDevice();
  }
}
