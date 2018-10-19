<div align="center">
  <img src="https://cloud.githubusercontent.com/assets/1699357/21510721/556f650c-cc97-11e6-8a69-ddd67eeeebb8.png" width="250" />
</div>
<h2 align="center">The missing Web Bluetooth module for Angular</h2>
<h2 align="center"><a href="https://circleci.com/gh/manekinekko/angular-web-bluetooth/tree/master"><img src="https://circleci.com/gh/manekinekko/angular-web-bluetooth.svg?style=svg"> <img src="https://app.buddy.works/manekinekko-1/angular-web-bluetooth/pipelines/pipeline/136661/badge.svg?token=cee6a291d42aeeb701176104f8623d429614bf77cb0c7d7b68bc5a342e49ffe9"/></a></h2>

### Yarn it

`yarn add @manekinekko/angular-web-bluetooth @types/web-bluetooth`

### or NPM it

`npm i -S @manekinekko/angular-web-bluetooth @types/web-bluetooth`

Note: Make also sure the `@types/web-bluetooth` is installed OK.

## Use it

## 1) import the `WebBluetoothModule` module

```typescript
import { NgModule } from '@angular/core';
import { WebBluetoothModule } from '@manekinekko/angular-web-bluetooth';

@NgModule({
  imports: [
    //...,
    WebBluetoothModule.forRoot({
      enableTracing: true / false // enable logs
    })
  ]
  //...
})
export class AppModule {}
```

## 2) use it in your service/component

Here is an annotated example using the `BluetoothCore` service:

```javascript
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
}
```

See the [starter](https://github.com/manekinekko/angular-web-bluetooth-starter/tree/master/src/app) for a complete use case.

## API documentation

Here 👉 https://manekinekko.github.io/angular-web-bluetooth/

## Need a starter?

<img src="https://cloud.githubusercontent.com/assets/1699357/21523148/b843ceb0-cd0b-11e6-974a-50294a797b27.png"/>

This project serves also as a starter. Run the following command:

`npm start`

## Blog post

Checkout my post on medium.

<p align="center">
  <a href="https://medium.com/google-developer-experts/the-web-bluetooth-module-for-angular-9336c9535d04#.f6dp9z163">
    <img src="https://cloud.githubusercontent.com/assets/1699357/21696708/7e33cca4-d38f-11e6-8a03-6833b88e82fa.png" >
  </a>
</p>

## Have a PR?

All contributions are welcome ;)

# License

The MIT License (MIT) Copyright (c) 2017 - Wassim CHEGHAM

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
