import { Injectable } from '@angular/core';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';
import { map, tap } from 'rxjs/operators';

type ServiceOptions = {
    characteristic: string;
    service: string,
    decoder(value: DataView): number
};

@Injectable({
  providedIn: 'root'
})
export class BleService {

    // tslint:disable-next-line: variable-name
    private _config: ServiceOptions = {} as any;

  constructor(public ble: BluetoothCore) {}

  config(options: ServiceOptions) {
    this._config = options;
  }

  getDevice() {
    return this.ble.getDevice$();
  }

  stream() {
    return this.ble.streamValues$().pipe(
      tap(value => console.log(value)),
      map(this._config.decoder)
    );
  }

  value() {
    return this.ble
      .value$({
        service: this._config.service,
        characteristic: this._config.characteristic
      })
      .pipe(
        map(this._config.decoder)
      );
  }

  disconnectDevice() {
    this.ble.disconnectDevice();
  }
}
