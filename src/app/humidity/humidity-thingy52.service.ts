import { Injectable } from '@angular/core';
import { map, mergeMap } from 'rxjs/operators';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';

@Injectable({
  providedIn: 'root'
})
export class HumidityThingy52Service {
  static GATT_CHARACTERISTIC = 'ef680203-9b35-4933-9b10-52ffa9740042';
  static GATT_PRIMARY_SERVICE = 'ef680200-9b35-4933-9b10-52ffa9740042';

  constructor(public ble: BluetoothCore) {}

  getDevice() {
    // call this method to get the connected device
    return this.ble.getDevice$();
  }

  /**
   * Get temperature value.
   *
   * @return Emites the value of the requested service read from the device
   */
  getHumidity() {
    console.log('Getting Humidity Service...');

    try {
      return (
        this.ble
          .read$({
            acceptAllDevices: true,
            optionalServices: [HumidityThingy52Service.GATT_PRIMARY_SERVICE],
            service: HumidityThingy52Service.GATT_PRIMARY_SERVICE,
            characteristic: HumidityThingy52Service.GATT_CHARACTERISTIC
          })
          .pipe(
            map((value: DataView) => value.getInt8(0))
          )
      );
    } catch (e) {
      console.error('Oops! can not read value from %s');
    }
  }

  disconnectDevice() {
    // call this method to disconnect device
    this.ble.disconnectDevice();
  }
}
