var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { BrowserWebBluetooth } from './platform/browser';
/**
 * Number of last emitted values to reply
 */
var kBufferSize = 1;
export var BluetoothCore = (function (_super) {
    __extends(BluetoothCore, _super);
    function BluetoothCore(_webBle) {
        _super.call(this, kBufferSize);
        this._webBle = _webBle;
        this._device$ = new EventEmitter();
        this._gatt$ = new EventEmitter();
        this._characteristicValueChanges$ = new EventEmitter();
        this._gattServer = null;
    }
    /**
     * @return {Observable<BluetoothDevice>}
     */
    BluetoothCore.prototype.getDevice$ = function () {
        return this._device$;
    };
    /**
     * @return {Observable<BluetoothRemoteGATTServer>}
     */
    BluetoothCore.prototype.getGATT$ = function () {
        return this._gatt$;
    };
    /**
     * @return {Observable<DataView>}
     */
    BluetoothCore.prototype.streamValues$ = function () {
        return this._characteristicValueChanges$.filter(function (value) { return value && value.byteLength > 0; });
    };
    BluetoothCore.prototype.anyDeviceFilter = function () {
        // This is the closest we can get for now to get all devices.
        // https://github.com/WebBluetoothCG/web-bluetooth/issues/234
        var filters = [];
        filters = Array
            .from('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
            .map(function (c) { return ({ namePrefix: c }); });
        filters.push({ name: '' });
        return filters;
    };
    /**
     * Run the discovery process.
     *
     * @param  {RequestDeviceOptions} Options such as filters and optional services
     * @return {Promise<number>} Emites the value of the requested service read from the device
     */
    BluetoothCore.prototype.discover = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        options.filters = options.filters || this.anyDeviceFilter();
        options.optionalServices = options.optionalServices || ['generic_access'];
        console.log('[BLE::Info] Requesting devices with options %o', options);
        return this._webBle.requestDevice(options)
            .then(function (device) {
            if (device) {
                if (device.ongattserverdisconnected) {
                    device.addEventListener('gattserverdisconnected', _this.onDeviceDisconnected.bind(_this));
                }
                _this._device$.emit(device);
                return device;
            }
            _this._device$.emit(null);
        })
            .catch(function (e) { return console.error('[BLE::Error] discover: %o', e); });
        /** @TODO handl user cancel */
    };
    /**
     * @param  {Event}  event [description]
     */
    BluetoothCore.prototype.onDeviceDisconnected = function (event) {
        var disconnectedDevice = event.target;
        console.log('[BLE::Info] disconnected device %o', disconnectedDevice);
        this._device$.emit(null);
    };
    /**
     * Run the discovery process.
     *
     * @param  {RequestDeviceOptions} Options such as filters and optional services
     * @return {Observable<number>} Emites the value of the requested service read from the device
     */
    BluetoothCore.prototype.discover$ = function (options) {
        var _this = this;
        return this.toObservable(this.discover(options))
            .mergeMap(function (device) { return _this.connectDevice$(device); })
            .catch(function (e) {
            console.error('[BLE::Error] discover$: %o', e);
            return Observable.create(e);
        });
    };
    /**
     * Connect to current device.
     *
     * @return {Promise<any>} Emites the gatt server instance of the requested device
     */
    BluetoothCore.prototype.connectDevice = function (device) {
        var _this = this;
        if (device) {
            console.log('[BLE::Info] Connecting to GATT Server of %o', device);
            return device.gatt.connect()
                .then(function (gattServer) {
                _this._gattServer = gattServer;
                _this._gatt$.emit(gattServer);
                return gattServer;
            })
                .catch(function (e) { return console.error('[BLE::Error] connectDevice %o', e); });
        }
        else {
            console.log('[BLE::Error] Was not able to connect to GATT Server');
            this._gatt$.error(null);
        }
    };
    /**
     * Connect to current device.
     *
     * @return {Observable<any>} Emites the gatt server instance of the requested device
     */
    BluetoothCore.prototype.connectDevice$ = function (device) {
        return this.toObservable(this.connectDevice(device));
    };
    /**
     * @param  {BluetoothRemoteGATTServer}              gatt
     * @param  {BluetoothServiceUUID}                   service
     * @return {Observable<BluetoothRemoteGATTService>}
     */
    BluetoothCore.prototype.getPrimaryService$ = function (gatt, service) {
        console.log('[BLE::Info] Getting primary service "%s" of %o', service, gatt);
        return this.toObservable(gatt.getPrimaryService(service)
            .catch(function (e) { return console.error('[BLE::Error] getPrimaryService$ %o (%s)', e, service); }));
    };
    /**
     * @param  {BluetoothRemoteGATTService}                    primaryService
     * @param  {BluetoothCharacteristicUUID}                   characteristic
     * @return {Observable<BluetoothRemoteGATTCharacteristic>}
     */
    BluetoothCore.prototype.getCharacteristic$ = function (primaryService, characteristic) {
        var _this = this;
        console.log('[BLE::Info] Getting Characteristic "%s" of %o', characteristic, primaryService);
        var characteristicPromise = primaryService.getCharacteristic(characteristic)
            .then(function (char) {
            // listen for characteristic value changes
            if (char.properties.notify) {
                char.startNotifications().then(function (_) {
                    console.log('[BLE::Info] Starting notifications of "%s"', characteristic);
                    return char.addEventListener('characteristicvaluechanged', _this.onCharacteristicChanged.bind(_this));
                }, function (error) {
                    console.error('[BLE::Error] Cannot start notification of "%s" %o', characteristic, error);
                });
            }
            else {
                char.addEventListener('characteristicvaluechanged', _this.onCharacteristicChanged.bind(_this));
            }
            return char;
        })
            .catch(function (e) { return console.error('[BLE::Error] getCharacteristic$ %o', e); });
        return this.toObservable(characteristicPromise);
    };
    /**
     * @param  {BluetoothServiceUUID}                   service        [description]
     * @param  {BluetoothCharacteristicUUID}            characteristic [description]
     * @param  {number}                                 state          [description]
     * @return {Observable<BluetoothRemoteGATTService>}                [description]
     */
    BluetoothCore.prototype.setCharacteristicState = function (service, characteristic, state) {
        var _this = this;
        var primaryService = this.getPrimaryService$(this._gattServer, service);
        primaryService
            .mergeMap(function (primaryService) { return _this.getCharacteristic$(primaryService, characteristic); })
            .subscribe(function (characteristic) { return _this.writeValue$(characteristic, state); });
        return primaryService;
    };
    /**
     * @param  {BluetoothServiceUUID}                   service        [description]
     * @param  {BluetoothCharacteristicUUID}            characteristic [description]
     * @return {Observable<BluetoothRemoteGATTService>}                [description]
     */
    BluetoothCore.prototype.enableCharacteristic = function (service, characteristic, state) {
        state = state || new Uint8Array([1]);
        return this.setCharacteristicState(service, characteristic, state);
    };
    /**
     * @param  {BluetoothServiceUUID}                   service        [description]
     * @param  {BluetoothCharacteristicUUID}            characteristic [description]
     * @return {Observable<BluetoothRemoteGATTService>}                [description]
     */
    BluetoothCore.prototype.disbaleCharacteristic = function (service, characteristic, state) {
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
    BluetoothCore.prototype.onCharacteristicChanged = function (event) {
        console.log('[BLE::Info] Dispatching new characteristic value %o', event);
        var value = event.target.value;
        this._characteristicValueChanges$.emit(value);
    };
    /**
     * @param  {BluetoothRemoteGATTCharacteristic} characteristic
     * @return {Observable<DataView>}
     */
    BluetoothCore.prototype.readValue$ = function (characteristic) {
        console.log('[BLE::Info] Reading Characteristic %o', characteristic);
        return this.toObservable(characteristic.readValue()
            .then(function (value) {
            //     // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
            //     value = value.buffer ? value : new DataView(value);
            return value;
        })
            .catch(function (e) { return console.error('[BLE::Error] readValue$ %o', e); }));
    };
    /**
     * @param  {BluetoothRemoteGATTCharacteristic} characteristic [description]
     * @param  {ArrayBuffer}                       value          [description]
     * @return {Observable<DataView>}
     */
    BluetoothCore.prototype.writeValue$ = function (characteristic, value) {
        console.log('[BLE::Info] Writing Characteristic %o', characteristic);
        return this.toObservable(characteristic.writeValue(value));
    };
    /**
     * A helper function that transforms any Promise into an Observable
     *
     * @param  {Promise<any>}    promise incoming promise
     * @return {Observable<any>}         outgoing observable
     */
    BluetoothCore.prototype.toObservable = function (promise) {
        return Observable.fromPromise(promise);
    };
    /**
     * @param  {DataView} data   [description]
     * @param  {number}   offset [description]
     * @return {number}          [description]
     */
    BluetoothCore.prototype.littleEndianToUint16 = function (data, offset) {
        return (this.littleEndianToUint8(data, offset + 1) << 8)
            + this.littleEndianToUint8(data, offset);
    };
    /**
     * @param  {DataView} data   [description]
     * @param  {number}   offset [description]
     * @return {number}          [description]
     */
    BluetoothCore.prototype.littleEndianToUint8 = function (data, offset) {
        return data.getUint8(offset);
    };
    /**
     * Sends random data (for testing purpose only).
     * @return {Observable<number>}
     */
    BluetoothCore.prototype.fakeNext = function (fakeValue) {
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
    ]; };
    return BluetoothCore;
}(ReplaySubject));
//# sourceMappingURL=/Users/wassimchegham/Sandbox/oss/angular-web-bluetooth/lib/bluetooth.service.js.map