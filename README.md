![image](https://cloud.githubusercontent.com/assets/1699357/21510721/556f650c-cc97-11e6-8a69-ddd67eeeebb8.png)
The missing Web Bluetooth for Angular (v2+).
 
# Install it 

## Yarn it

`yarn add @manekinekko/angular-web-bluetooth`

## NPM it

`npm i -S @manekinekko/angular-web-bluetooth`

# Use it

## 1) import the `WebBluetoothModule` module

```typescript
import { NgModule } from '@angular/core';
import { WebBluetoothModule } from '@manekinekko/angular-web-bluetooth';

@NgModule({
  imports: [
    //...,
    WebBluetoothModule
  ],
  //...
})
export class AppModule { }

```

## 2) inject the `WebBluetooth` service into your component

```typescript
@Component({
  selector: 'app-luxometer',
  templateUrl: 'luxometer.component.html',
  styleUrls: ['luxometer.component.css'],
  providers: [ LightService, WebBluetooth ]
})
export class LuxometerComponent implements OnInit {}
```

## 3) use it in your service

```typescript
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
  ) {}

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
   * The developer is free to provide any service, and characteristics she/he wants.
   *
   * @return {Observable<number>} Emites the value of the requested service read from the device
   */
   getBatteryLevel(): Observable<number> {
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
```

# API

These are the most required API calls you will need but there are other helpers you can use (see service here):

_Note: a cleaner documentation will come soon_

### getDevice$(): Observable<BluetoothDevice>
### discover$(options?: RequestDeviceOptions): Observable<number>
### getGATT$(): Observable<BluetoothRemoteGATTServer>
### getPrimaryService$(gatt: BluetoothRemoteGATTServer, service: BluetoothServiceUUID): Observable<BluetoothRemoteGATTService>
### getCharacteristic$(primaryService: BluetoothRemoteGATTService, characteristic: BluetoothCharacteristicUUID): Observable<BluetoothRemoteGATTCharacteristic>
### streamValues$(): Observable<DataView>
### readValue$(characteristic: BluetoothRemoteGATTCharacteristic): Observable<DataView>
### fakeNext(fakeValue?: Function): void

# Have a PR?

All contributions are welcome ;)

# License

The MIT License (MIT) Copyright (c) 2017 - Wassim CHEGHAM

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.