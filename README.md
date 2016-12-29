[![CircleCI](https://circleci.com/gh/manekinekko/angular-web-bluetooth.svg?style=svg)](https://circleci.com/gh/manekinekko/angular-web-bluetooth)

# The missing Web Bluetooth module for Angular (v2+) 

<img src="https://cloud.githubusercontent.com/assets/1699357/21510721/556f650c-cc97-11e6-8a69-ddd67eeeebb8.png" width="150">

 
# Blog post

I posted an article about this module on medium: https://medium.com/google-developer-experts/the-web-bluetooth-module-for-angular-9336c9535d04#.f6dp9z163
 
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
    WebBluetoothModule.forRoot()
  ],
  //...
})
export class AppModule { }

```

## 2) use it in your service

See the [battery-level.service.ts](https://github.com/manekinekko/angular-web-bluetooth-starter/blob/master/src/app/battery-level/battery-level.component.ts) file for a real use case.

## Need a starter?

You're welcome: https://github.com/manekinekko/angular-web-bluetooth-starter

# API

These are the most required API calls you will need but there are other helpers you can use (see service here):

_Note: a cleaner documentation will come soon_

#### getDevice$(): Observable<BluetoothDevice>
@todo: add description

#### discover$(options?: RequestDeviceOptions): Observable<number>
@todo: add description

#### getGATT$(): Observable<BluetoothRemoteGATTServer>
@todo: add description

#### getPrimaryService$(gatt: BluetoothRemoteGATTServer, service: BluetoothServiceUUID): Observable<BluetoothRemoteGATTService>
@todo: add description

#### getCharacteristic$(primaryService: BluetoothRemoteGATTService, characteristic: BluetoothCharacteristicUUID): Observable<BluetoothRemoteGATTCharacteristic>
@todo: add description

#### streamValues$(): Observable<DataView>
@todo: add description

#### readValue$(characteristic: BluetoothRemoteGATTCharacteristic): Observable<DataView>
@todo: add description

#### fakeNext(fakeValue?: Function): void
@todo: add description

# Have a PR?

All contributions are welcome ;)

# License

The MIT License (MIT) Copyright (c) 2017 - Wassim CHEGHAM

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
