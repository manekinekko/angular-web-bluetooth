import { Injectable } from '@angular/core';
import { map, mergeMap } from 'rxjs/operators';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';

@Injectable({
  providedIn: 'root'
})
export class BatteryLevelService {
  static GATT_CHARACTERISTIC = 'battery_level';
  static GATT_PRIMARY_SERVICE = 'battery_service';

  constructor(public ble: BluetoothCore) {}

  getDevice() {
    // call this method to get the connected device
    return this.ble.getDevice$();
  }

  /**
   * Get Battery Level GATT Characteristic value.
   * This logic is specific to this service, this is why we can't abstract it elsewhere.
   * The developer is free to provide any service, and characteristics she wants.
   *
   * @return Emites the value of the requested service read from the device
   */
  getBatteryLevel() {
    console.log('Getting Battery Service...');

    try {
      return (
        this.ble
          .read$({
            acceptAllDevices: true,
            optionalServices: [BatteryLevelService.GATT_PRIMARY_SERVICE],
            service: BatteryLevelService.GATT_PRIMARY_SERVICE,
            characteristic: BatteryLevelService.GATT_CHARACTERISTIC
          })
          .pipe(
            map((value: DataView) => value.getUint8(0))
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
