import { Injectable } from '@angular/core';
import { map, mergeMap, switchMap, combineLatest, switchAll, flatMap, withLatestFrom, mapTo } from 'rxjs/operators';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';
import { forkJoin, concat } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TemperatureThingy52Service {
  static GATT_CHARACTERISTIC = 'ef680201-9b35-4933-9b10-52ffa9740042';
  static GATT_PRIMARY_SERVICE = 'ef680200-9b35-4933-9b10-52ffa9740042';

  constructor(public ble: BluetoothCore) { }

  private decode(value: DataView) {
    const integer = value.getInt8(0);
    const decimal = value.getUint8(1);
    return integer + decimal / 100;
  }

  getDevice() {
    return this.ble.getDevice$();
  }

  stream() {
    return this.ble.streamValues$().pipe(
      map(this.decode)
    );
  }

  temperature() {
    console.log('Getting Temperature Service...');

    // 1) stream A must be executed first
    this.ble
      .value$({
        acceptAllDevices: true,
        optionalServices: [TemperatureThingy52Service.GATT_PRIMARY_SERVICE],
        service: TemperatureThingy52Service.GATT_PRIMARY_SERVICE,
        characteristic: TemperatureThingy52Service.GATT_CHARACTERISTIC
      }).subscribe(); // <---- 3) how to avoid this?

    // 2) next, stream B should be returned and must run afer stream A (above)
    return this.stream();
  }

  disconnectDevice() {
    this.ble.disconnectDevice();
  }
}
