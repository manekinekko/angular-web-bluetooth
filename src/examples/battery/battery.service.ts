import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
  BluetoothCore,
  BluetoothRemoteGATTServer,
  BluetoothRemoteGATTService,
  BluetoothRemoteGATTCharacteristic,
  DataView
} from '@manekinekko/angular-web-bluetooth';

@Injectable()
export class BatteryLevelService {

  static GATT_CHARACTERISTIC_BATTERY_LEVEL = 'battery_level';
  static GATT_PRIMARY_SERVICE = 'battery_service';

  constructor(
    public ble: BluetoothCore
  ) {}

  getFakeValue() {
    this.ble.fakeNext();
  }

  getDevice() {
    return this.ble.getDevice$();
  }

  streamValues() {
    return this.ble.streamValues$()
      .map( (value: DataView) => {
        return value.getUint8(0);
      });
  }

  /**
   * Get Battery Level GATT Characteristic value.
   * This logic is specific to this service, this is why we can't abstract it elsewhere.
   * The developer is free to provide any service, and characteristics she wants.
   *
   * @return {Observable<number>} Emites the value of the requested service read from the device
   */
   getBatteryLevel(): Observable<number> {
    console.log('Getting Battery Service...');

    return this.ble
        .discover$({
          optionalServices: [BatteryLevelService.GATT_PRIMARY_SERVICE]
        })
        .mergeMap( (gatt: BluetoothRemoteGATTServer)  => this.ble.getPrimaryService$(gatt, BatteryLevelService.GATT_PRIMARY_SERVICE) )
        .mergeMap( (primaryService: BluetoothRemoteGATTService) => this.ble.getCharacteristic$(primaryService, BatteryLevelService.GATT_CHARACTERISTIC_BATTERY_LEVEL) )
        .mergeMap( (characteristic: BluetoothRemoteGATTCharacteristic) =>  this.ble.readValue$(characteristic) )
        .map( (value: DataView) => value.getUint8(0) );

  }

}
