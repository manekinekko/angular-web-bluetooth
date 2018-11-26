import { Injectable } from '@angular/core';
import { map, mergeMap } from 'rxjs/operators';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';

@Injectable({
  providedIn: 'root'
})
export class TemperatureThingy52Service {
  static GATT_CHARACTERISTIC = 'ef680201-9b35-4933-9b10-52ffa9740042';
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
  getTemperature() {
    console.log('Getting Temperature Service...');

    try {
      return (
        this.ble
          .read$({
            acceptAllDevices: true,
            optionalServices: [TemperatureThingy52Service.GATT_PRIMARY_SERVICE],
            service: TemperatureThingy52Service.GATT_PRIMARY_SERVICE,
            characteristic: TemperatureThingy52Service.GATT_CHARACTERISTIC
          })
          .pipe(
            map((value: DataView) => {
              const integer = value.getInt8(0);
              const decimal = value.getUint8(1);
              return integer + decimal / 100;
            })
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
