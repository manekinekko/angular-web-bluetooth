# Modification from original repo

```
yarn global add rxjs-tslint
yarn add @angular/compiler-cli
rxjs-5-to-6-migrate -p tsconfig.json
```

# Original

<div align="center">
  <img src="https://cloud.githubusercontent.com/assets/1699357/21510721/556f650c-cc97-11e6-8a69-ddd67eeeebb8.png" width="250" />
</div>
<h2 align="center">The missing Web Bluetooth module for Angular <a href="https://circleci.com/gh/manekinekko/angular-web-bluetooth/tree/master"><img src="https://circleci.com/gh/manekinekko/angular-web-bluetooth.svg?style=svg"></a></h2>

### Yarn it

`yarn add @manekinekko/angular-web-bluetooth`

### or NPM it

`npm i -S @manekinekko/angular-web-bluetooth`

## Use it

## 1) import the `WebBluetoothModule` module

```typescript
import { NgModule } from '@angular/core';
import { WebBluetoothModule } from '@manekinekko/angular-web-bluetooth';

@NgModule({
  imports: [
    //...,
    WebBluetoothModule.forRoot({
      enableTracing: true/false // enable logs
    })
  ],
  //...
})
export class AppModule { }

```

## 2) use it in your service/component

Here is an annotated example using the `BluetoothCore` service:

```javascript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';


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

    // call this method to get the connected device
    return this.ble.getDevice$();
  }

  streamValues() {

    // call this method to get a stream of values emitted by the device
    return this.ble.streamValues$()
      .map(value => value.getUint8(0));
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

    try {
        return this.ble

          // 1) call the discover method will trigger the discovery process (by the browser)
          .discover$({ filters: [], optionalServices: [BatteryLevelService.GATT_PRIMARY_SERVICE] })

          // 2) get that service
          .mergeMap(gatt => this.ble.getPrimaryService$(gatt, BatteryLevelService.GATT_PRIMARY_SERVICE))
          
          // 3) get a specific characteristic on that service
          .mergeMap(primaryService => this.ble.getCharacteristic$(primaryService, BatteryLevelService.GATT_CHARACTERISTIC_BATTERY_LEVEL))
          
          // 4) ask for the value of that characteristic (will return a DataView)
          .mergeMap(characteristic => this.ble.readValue$(characteristic))
          
          // 5) on that DataView, get the right value
          .map(value => value.getUint8(0));
    }
    catch(e) {
      console.error('Oops! can not read value from %s');
    }

  }

}
```

See the [starter](https://github.com/manekinekko/angular-web-bluetooth-starter/tree/master/src/app) for a complete use case.

## API documentation

Here 👉https://manekinekko.github.io/angular-web-bluetooth/

## Need a starter?

You can use [this starter](https://github.com/manekinekko/angular-web-bluetooth-starter) to start building your first Web Bluetooth module.

## Blog post
Checkout my post on medium.

<p align="center">
  <a href="https://medium.com/google-developer-experts/the-web-bluetooth-module-for-angular-9336c9535d04#.f6dp9z163">
    <img src="https://cloud.githubusercontent.com/assets/1699357/21696708/7e33cca4-d38f-11e6-8a03-6833b88e82fa.png" >
  </a>
</p>
 
## Have a PR?

All contributions are welcome ;)
