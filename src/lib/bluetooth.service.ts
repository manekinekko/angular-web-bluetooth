import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/takeUntil';

import { BrowserWebBluetooth } from './platform/browser';

import {
  RequestDeviceOptions,
  BluetoothRemoteGATTServer,
  BluetoothRemoteGATTService,
  BluetoothRemoteGATTCharacteristic,
  BluetoothGATTCharacteristic,
  BluetoothDevice,
  BluetoothServiceUUID,
  BluetoothCharacteristicUUID
}  from './lang/types';

/**
 * Number of last emitted values to reply
 */
const kBufferSize = 1; 


@Injectable()
export class BluetoothCore extends ReplaySubject<any /* find a better interface type */> {

  public _device$: EventEmitter<BluetoothDevice>;
  public _gatt$: EventEmitter<BluetoothRemoteGATTServer>;
  public _characteristicValueChanges$: EventEmitter<DataView>;

  public _gattServer: BluetoothRemoteGATTServer;

  constructor(
    public _webBle: BrowserWebBluetooth
  ) {
    super(kBufferSize);

    this._device$ = new EventEmitter<BluetoothDevice>();
    this._gatt$ = new EventEmitter<BluetoothRemoteGATTServer>();
    this._characteristicValueChanges$ = new EventEmitter<DataView>();

    this._gattServer = null;
  }

  /**
   * @return {Observable<BluetoothDevice>}
   */
  getDevice$(): Observable<BluetoothDevice> {
    return this._device$;
  }

  /**
   * @return {Observable<BluetoothRemoteGATTServer>}
   */
  getGATT$(): Observable<BluetoothRemoteGATTServer> {
    return this._gatt$;
  }

  /**
   * @return {Observable<DataView>}
   */
  streamValues$(): Observable<DataView> {
    return this._characteristicValueChanges$.filter(value => value && value.byteLength > 0);
  }


  anyDeviceFilter() {
    // This is the closest we can get for now to get all devices.
    // https://github.com/WebBluetoothCG/web-bluetooth/issues/234

    let filters: {name?: string; namePrefix?: string}[] = [];

    filters = Array
      .from('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')
      .map(c => ({namePrefix: c}));
    filters.push({name: ''});

    return filters;
  }

  /**
   * Run the discovery process.
   *
   * @param  {RequestDeviceOptions} Options such as filters and optional services
   * @return {Promise<BluetoothRemoteGATTServer>} The GATT server for the chosen device
   */
  discover(options: RequestDeviceOptions = <RequestDeviceOptions>{}): Promise<BluetoothRemoteGATTServer> {

    options.filters = options.filters || this.anyDeviceFilter();
    options.optionalServices = options.optionalServices || ['generic_access'];

    console.log('[BLE::Info] Requesting devices with options %o', options);

    return this._webBle.requestDevice(options)
      .then( (device: BluetoothDevice) => {

        if (device) {

          if (device.ongattserverdisconnected) {
            (<any>device).addEventListener('gattserverdisconnected', this.onDeviceDisconnected.bind(this));
          }

          this._device$.emit(device);

          return device;
        }

        this._device$.emit(null);

      })
      .catch( (e) => console.error('[BLE::Error] discover: %o', e) );
      /** @TODO handl user cancel */
  }

  /**
   * @param  {Event}  event [description]
   */
  onDeviceDisconnected(event: Event) {

    let disconnectedDevice: BluetoothDevice = <BluetoothDevice>(<any>event).target;
    console.log('[BLE::Info] disconnected device %o', disconnectedDevice);

    this._device$.emit(null);

  }

  /**
   * Run the discovery process.
   *
   * @param  {RequestDeviceOptions} Options such as filters and optional services
   * @return {Observable<BluetoothRemoteGATTServer>} Emites the value of the requested service read from the device
   */
  discover$(options?: RequestDeviceOptions): Observable<BluetoothRemoteGATTServer> {
    return this.toObservable(
      this.discover(options)
    )
    .mergeMap( (device: BluetoothDevice) => this.connectDevice$(device))
    .catch( (e) => {
      console.error('[BLE::Error] discover$: %o', e)
      return Observable.create(e);
    });
  }

  /**
   * Connect to current device.
   *
   * @return {Promise<any>} Emites the gatt server instance of the requested device
   */
  connectDevice(device: BluetoothDevice) {
    if(device) {
      console.log('[BLE::Info] Connecting to GATT Server of %o', device);

      return device.gatt.connect()
       .then( (gattServer: BluetoothRemoteGATTServer) => {

         this._gattServer = gattServer;

         this._gatt$.emit(gattServer);

         return gattServer;
       })
       .catch( (e) => console.error('[BLE::Error] connectDevice %o', e) );
     }
     else {
       console.log('[BLE::Error] Was not able to connect to GATT Server');
       this._gatt$.error(null);
     }

  }

  /**
   * Connect to current device.
   *
   * @return {Observable<any>} Emites the gatt server instance of the requested device
   */
  connectDevice$(device: BluetoothDevice) {
    return this.toObservable(
      this.connectDevice(device)
    );
  }

  /**
   * @param  {BluetoothRemoteGATTServer}              gatt
   * @param  {BluetoothServiceUUID}                   service
   * @return {Observable<BluetoothRemoteGATTService>}
   */
  getPrimaryService$(gatt: BluetoothRemoteGATTServer, service: BluetoothServiceUUID): Observable<BluetoothRemoteGATTService> {
    console.log('[BLE::Info] Getting primary service "%s" of %o', service, gatt);
    return this.toObservable(
      gatt.getPrimaryService(service)
        .catch( (e) => console.error('[BLE::Error] getPrimaryService$ %o (%s)', e, service) )
    );
  }

  /**
   * @param  {BluetoothRemoteGATTService}                    primaryService
   * @param  {BluetoothCharacteristicUUID}                   characteristic
   * @return {Observable<BluetoothRemoteGATTCharacteristic>}
   */
  getCharacteristic$(primaryService: BluetoothRemoteGATTService, characteristic: BluetoothCharacteristicUUID): Observable<BluetoothRemoteGATTCharacteristic> {
    console.log('[BLE::Info] Getting Characteristic "%s" of %o', characteristic, primaryService);

    let characteristicPromise = primaryService.getCharacteristic(characteristic)
      .then( (char: BluetoothGATTCharacteristic) => {

        // listen for characteristic value changes
        if(char.properties.notify) {

          char.startNotifications().then( _ =>  {
            console.log('[BLE::Info] Starting notifications of "%s"', characteristic);
            return (<any>char).addEventListener('characteristicvaluechanged', this.onCharacteristicChanged.bind(this));
          }, error => {
            console.error('[BLE::Error] Cannot start notification of "%s" %o', characteristic, error);
          });

        }
        else {
          (<any>char).addEventListener('characteristicvaluechanged', this.onCharacteristicChanged.bind(this));
        }

        return char;

      })
      .catch( (e) => console.error('[BLE::Error] getCharacteristic$ %o', e) );

    return this.toObservable(characteristicPromise);
  }

  /**
   * @param  {BluetoothServiceUUID}                   service        [description]
   * @param  {BluetoothCharacteristicUUID}            characteristic [description]
   * @param  {number}                                 state          [description]
   * @return {Observable<BluetoothRemoteGATTService>}                [description]
   */
  setCharacteristicState(
    service: BluetoothServiceUUID,
    characteristic: BluetoothCharacteristicUUID,
    state: ArrayBuffer
  ): Observable<BluetoothRemoteGATTService> {
    let primaryService = this.getPrimaryService$(this._gattServer, service);

    primaryService
     .mergeMap( (primaryService) => this.getCharacteristic$(primaryService, characteristic))
     .subscribe( (characteristic: BluetoothRemoteGATTCharacteristic) => this.writeValue$(characteristic, state) );

     return primaryService;
  }

  /**
   * @param  {BluetoothServiceUUID}                   service        [description]
   * @param  {BluetoothCharacteristicUUID}            characteristic [description]
   * @return {Observable<BluetoothRemoteGATTService>}                [description]
   */
  enableCharacteristic(
    service: BluetoothServiceUUID,
    characteristic: BluetoothCharacteristicUUID,
    state?: any
  ): Observable<BluetoothRemoteGATTService> {
    state = state || new Uint8Array([ 1 ]);
    return this.setCharacteristicState(service, characteristic, state);
  }

  /**
   * @param  {BluetoothServiceUUID}                   service        [description]
   * @param  {BluetoothCharacteristicUUID}            characteristic [description]
   * @return {Observable<BluetoothRemoteGATTService>}                [description]
   */
  disbaleCharacteristic(
    service: BluetoothServiceUUID,
    characteristic: BluetoothCharacteristicUUID,
    state?: any
  ): Observable<BluetoothRemoteGATTService> {
    state = state || new Uint8Array([ 0 ]);
    return this.setCharacteristicState(service, characteristic, state);
  }

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
  onCharacteristicChanged(event) {
    console.log('[BLE::Info] Dispatching new characteristic value %o', event);

    let value = (<any>event).target.value;
    this._characteristicValueChanges$.emit(value);
  }

  /**
   * @param  {BluetoothRemoteGATTCharacteristic} characteristic
   * @return {Observable<DataView>}
   */
  readValue$(characteristic: BluetoothRemoteGATTCharacteristic): Observable<DataView> {
    console.log('[BLE::Info] Reading Characteristic %o', characteristic);

    return this.toObservable(
      characteristic.readValue()
      .then(
        (value: any) => {
      //     // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
      //     value = value.buffer ? value : new DataView(value);
          return value;
        }
      )
      .catch( (e) => console.error('[BLE::Error] readValue$ %o', e) )
    );
  }

  /**
   * @param  {BluetoothRemoteGATTCharacteristic} characteristic [description]
   * @param  {ArrayBuffer}                       value          [description]
   * @return {Observable<DataView>}
   */
  writeValue$(characteristic: BluetoothRemoteGATTCharacteristic, value: ArrayBuffer|Uint8Array): Observable<{}> {
    console.log('[BLE::Info] Writing Characteristic %o', characteristic);

    return this.toObservable(
      characteristic.writeValue(value)
    );
  }

  /**
   * @param  {BluetoothRemoteGATTCharacteristic} characteristic The characteristic whose value you want to observe
   * @return {Observable<DataView>}
   */
  observeValue$(characteristic: BluetoothRemoteGATTCharacteristic): Observable<DataView> {
    characteristic.startNotifications();
    const disconnected = Observable.fromEvent(characteristic.service.device as any, 'gattserverdisconnected');
    return Observable.fromEvent(characteristic as any, 'characteristicvaluechanged')
      .takeUntil(disconnected)
      .map(event => (event as any).target.value as DataView);
  }

  /**
   * A helper function that transforms any Promise into an Observable
   *
   * @param  {Promise<any>}    promise incoming promise
   * @return {Observable<any>}         outgoing observable
   */
  toObservable(promise: Promise<any>): Observable<any> {
    return Observable.fromPromise(promise)
  }

  /**
   * @param  {DataView} data   [description]
   * @param  {number}   offset [description]
   * @return {number}          [description]
   */
  littleEndianToUint16(data: any, offset: number): number {
    return (this.littleEndianToUint8(data, offset + 1) << 8)
            + this.littleEndianToUint8(data, offset);
  }

  /**
   * @param  {DataView} data   [description]
   * @param  {number}   offset [description]
   * @return {number}          [description]
   */
  littleEndianToUint8(data: any, offset: number): number {
    return data.getUint8(offset);
  }

  /**
   * Sends random data (for testing purpose only).
   * @return {Observable<number>}
   */
  fakeNext(fakeValue?: Function) {

    if(fakeValue === undefined) {
      fakeValue = () => {
        let dv = new DataView(new ArrayBuffer(8));
        dv.setUint8(0, (Math.random()*110)|0);
        return dv;
      }
    }

    this._characteristicValueChanges$.emit( fakeValue() );
  }

}
