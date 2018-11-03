import { Injectable } from '@angular/core';
import { map, mergeMap } from 'rxjs/operators';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';

@Injectable({
  providedIn: 'root'
})
export class BatteryLevelService {
  static GATT_CHARACTERISTIC_BATTERY_LEVEL = 'battery_level';
  static GATT_PRIMARY_SERVICE = 'battery_service';

  constructor(public ble: BluetoothCore) {}

  getFakeValue() {
    this.ble.fakeNext();
  }

  getDevice() {
    // call this method to get the connected device
    return this.ble.getDevice$();
  }

  streamValues() {
    // call this method to get a stream of values emitted by the device
    return this.ble.streamValues$().pipe(map((value: DataView) => value.getUint8(0)));
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

          // 1) call the discover method will trigger the discovery process (by the browser)
          .discover$({
            acceptAllDevices: true,
            optionalServices: [BatteryLevelService.GATT_PRIMARY_SERVICE]
          })
          .pipe(
            // 2) get that service
            mergeMap((gatt: BluetoothRemoteGATTServer) => {
              return this.ble.getPrimaryService$(gatt, BatteryLevelService.GATT_PRIMARY_SERVICE);
            }),
            // 3) get a specific characteristic on that service
            mergeMap((primaryService: BluetoothRemoteGATTService) => {
              return this.ble.getCharacteristic$(primaryService, BatteryLevelService.GATT_CHARACTERISTIC_BATTERY_LEVEL);
            }),
            // 4) ask for the value of that characteristic (will return a DataView)
            mergeMap((characteristic: BluetoothRemoteGATTCharacteristic) => {
              return this.ble.readValue$(characteristic);
            }),
            // 5) on that DataView, get the right value
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
