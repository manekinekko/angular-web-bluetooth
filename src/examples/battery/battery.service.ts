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
    private _core: BluetoothCore
  ) {
  }

  getFakeValue() {
    this._core.fakeNext();
  }

  getDevice() {
    return this._core.getDevice$();
  }

  streamValues() {
    return this._core.streamValues$()
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

    return this._core
        .discover$({
          optionalServices: [BatteryLevelService.GATT_PRIMARY_SERVICE]
        })
        .flatMap( (gatt: BluetoothRemoteGATTServer)  => this._core.getPrimaryService$(gatt, BatteryLevelService.GATT_PRIMARY_SERVICE) )
        .flatMap( (primaryService: BluetoothRemoteGATTService) => this._core.getCharacteristic$(primaryService, BatteryLevelService.GATT_CHARACTERISTIC_BATTERY_LEVEL) )
        .flatMap( (characteristic: BluetoothRemoteGATTCharacteristic) =>  this._core.readValue$(characteristic) )
        .map( (value: DataView) => value.getUint8(0) );

  }

}
