![image](https://cloud.githubusercontent.com/assets/1699357/21510721/556f650c-cc97-11e6-8a69-ddd67eeeebb8.png)
The missing Web Bluetooth for Angular (v2+).
 
# Install it 

## Yarn it

`yarn add @manekinekko/angular-web-bluetooth`

## NPM it

`npm i -S @manekinekko/angular-web-bluetooth`

# Use it

See the starter...

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