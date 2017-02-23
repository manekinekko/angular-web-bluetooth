/// <reference types="web-bluetooth" />
import { EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/observable/throw';
import { BrowserWebBluetooth } from './platform/browser';
import { ConsoleLoggerService } from './logger.service';
export declare class BluetoothCore extends Subject<BluetoothCore> {
    _webBle: BrowserWebBluetooth;
    _console: ConsoleLoggerService;
    _device$: EventEmitter<BluetoothDevice>;
    _gatt$: EventEmitter<BluetoothRemoteGATTServer>;
    _characteristicValueChanges$: EventEmitter<DataView>;
    _gattServer: BluetoothRemoteGATTServer;
    constructor(_webBle: BrowserWebBluetooth, _console: ConsoleLoggerService);
    /**
     * @return {Observable<BluetoothDevice>}
     */
    getDevice$(): Observable<BluetoothDevice>;
    /**
     * @return {Observable<BluetoothRemoteGATTServer>}
     */
    getGATT$(): Observable<BluetoothRemoteGATTServer>;
    /**
     * @return {Observable<DataView>}
     */
    streamValues$(): Observable<DataView>;
    anyDeviceFilter(): {
        name?: string;
        namePrefix?: string;
    }[];
    /**
     * Run the discovery process.
     *
     * @param  {RequestDeviceOptions} Options such as filters and optional services
     * @return {Promise<BluetoothDevice>} The GATT server for the chosen device
     */
    discover(options?: RequestDeviceOptions): Promise<BluetoothDevice>;
    /**
     * @param  {Event}  event [description]
     */
    onDeviceDisconnected(event: Event): void;
    /**
     * Run the discovery process.
     *
     * @param  {RequestDeviceOptions} Options such as filters and optional services
     * @return {Observable<BluetoothRemoteGATTServer>} Emites the value of the requested service read from the device
     */
    discover$(options?: RequestDeviceOptions): Observable<BluetoothRemoteGATTServer>;
    /**
     * Connect to current device.
     *
     * @return {Promise<BluetoothRemoteGATTServer>} Emites the gatt server instance of the requested device
     */
    connectDevice(device: BluetoothDevice): Promise<BluetoothRemoteGATTServer>;
    /**
     * Connect to current device.
     *
     * @return {Observable<BluetoothRemoteGATTServer>} Emites the gatt server instance of the requested device
     */
    connectDevice$(device: BluetoothDevice): Observable<BluetoothRemoteGATTServer>;
    /**
     * @param  {BluetoothRemoteGATTServer}              gatt
     * @param  {BluetoothServiceUUID}                   service
     * @return {Observable<BluetoothRemoteGATTService>}
     */
    getPrimaryService$(gatt: BluetoothRemoteGATTServer, service: BluetoothServiceUUID): Observable<BluetoothRemoteGATTService>;
    /**
     * @param  {BluetoothRemoteGATTService}                    primaryService
     * @param  {BluetoothCharacteristicUUID}                   characteristic
     * @return {Observable<BluetoothRemoteGATTCharacteristic>}
     */
    getCharacteristic$(primaryService: BluetoothRemoteGATTService, characteristic: BluetoothCharacteristicUUID): Observable<BluetoothRemoteGATTCharacteristic>;
    /**
     * @param  {BluetoothServiceUUID}                   service        [description]
     * @param  {BluetoothCharacteristicUUID}            characteristic [description]
     * @param  {number}                                 state          [description]
     * @return {Observable<BluetoothRemoteGATTService>}                [description]
     */
    setCharacteristicState(service: BluetoothServiceUUID, characteristic: BluetoothCharacteristicUUID, state: ArrayBuffer): Observable<BluetoothRemoteGATTService>;
    /**
     * @param  {BluetoothServiceUUID}                   service        [description]
     * @param  {BluetoothCharacteristicUUID}            characteristic [description]
     * @return {Observable<BluetoothRemoteGATTService>}                [description]
     */
    enableCharacteristic(service: BluetoothServiceUUID, characteristic: BluetoothCharacteristicUUID, state?: any): Observable<BluetoothRemoteGATTService>;
    /**
     * @param  {BluetoothServiceUUID}                   service        [description]
     * @param  {BluetoothCharacteristicUUID}            characteristic [description]
     * @return {Observable<BluetoothRemoteGATTService>}                [description]
     */
    disbaleCharacteristic(service: BluetoothServiceUUID, characteristic: BluetoothCharacteristicUUID, state?: any): Observable<BluetoothRemoteGATTService>;
    /**
     * @param  {BluetoothRemoteGATTService}                    primaryService  [description]
     * @param  {BluetoothCharacteristicUUID[]}                 characteristics [description]
     * @return {Observable<BluetoothRemoteGATTCharacteristic>}                 [description]
     */
    /**
     * @param  {Event} event [description]
     */
    onCharacteristicChanged(event: Event): void;
    /**
     * @param  {BluetoothRemoteGATTCharacteristic} characteristic
     * @return {Observable<DataView>}
     */
    readValue$(characteristic: BluetoothRemoteGATTCharacteristic): Observable<DataView>;
    /**
     * @param  {BluetoothRemoteGATTCharacteristic} characteristic [description]
     * @param  {ArrayBuffer}                       value          [description]
     * @return {Observable<DataView>}
     */
    writeValue$(characteristic: BluetoothRemoteGATTCharacteristic, value: ArrayBuffer | Uint8Array): Observable<void>;
    /**
     * @param  {BluetoothRemoteGATTCharacteristic} characteristic The characteristic whose value you want to observe
     * @return {Observable<DataView>}
     */
    observeValue$(characteristic: BluetoothRemoteGATTCharacteristic): Observable<DataView>;
    /**
     * @param  {DataView} data   [description]
     * @param  {number}   offset [description]
     * @return {number}          [description]
     */
    littleEndianToUint16(data: any, offset: number): number;
    /**
     * @param  {DataView} data   [description]
     * @param  {number}   offset [description]
     * @return {number}          [description]
     */
    littleEndianToUint8(data: any, offset: number): number;
    /**
     * Sends random data (for testing purpose only).
     * @return {Observable<number>}
     */
    fakeNext(fakeValue?: Function): void;
}
