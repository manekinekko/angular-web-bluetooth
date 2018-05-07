var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Injectable, EventEmitter } from '@angular/core';
import { Observable, Subject, from } from 'rxjs';
import { filter, mergeMap } from 'rxjs/operators';
import { BrowserWebBluetooth } from './platform/browser';
import { ConsoleLoggerService } from './logger.service';
var BluetoothCore = /** @class */ (function (_super) {
    __extends(BluetoothCore, _super);
    function BluetoothCore(_webBle, _console) {
        var _this = _super.call(this) || this;
        _this._webBle = _webBle;
        _this._console = _console;
        _this._device$ = new EventEmitter();
        _this._gatt$ = new EventEmitter();
        _this._characteristicValueChanges$ = new EventEmitter();
        _this._gattServer = null;
        return _this;
    }
    /**
     * @return {Observable<BluetoothDevice>}
     */
    /**
       * @return {Observable<BluetoothDevice>}
       */
    BluetoothCore.prototype.getDevice$ = /**
       * @return {Observable<BluetoothDevice>}
       */
    function () {
        return this._device$;
    };
    /**
     * @return {Observable<BluetoothRemoteGATTServer>}
     */
    /**
       * @return {Observable<BluetoothRemoteGATTServer>}
       */
    BluetoothCore.prototype.getGATT$ = /**
       * @return {Observable<BluetoothRemoteGATTServer>}
       */
    function () {
        return this._gatt$;
    };
    /**
     * @return {Observable<DataView>}
     */
    /**
       * @return {Observable<DataView>}
       */
    BluetoothCore.prototype.streamValues$ = /**
       * @return {Observable<DataView>}
       */
    function () {
        return this._characteristicValueChanges$.pipe(filter(function (data) { return data && data.byteLength > 0; }));
        //.filter(
        //   value => value && value.byteLength > 0
        // );
    };
    /**
     * Run the discovery process.
     *
     * @param  {RequestDeviceOptions} Options such as filters and optional services
     * @return {Promise<BluetoothDevice>} The GATT server for the chosen device
     */
    /**
       * Run the discovery process.
       *
       * @param  {RequestDeviceOptions} Options such as filters and optional services
       * @return {Promise<BluetoothDevice>} The GATT server for the chosen device
       */
    BluetoothCore.prototype.discover = /**
       * Run the discovery process.
       *
       * @param  {RequestDeviceOptions} Options such as filters and optional services
       * @return {Promise<BluetoothDevice>} The GATT server for the chosen device
       */
    function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        options.optionalServices = options.optionalServices || ['generic_access'];
        this._console.log('[BLE::Info] Requesting devices with options %o', options);
        return this._webBle
            .requestDevice(options)
            .then(function (device) {
            if (device.ongattserverdisconnected) {
                device.addEventListener('gattserverdisconnected', _this.onDeviceDisconnected.bind(_this));
            }
            _this._device$.emit(device);
            return device;
        });
    };
    /**
     * @param  {Event}  event [description]
     */
    /**
       * @param  {Event}  event [description]
       */
    BluetoothCore.prototype.onDeviceDisconnected = /**
       * @param  {Event}  event [description]
       */
    function (event) {
        var disconnectedDevice = event.target;
        this._console.log('[BLE::Info] disconnected device %o', disconnectedDevice);
        this._device$.emit(null);
    };
    /**
     * Run the discovery process.
     *
     * @param  {RequestDeviceOptions} Options such as filters and optional services
     * @return {Observable<BluetoothRemoteGATTServer>} Emites the value of the requested service read from the device
     */
    /**
       * Run the discovery process.
       *
       * @param  {RequestDeviceOptions} Options such as filters and optional services
       * @return {Observable<BluetoothRemoteGATTServer>} Emites the value of the requested service read from the device
       */
    BluetoothCore.prototype.discover$ = /**
       * Run the discovery process.
       *
       * @param  {RequestDeviceOptions} Options such as filters and optional services
       * @return {Observable<BluetoothRemoteGATTServer>} Emites the value of the requested service read from the device
       */
    function (options) {
        var _this = this;
        return from(this.discover(options)).pipe(mergeMap(function (device) { return _this.connectDevice$(device); }));
    };
    /**
     * Connect to current device.
     *
     * @return {Promise<BluetoothRemoteGATTServer>} Emites the gatt server instance of the requested device
     */
    /**
       * Connect to current device.
       *
       * @return {Promise<BluetoothRemoteGATTServer>} Emites the gatt server instance of the requested device
       */
    BluetoothCore.prototype.connectDevice = /**
       * Connect to current device.
       *
       * @return {Promise<BluetoothRemoteGATTServer>} Emites the gatt server instance of the requested device
       */
    function (device) {
        var _this = this;
        if (device) {
            this._console.log('[BLE::Info] Connecting to GATT Server of %o', device);
            return device.gatt.connect().then(function (gattServer) {
                _this._gattServer = gattServer;
                _this._gatt$.emit(gattServer);
                return gattServer;
            }, function (error) {
                // probably the user has canceled the discovery
                Promise.reject("" + error.message);
            });
        }
        else {
            this._console.error('[BLE::Error] Was not able to connect to GATT Server');
            this._gatt$.error(null);
        }
    };
    /**
     * Connect to current device.
     *
     * @return {Observable<BluetoothRemoteGATTServer>} Emites the gatt server instance of the requested device
     */
    /**
       * Connect to current device.
       *
       * @return {Observable<BluetoothRemoteGATTServer>} Emites the gatt server instance of the requested device
       */
    BluetoothCore.prototype.connectDevice$ = /**
       * Connect to current device.
       *
       * @return {Observable<BluetoothRemoteGATTServer>} Emites the gatt server instance of the requested device
       */
    function (device) {
        return from(this.connectDevice(device));
    };
    /**
     * @param  {BluetoothRemoteGATTServer}              gatt
     * @param  {BluetoothServiceUUID}                   service
     * @return {Observable<BluetoothRemoteGATTService>}
     */
    /**
       * @param  {BluetoothRemoteGATTServer}              gatt
       * @param  {BluetoothServiceUUID}                   service
       * @return {Observable<BluetoothRemoteGATTService>}
       */
    BluetoothCore.prototype.getPrimaryService$ = /**
       * @param  {BluetoothRemoteGATTServer}              gatt
       * @param  {BluetoothServiceUUID}                   service
       * @return {Observable<BluetoothRemoteGATTService>}
       */
    function (gatt, service) {
        this._console.log('[BLE::Info] Getting primary service "%s" of %o', service, gatt);
        return from(gatt
            .getPrimaryService(service)
            .then(function (remoteService) { return Promise.resolve(remoteService); }, function (error) {
            return Promise.reject(error.message + " (" + service + ")");
        }));
    };
    /**
     * @param  {BluetoothRemoteGATTService}                    primaryService
     * @param  {BluetoothCharacteristicUUID}                   characteristic
     * @return {Observable<BluetoothRemoteGATTCharacteristic>}
     */
    /**
       * @param  {BluetoothRemoteGATTService}                    primaryService
       * @param  {BluetoothCharacteristicUUID}                   characteristic
       * @return {Observable<BluetoothRemoteGATTCharacteristic>}
       */
    BluetoothCore.prototype.getCharacteristic$ = /**
       * @param  {BluetoothRemoteGATTService}                    primaryService
       * @param  {BluetoothCharacteristicUUID}                   characteristic
       * @return {Observable<BluetoothRemoteGATTCharacteristic>}
       */
    function (primaryService, characteristic) {
        var _this = this;
        this._console.log('[BLE::Info] Getting Characteristic "%s" of %o', characteristic, primaryService);
        var characteristicPromise = primaryService
            .getCharacteristic(characteristic)
            .then(function (char) {
            // listen for characteristic value changes
            if (char.properties.notify) {
                char.startNotifications().then(function (_) {
                    _this._console.log('[BLE::Info] Starting notifications of "%s"', characteristic);
                    return char.addEventListener('characteristicvaluechanged', _this.onCharacteristicChanged.bind(_this));
                }, function (error) {
                    Promise.reject(error.message + " (" + characteristic + ")");
                });
            }
            else {
                char.addEventListener('characteristicvaluechanged', _this.onCharacteristicChanged.bind(_this));
            }
            return char;
        }, function (error) {
            Promise.reject(error.message + " (" + characteristic + ")");
        });
        return from(characteristicPromise);
    };
    /**
     * @param  {BluetoothServiceUUID}                   service        [description]
     * @param  {BluetoothCharacteristicUUID}            characteristic [description]
     * @param  {ArrayBuffer}                            state          [description]
     * @return {Observable<BluetoothRemoteGATTService>}                [description]
     */
    /**
       * @param  {BluetoothServiceUUID}                   service        [description]
       * @param  {BluetoothCharacteristicUUID}            characteristic [description]
       * @param  {ArrayBuffer}                            state          [description]
       * @return {Observable<BluetoothRemoteGATTService>}                [description]
       */
    BluetoothCore.prototype.setCharacteristicState = /**
       * @param  {BluetoothServiceUUID}                   service        [description]
       * @param  {BluetoothCharacteristicUUID}            characteristic [description]
       * @param  {ArrayBuffer}                            state          [description]
       * @return {Observable<BluetoothRemoteGATTService>}                [description]
       */
    function (service, characteristic, state) {
        var _this = this;
        var primaryService = this.getPrimaryService$(this._gattServer, service);
        primaryService
            .pipe(mergeMap(function (primaryService) {
            return _this.getCharacteristic$(primaryService, characteristic);
        }))
            .subscribe(function (characteristic) {
            return _this.writeValue$(characteristic, state);
        });
        return primaryService;
    };
    /**
     * @param  {BluetoothServiceUUID}                   service        [description]
     * @param  {BluetoothCharacteristicUUID}            characteristic [description]
     * @return {Observable<BluetoothRemoteGATTService>}                [description]
     */
    /**
       * @param  {BluetoothServiceUUID}                   service        [description]
       * @param  {BluetoothCharacteristicUUID}            characteristic [description]
       * @return {Observable<BluetoothRemoteGATTService>}                [description]
       */
    BluetoothCore.prototype.enableCharacteristic = /**
       * @param  {BluetoothServiceUUID}                   service        [description]
       * @param  {BluetoothCharacteristicUUID}            characteristic [description]
       * @return {Observable<BluetoothRemoteGATTService>}                [description]
       */
    function (service, characteristic, state) {
        state = state || new Uint8Array([1]);
        return this.setCharacteristicState(service, characteristic, state);
    };
    /**
     * @param  {BluetoothServiceUUID}                   service        [description]
     * @param  {BluetoothCharacteristicUUID}            characteristic [description]
     * @return {Observable<BluetoothRemoteGATTService>}                [description]
     */
    /**
       * @param  {BluetoothServiceUUID}                   service        [description]
       * @param  {BluetoothCharacteristicUUID}            characteristic [description]
       * @return {Observable<BluetoothRemoteGATTService>}                [description]
       */
    BluetoothCore.prototype.disbaleCharacteristic = /**
       * @param  {BluetoothServiceUUID}                   service        [description]
       * @param  {BluetoothCharacteristicUUID}            characteristic [description]
       * @return {Observable<BluetoothRemoteGATTService>}                [description]
       */
    function (service, characteristic, state) {
        state = state || new Uint8Array([0]);
        return this.setCharacteristicState(service, characteristic, state);
    };
    /**
     * @param  {BluetoothRemoteGATTService}                    primaryService  [description]
     * @param  {BluetoothCharacteristicUUID[]}                 characteristics [description]
     * @return {Observable<BluetoothRemoteGATTCharacteristic>}                 [description]
     */
    // getCharacteristics$(primaryService: BluetoothRemoteGATTService, characteristics: BluetoothCharacteristicUUID[]): Observable<BluetoothRemoteGATTCharacteristic> {
    //   characteristics = characteristics.map( (char$) => this.getCharacteristic$(primaryService, char$) )
    //   return Observable.merge.apply(this, characteristics);
    // }
    /**
     * @param  {Event} event [description]
     */
    /**
       * @param  {BluetoothRemoteGATTService}                    primaryService  [description]
       * @param  {BluetoothCharacteristicUUID[]}                 characteristics [description]
       * @return {Observable<BluetoothRemoteGATTCharacteristic>}                 [description]
       */
    // getCharacteristics$(primaryService: BluetoothRemoteGATTService, characteristics: BluetoothCharacteristicUUID[]): Observable<BluetoothRemoteGATTCharacteristic> {
    //   characteristics = characteristics.map( (char$) => this.getCharacteristic$(primaryService, char$) )
    //   return Observable.merge.apply(this, characteristics);
    // }
    /**
       * @param  {Event} event [description]
       */
    BluetoothCore.prototype.onCharacteristicChanged = /**
       * @param  {BluetoothRemoteGATTService}                    primaryService  [description]
       * @param  {BluetoothCharacteristicUUID[]}                 characteristics [description]
       * @return {Observable<BluetoothRemoteGATTCharacteristic>}                 [description]
       */
    // getCharacteristics$(primaryService: BluetoothRemoteGATTService, characteristics: BluetoothCharacteristicUUID[]): Observable<BluetoothRemoteGATTCharacteristic> {
    //   characteristics = characteristics.map( (char$) => this.getCharacteristic$(primaryService, char$) )
    //   return Observable.merge.apply(this, characteristics);
    // }
    /**
       * @param  {Event} event [description]
       */
    function (event) {
        this._console.log('[BLE::Info] Dispatching new characteristic value %o', event);
        var value = event.target.value;
        this._characteristicValueChanges$.emit(value);
    };
    /**
     * @param  {BluetoothRemoteGATTCharacteristic} characteristic
     * @return {Observable<DataView>}
     */
    /**
       * @param  {BluetoothRemoteGATTCharacteristic} characteristic
       * @return {Observable<DataView>}
       */
    BluetoothCore.prototype.readValue$ = /**
       * @param  {BluetoothRemoteGATTCharacteristic} characteristic
       * @return {Observable<DataView>}
       */
    function (characteristic) {
        this._console.log('[BLE::Info] Reading Characteristic %o', characteristic);
        return from(characteristic
            .readValue()
            .then(function (data) { return Promise.resolve(data); }, function (error) { return Promise.reject("" + error.message); }));
    };
    /**
     * @param  {BluetoothRemoteGATTCharacteristic} characteristic [description]
     * @param  {ArrayBuffer}                       value          [description]
     * @return {Observable<DataView>}
     */
    /**
       * @param  {BluetoothRemoteGATTCharacteristic} characteristic [description]
       * @param  {ArrayBuffer}                       value          [description]
       * @return {Observable<DataView>}
       */
    BluetoothCore.prototype.writeValue$ = /**
       * @param  {BluetoothRemoteGATTCharacteristic} characteristic [description]
       * @param  {ArrayBuffer}                       value          [description]
       * @return {Observable<DataView>}
       */
    function (characteristic, value) {
        this._console.log('[BLE::Info] Writing Characteristic %o', characteristic);
        return from(characteristic
            .writeValue(value)
            .then(function (_) { return Promise.resolve(); }, function (error) { return Promise.reject("" + error.message); }));
    };
    /**
     * @param  {BluetoothRemoteGATTCharacteristic} characteristic The characteristic whose value you want to observe
     * @return {Observable<DataView>}
     */
    /**
       * @param  {BluetoothRemoteGATTCharacteristic} characteristic The characteristic whose value you want to observe
       * @return {Observable<DataView>}
       */
    BluetoothCore.prototype.observeValue$ = /**
       * @param  {BluetoothRemoteGATTCharacteristic} characteristic The characteristic whose value you want to observe
       * @return {Observable<DataView>}
       */
    function (characteristic) {
        characteristic.startNotifications();
        var disconnected = Observable.create(characteristic.service.device, 'gattserverdisconnected');
        return Observable.create(characteristic, 'characteristicvaluechanged')
            .takeUntil(disconnected)
            .map(function (event) {
            return event.target.value;
        });
    };
    /**
     * @param  {DataView} data   [description]
     * @param  {number}   offset [description]
     * @return {number}          [description]
     */
    /**
       * @param  {DataView} data   [description]
       * @param  {number}   offset [description]
       * @return {number}          [description]
       */
    BluetoothCore.prototype.littleEndianToUint16 = /**
       * @param  {DataView} data   [description]
       * @param  {number}   offset [description]
       * @return {number}          [description]
       */
    function (data, offset) {
        return ((this.littleEndianToUint8(data, offset + 1) << 8) +
            this.littleEndianToUint8(data, offset));
    };
    /**
     * @param  {DataView} data   [description]
     * @param  {number}   offset [description]
     * @return {number}          [description]
     */
    /**
       * @param  {DataView} data   [description]
       * @param  {number}   offset [description]
       * @return {number}          [description]
       */
    BluetoothCore.prototype.littleEndianToUint8 = /**
       * @param  {DataView} data   [description]
       * @param  {number}   offset [description]
       * @return {number}          [description]
       */
    function (data, offset) {
        return data.getUint8(offset);
    };
    /**
     * Sends random data (for testing purpose only).
     * @return {Observable<number>}
     */
    /**
       * Sends random data (for testing purpose only).
       * @return {Observable<number>}
       */
    BluetoothCore.prototype.fakeNext = /**
       * Sends random data (for testing purpose only).
       * @return {Observable<number>}
       */
    function (fakeValue) {
        if (fakeValue === undefined) {
            fakeValue = function () {
                var dv = new DataView(new ArrayBuffer(8));
                dv.setUint8(0, (Math.random() * 110) | 0);
                return dv;
            };
        }
        this._characteristicValueChanges$.emit(fakeValue());
    };
    BluetoothCore.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    BluetoothCore.ctorParameters = function () { return [
        { type: BrowserWebBluetooth, },
        { type: ConsoleLoggerService, },
    ]; };
    return BluetoothCore;
}(Subject));
export { BluetoothCore };
