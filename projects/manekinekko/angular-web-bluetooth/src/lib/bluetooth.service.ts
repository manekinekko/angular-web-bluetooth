import { EventEmitter, Injectable } from '@angular/core';
import { from, fromEvent, Observable, Subject, throwError } from 'rxjs';
import { filter, map, mergeMap, takeUntil } from 'rxjs/operators';
import { ConsoleLoggerService } from './logger.service';
import { BrowserWebBluetooth } from './platform/browser';

type ReadValueOptions = {
  acceptAllDevices?: boolean;
  optionalServices?: BluetoothServiceUUID[];
  characteristic: BluetoothCharacteristicUUID,
  service: BluetoothServiceUUID,
};

@Injectable({
  providedIn: 'root'
})
export class BluetoothCore extends Subject<BluetoothCore> {
  public _device$: EventEmitter<BluetoothDevice>;
  public _gatt$: EventEmitter<BluetoothRemoteGATTServer>;
  public _characteristicValueChanges$: EventEmitter<DataView>;
  public _gattServer: BluetoothRemoteGATTServer;

  constructor(public _webBle: BrowserWebBluetooth, public _console: ConsoleLoggerService) {
    super();

    this._device$ = new EventEmitter<BluetoothDevice>();
    this._gatt$ = new EventEmitter<BluetoothRemoteGATTServer>();
    this._characteristicValueChanges$ = new EventEmitter<DataView>();

    this._gattServer = null;
  }

  getDevice$(): Observable<BluetoothDevice> {
    return this._device$;
  }

  getGATT$(): Observable<BluetoothRemoteGATTServer> {
    return this._gatt$;
  }

  streamValues$(): Observable<DataView> {
    return this._characteristicValueChanges$.pipe(filter(value => value && value.byteLength > 0));
  }

  /**
   * Run the discovery process and read the value form the provided service and characteristic
   * 
   * @param ReadValueOptions 
   */
  async value(options: ReadValueOptions) {
    this._console.log('[BLE::Info] Reading value with options %o', options);

    if (typeof options.acceptAllDevices === "undefined") {
      options.acceptAllDevices = true;
    }

    if (typeof options.optionalServices === "undefined") {
      options.optionalServices = [options.service];
    }
    else {
      options.optionalServices = [...options.optionalServices];
    }

    this._console.log('[BLE::Info] Reading value with options %o', options);

    try {
      const device = await this.discover({
        acceptAllDevices: options.acceptAllDevices,
        optionalServices: options.optionalServices
      }) as BluetoothDevice;
      this._console.log('[BLE::Info] Device info %o', device);

      const gatt = await this.connectDevice(device);
      this._console.log('[BLE::Info] GATT info %o', gatt);

      const primaryService = await this.getPrimaryService(gatt, options.service) as BluetoothRemoteGATTService;
      this._console.log('[BLE::Info] Primary Service info %o', primaryService);

      const characteristic = await this.getCharacteristic(primaryService, options.characteristic) as BluetoothRemoteGATTCharacteristic;
      this._console.log('[BLE::Info] Characteristic info %o', characteristic);

      const value = await characteristic.readValue();
      this._console.log('[BLE::Info] Value info %o', value);

      return value;
    }
    catch (error) {
      throw new Error(error);
    }
  }

  value$(options: ReadValueOptions) {
    return from(this.value(options));
  }

  /**
   * Run the discovery process.
   *
   * @param Options such as filters and optional services
   * @return  The GATT server for the chosen device
   */
  async discover(options: RequestDeviceOptions = {} as RequestDeviceOptions) {
    options.optionalServices = options.optionalServices || ['generic_access'];

    this._console.log('[BLE::Info] Requesting devices with options %o', options);

    let device = null;
    try {
      device = await this._webBle.requestDevice(options);
      device.addEventListener('gattserverdisconnected', this.onDeviceDisconnected.bind(this));

      if (device) {
        this._device$.emit(device);
      }
      else {
        this._device$.error(`[BLE::Error] Can not get the Bluetooth Remote GATT Server. Abort.`);
      }

    } catch (error) {
      this._console.error(error);
    }

    return device;
  }

  /**
   * @param event
   */
  onDeviceDisconnected(event: Event) {
    const disconnectedDevice = event.target as BluetoothDevice;
    this._console.log('[BLE::Info] disconnected device %o', disconnectedDevice);

    this._device$.emit(null);
  }

  /**
   * Run the discovery process.
   *
   * @param Options such as filters and optional services
   * @return  Emites the value of the requested service read from the device
   */
  discover$(options?: RequestDeviceOptions): Observable<void | BluetoothRemoteGATTServer> {
    return from(this.discover(options)).pipe(mergeMap((device: BluetoothDevice) => this.connectDevice$(device)));
  }

  /**
   * Connect to current device.
   *
   * @return  Emites the gatt server instance of the requested device
   */
  async connectDevice(device: BluetoothDevice) {
    if (device) {
      this._console.log('[BLE::Info] Connecting to Bluetooth Remote GATT Server of %o', device);

      try {
        const gattServer = await device.gatt.connect();
        this._gattServer = gattServer;
        this._gatt$.emit(gattServer);
        return gattServer;
      } catch (error) {
        // probably the user has canceled the discovery
        Promise.reject(`${error.message}`);
        this._gatt$.error(`${error.message}`);
      }
    } else {
      this._console.error('[BLE::Error] Was not able to connect to Bluetooth Remote GATT Server');
      this._gatt$.error(null);
    }
  }

  /**
   * Connect to current device.
   *
   * @return  Emites the gatt server instance of the requested device
   */
  connectDevice$(device: BluetoothDevice) {
    return from(this.connectDevice(device));
  }

  /**
   * Disconnect the current connected device
   */
  disconnectDevice() {
    if (!this._gattServer) {
      return;
    }
    this._console.log('[BLE::Info] Disconnecting from Bluetooth Device %o', this._gattServer);

    if (this._gattServer.connected) {
      this._gattServer.disconnect();
    } else {
      this._console.log('[BLE::Info] Bluetooth device is already disconnected');
    }
  }

  /**
   * 
   * @param gatt 
   * @param service 
   */
  getPrimaryService(gatt: BluetoothRemoteGATTServer, service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService> {
    return gatt
      .getPrimaryService(service)
      .then(remoteService => Promise.resolve(remoteService), (error: DOMException) => Promise.reject(`${error.message} (${service})`))
  }

  /**
   * @param gatt
   * @param service
   * @return
   */
  getPrimaryService$(gatt: BluetoothRemoteGATTServer, service: BluetoothServiceUUID): Observable<BluetoothRemoteGATTService> {
    this._console.log('[BLE::Info] Getting primary service "%s" (if available) of %o', service, gatt);


    if (gatt) {
      return from(
        this.getPrimaryService(gatt, service)
      );
    }
    else {
      return throwError(new Error('[BLE::Error] Was not able to connect to the Bluetooth Remote GATT Server'));
    }
  }

  getCharacteristic(
    primaryService: BluetoothRemoteGATTService,
    characteristic: BluetoothCharacteristicUUID
  ): Promise<BluetoothRemoteGATTCharacteristic | void> {
    this._console.log('[BLE::Info] Getting Characteristic "%s" of %o', characteristic, primaryService);

    return primaryService.getCharacteristic(characteristic).then(
      char => {
        // listen for characteristic value changes
        if (char.properties.notify) {
          char.startNotifications().then(
            _ => {
              this._console.log('[BLE::Info] Starting notifications of "%s"', characteristic);
              char.addEventListener('characteristicvaluechanged', this.onCharacteristicChanged.bind(this));
            },
            (error: DOMException) => {
              Promise.reject(`${error.message} (${characteristic})`);
            }
          );
        } else {
          char.addEventListener('characteristicvaluechanged', this.onCharacteristicChanged.bind(this));
        }

        return char;
      },
      (error: DOMException) => {
        Promise.reject(`${error.message} (${characteristic})`);
      }
    );
  }

  /**
   * @param primaryService
   * @param characteristic
   * @return
   */
  getCharacteristic$(
    primaryService: BluetoothRemoteGATTService,
    characteristic: BluetoothCharacteristicUUID
  ): Observable<void | BluetoothRemoteGATTCharacteristic> {
    this._console.log('[BLE::Info] Getting Characteristic "%s" of %o', characteristic, primaryService);

    return from(this.getCharacteristic(primaryService, characteristic));
  }

  /**
   * @param service
   * @param characteristic
   * @param state
   * @return
   */
  setCharacteristicState(service: BluetoothServiceUUID, characteristic: BluetoothCharacteristicUUID, state: ArrayBuffer) {
    const primaryService = this.getPrimaryService$(this._gattServer, service);

    primaryService
      .pipe(mergeMap(_primaryService => this.getCharacteristic$(_primaryService, characteristic)))
      .subscribe((_characteristic: BluetoothRemoteGATTCharacteristic) => this.writeValue$(_characteristic, state));

    return primaryService;
  }

  /**
   * @param service
   * @param characteristic
   * @return
   */
  enableCharacteristic(service: BluetoothServiceUUID, characteristic: BluetoothCharacteristicUUID, state?: any) {
    state = state || new Uint8Array([1]);
    return this.setCharacteristicState(service, characteristic, state);
  }

  /**
   * @param service
   * @param characteristic
   * @return
   */
  disbaleCharacteristic(service: BluetoothServiceUUID, characteristic: BluetoothCharacteristicUUID, state?: any) {
    state = state || new Uint8Array([0]);
    return this.setCharacteristicState(service, characteristic, state);
  }

  /**
   * @param event
   */
  onCharacteristicChanged(event: Event) {
    this._console.log('[BLE::Info] Dispatching new characteristic value %o', event);

    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    this._characteristicValueChanges$.emit(value);
  }

  /**
   * @param characteristic
   * @return
   */
  readValue$(characteristic: BluetoothRemoteGATTCharacteristic): Observable<DataView> {
    this._console.log('[BLE::Info] Reading Characteristic %o', characteristic);

    return from(
      characteristic
        .readValue()
        .then((data: DataView) => Promise.resolve(data), (error: DOMException) => Promise.reject(`${error.message}`))
    );
  }

  /**
   * @param characteristic
   * @param value
   * @return
   */
  writeValue$(characteristic: BluetoothRemoteGATTCharacteristic, value: ArrayBuffer | Uint8Array) {
    this._console.log('[BLE::Info] Writing Characteristic %o', characteristic);

    return from(characteristic.writeValue(value).then(_ => Promise.resolve(), (error: DOMException) => Promise.reject(`${error.message}`)));
  }

  /**
   * @param characteristic The characteristic whose value you want to observe
   * @return
   */
  observeValue$(characteristic: BluetoothRemoteGATTCharacteristic): Observable<DataView> {
    characteristic.startNotifications();
    const disconnected = fromEvent(characteristic.service.device, 'gattserverdisconnected');
    return fromEvent(characteristic, 'characteristicvaluechanged')
      .pipe(
        map((event: Event) => (event.target as BluetoothRemoteGATTCharacteristic).value as DataView),
        takeUntil(disconnected)
      );
  }

  /**
   * @param data
   * @param offset
   * @return
   */
  littleEndianToUint16(data: any, offset: number): number {
    // tslint:disable-next-line:no-bitwise
    return (this.littleEndianToUint8(data, offset + 1) << 8) + this.littleEndianToUint8(data, offset);
  }

  /**
   * @param data
   * @param offset
   * @return
   */
  littleEndianToUint8(data: any, offset: number): number {
    return data.getUint8(offset);
  }

  /**
   * Sends random data (for testing purpose only).
   * @return
   */
  fakeNext(fakeValue?: Function) {
    if (fakeValue === undefined) {
      fakeValue = () => {
        const dv = new DataView(new ArrayBuffer(8));
        // tslint:disable-next-line:no-bitwise
        dv.setUint8(0, (Math.random() * 110) | 0);
        return dv;
      };
    }

    this._characteristicValueChanges$.emit(fakeValue());
  }
}
