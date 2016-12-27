import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import {
  BluetoothCore,
  BluetoothRemoteGATTServer,
  BluetoothRemoteGATTService,
  BluetoothRemoteGATTCharacteristic,
  DataView,
  TiTag,
  TITAG_SERVICES
} from '../shared';

@Injectable()
export class LightService {

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
      .map( this.mappedValue.bind(this) );
  }

  getValue(): Observable<number|string> {
    console.log('Getting Light Service...');

    return this._core

       .discover$({
         filters: [{
           name: 'CC2650 SensorTag'
         }],
         optionalServices: TITAG_SERVICES

        // @TODO add auto-enable config, to enable a sensor, for instance (see below)
        //  enable: [{
        //    characteristic: TiTag.LIGHT.CONFIGURATION,
        //    value: new Uint8Array([1])
        //  }]

       })
       .flatMap( (gatt: BluetoothRemoteGATTServer)  => {
          return this._core.enableCharacteristic(TiTag.LIGHT.SERVICE, TiTag.LIGHT.CONFIGURATION);
       })

       .flatMap( (primaryService: BluetoothRemoteGATTService) => this._core.getCharacteristic$(primaryService, TiTag.LIGHT.DATA) )

       // @TODO we should provide those helper methods in core:
       // - readValue_8$(): number
       // - readValue_16$(): number
       // - readValue_32$(): number
       // - readValue_64$(): number
       .flatMap( (characteristic: BluetoothRemoteGATTCharacteristic) =>  this._core.readValue$(characteristic) )

       .map( this.mappedValue.bind(this) )

 }

 mappedValue(data: DataView): number {
    let value = this._core.littleEndianToUint16(data, 0);

    // Extraction of pressure value, based on sfloatExp2ToDouble from
    // BLEUtility.m in Texas Instruments TI BLE SensorTag iOS app
    // source code.
    let mantissa = value & 0x0FFF;
    let exponent = value >> 12;
    let magnitude = Math.pow(2, exponent);
    let output = (mantissa * magnitude);
    let lux = output / 100.0;
    return +lux.toFixed(2);
 }

}
