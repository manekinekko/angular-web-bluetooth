import { EventEmitter, Injectable } from '@angular/core';
import { from, fromEvent, Observable, throwError } from 'rxjs';
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
export class BluetoothCore {
  private device$: EventEmitter<BluetoothDevice>;
  private gatt$: EventEmitter<BluetoothRemoteGATTServer>;
  private characteristicValueChanges$: EventEmitter<DataView>;
  private gattServer: BluetoothRemoteGATTServer;

  constructor(private readonly webBle: BrowserWebBluetooth, private readonly console: ConsoleLoggerService) {

    this.device$ = new EventEmitter<BluetoothDevice>();
    this.gatt$ = new EventEmitter<BluetoothRemoteGATTServer>();
    this.characteristicValueChanges$ = new EventEmitter<DataView>();

    this.gattServer = null;
  }

  getDevice$(): Observable<BluetoothDevice> {
    return this.device$;
  }

  getGATT$(): Observable<BluetoothRemoteGATTServer> {
    return this.gatt$;
  }

  streamValues$(): Observable<DataView> {
    return this.characteristicValueChanges$.pipe(filter(value => value && value.byteLength > 0));
  }

  /**
   * Run the discovery process and read the value form the provided service and characteristic
   * @param options the ReadValueOptions
   */
  async value(options: ReadValueOptions) {
    this.console.log('[BLE::Info] Reading value with options %o', options);

    if (typeof options.acceptAllDevices === 'undefined') {
      options.acceptAllDevices = true;
    }

    if (typeof options.optionalServices === 'undefined') {
      options.optionalServices = [options.service];
    }
    else {
      options.optionalServices = [...options.optionalServices];
    }

    this.console.log('[BLE::Info] Reading value with options %o', options);

    try {
      const device = await this.discover({
        acceptAllDevices: options.acceptAllDevices,
        optionalServices: options.optionalServices
      }) as BluetoothDevice;
      this.console.log('[BLE::Info] Device info %o', device);

      const gatt = await this.connectDevice(device);
      this.console.log('[BLE::Info] GATT info %o', gatt);

      const primaryService = await this.getPrimaryService(gatt, options.service) as BluetoothRemoteGATTService;
      this.console.log('[BLE::Info] Primary Service info %o', primaryService);

      const characteristic = await this.getCharacteristic(primaryService, options.characteristic) as BluetoothRemoteGATTCharacteristic;
      this.console.log('[BLE::Info] Characteristic info %o', characteristic);

      const value = await characteristic.readValue();
      this.console.log('[BLE::Info] Value info %o', value);

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
  async discover(options: RequestDeviceOptions = {} as RequestDeviceOptions): Promise<BluetoothDevice> {
    options.optionalServices = options.optionalServices || ['generic_access'];

    this.console.log('[BLE::Info] Requesting devices with options %o', options);

    let device = null;
    try {
      device = await this.webBle.requestDevice(options);
      device.addEventListener('gattserverdisconnected', this.onDeviceDisconnected.bind(this));

      if (device) {
        this.device$.emit(device);
      }
      else {
        this.device$.error(`[BLE::Error] Can not get the Bluetooth Remote GATT Server. Abort.`);
      }

    } catch (error) {
      this.console.error(error);
    }

    return device;
  }

  /**
   * This handler will trigger when the client disconnets from the server.
   *
   * @param event The onDeviceDisconnected event
   */
  onDeviceDisconnected(event: Event) {
    const disconnectedDevice = event.target as BluetoothDevice;
    this.console.log('[BLE::Info] disconnected device %o', disconnectedDevice);

    this.device$.emit(null);
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
      this.console.log('[BLE::Info] Connecting to Bluetooth Remote GATT Server of %o', device);

      try {
        const gattServer = await device.gatt.connect();
        this.gattServer = gattServer;
        this.gatt$.emit(gattServer);
        return gattServer;
      } catch (error) {
        // probably the user has canceled the discovery
        Promise.reject(`${error.message}`);
        this.gatt$.error(`${error.message}`);
      }
    } else {
      this.console.error('[BLE::Error] Was not able to connect to Bluetooth Remote GATT Server');
      this.gatt$.error(null);
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
    if (!this.gattServer) {
      return;
    }
    this.console.log('[BLE::Info] Disconnecting from Bluetooth Device %o', this.gattServer);

    if (this.gattServer.connected) {
      this.gattServer.disconnect();
    } else {
      this.console.log('[BLE::Info] Bluetooth device is already disconnected');
    }
  }

  /**
   * Requests the primary service.
   *
   * @param gatt The BluetoothRemoteGATTServer sever
   * @param service The UUID of the primary service
   * @return The remote service (as a Promise)
   */
  async getPrimaryService(gatt: BluetoothRemoteGATTServer, service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService> {
    try {
      const remoteService = await gatt.getPrimaryService(service);
      return await Promise.resolve(remoteService);
    }
    catch (error) {
      return await Promise.reject(`${error.message} (${service})`);
    }
  }

  /**
   * Requests the primary service.
   *
   * @param gatt The BluetoothRemoteGATTServer sever
   * @param service The UUID of the primary service
   * @return The remote service (as an observable).
   */
  getPrimaryService$(gatt: BluetoothRemoteGATTServer, service: BluetoothServiceUUID): Observable<BluetoothRemoteGATTService> {
    this.console.log('[BLE::Info] Getting primary service "%s" (if available) of %o', service, gatt);


    if (gatt) {
      return from(
        this.getPrimaryService(gatt, service)
      );
    }
    else {
      return throwError(new Error('[BLE::Error] Was not able to connect to the Bluetooth Remote GATT Server'));
    }
  }

  /**
   * Requests a characteristic from the primary service.
   *
   * @param primaryService The primary service.
   * @param characteristic The characteristic's UUID.
   * @returns The characteristic description (as a Promise).
   */
  async getCharacteristic(
    primaryService: BluetoothRemoteGATTService,
    characteristic: BluetoothCharacteristicUUID
  ): Promise<BluetoothRemoteGATTCharacteristic | void> {
    this.console.log('[BLE::Info] Getting Characteristic "%s" of %o', characteristic, primaryService);

    try {
      const char = await primaryService.getCharacteristic(characteristic);
      // listen for characteristic value changes
      if (char.properties.notify) {
        char.startNotifications().then(_ => {
          this.console.log('[BLE::Info] Starting notifications of "%s"', characteristic);
          char.addEventListener('characteristicvaluechanged', this.onCharacteristicChanged.bind(this));
        }, (error: DOMException) => {
          Promise.reject(`${error.message} (${characteristic})`);
        });
      }
      else {
        char.addEventListener('characteristicvaluechanged', this.onCharacteristicChanged.bind(this));
      }
      return char;
    }
    catch (rejectionError) {
      Promise.reject(`${rejectionError.message} (${characteristic})`);
    }
  }

  /**
   * Requests a characteristic from the primary service.
   *
   * @param primaryService The primary service.
   * @param characteristic The characteristic's UUID.
   * @returns The characteristic description (as a Observable).
   */
  getCharacteristic$(
    primaryService: BluetoothRemoteGATTService,
    characteristic: BluetoothCharacteristicUUID
  ): Observable<void | BluetoothRemoteGATTCharacteristic> {
    this.console.log('[BLE::Info] Getting Characteristic "%s" of %o', characteristic, primaryService);

    return from(this.getCharacteristic(primaryService, characteristic));
  }

  /**
   * Sets the characteristic's state.
   *
   * @param service The parent service of the characteristic.
   * @param characteristic The requested characteristic
   * @param state An ArrayBuffer containing the value of the characteristic.
   * @return The primary service (useful for chaining).
   */
  setCharacteristicState(service: BluetoothServiceUUID, characteristic: BluetoothCharacteristicUUID, state: ArrayBuffer) {
    const primaryService = this.getPrimaryService$(this.gattServer, service);

    primaryService
      // tslint:disable-next-line: variable-name
      .pipe(mergeMap((_primaryService: BluetoothRemoteGATTService) => this.getCharacteristic$(_primaryService, characteristic)))
      // tslint:disable-next-line: no-shadowed-variable
      .subscribe((characteristic: BluetoothRemoteGATTCharacteristic) => this.writeValue$(characteristic, state));

    return primaryService;
  }

  /**
   * Enables the specified characteristic of a given service.
   *
   * @param service The parent service of the characteristic.
   * @param characteristic The requested characteristic
   * @return The primary service (useful for chaining).
   */
  enableCharacteristic(service: BluetoothServiceUUID, characteristic: BluetoothCharacteristicUUID, state?: any) {
    state = state || new Uint8Array([1]);
    return this.setCharacteristicState(service, characteristic, state);
  }

  /**
   * Disables the specified characteristic of a given service.
   *
   * @param service The parent service of the characteristic.
   * @param characteristic The requested characteristic.
   * @return The primary service (useful for chaining).
   */
  disbaleCharacteristic(service: BluetoothServiceUUID, characteristic: BluetoothCharacteristicUUID, state?: any) {
    state = state || new Uint8Array([0]);
    return this.setCharacteristicState(service, characteristic, state);
  }

  /**
   * Dispatches new values emitted by a characteristic.
   *
   * @param event the distpatched event.
   */
  onCharacteristicChanged(event: Event) {
    this.console.log('[BLE::Info] Dispatching new characteristic value %o', event);

    const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
    this.characteristicValueChanges$.emit(value);
  }

  /**
   * Reads a value from the characteristics, as a DataView.
   *
   * @param characteristic The requested characteristic.
   * @return the DataView value (as an Observable).
   */
  readValue$(characteristic: BluetoothRemoteGATTCharacteristic): Observable<DataView> {
    this.console.log('[BLE::Info] Reading Characteristic %o', characteristic);

    return from(
      characteristic
        .readValue()
        .then((data: DataView) => Promise.resolve(data), (error: DOMException) => Promise.reject(`${error.message}`))
    );
  }

  /**
   * Writes a value into the specified characteristic.
   *
   * @param characteristic The requested characteristic.
   * @param value The value to be written (as an ArrayBuffer or Uint8Array).
   * @return an void Observable.
   */
  writeValue$(characteristic: BluetoothRemoteGATTCharacteristic, value: ArrayBuffer | Uint8Array) {
    this.console.log('[BLE::Info] Writing Characteristic %o', characteristic);

    return from(characteristic.writeValue(value).then(_ => Promise.resolve(), (error: DOMException) => Promise.reject(`${error.message}`)));
  }

  /**
   * A stream of DataView values emitted by the specified characteristic.
   *
   * @param characteristic The characteristic which value you want to observe
   * @return The stream of DataView values.
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
   * A utility method to convert LE to an unsigned 16-bit integer values.
   *
   * @param data The DataView binary data.
   * @param byteOffset The offset, in byte, from the start of the view where to read the data.
   * @return An unsigned 16-bit integer number.
   */
  littleEndianToUint16(data: any, byteOffset: number): number {
    // tslint:disable-next-line:no-bitwise
    return (this.littleEndianToUint8(data, byteOffset + 1) << 8) + this.littleEndianToUint8(data, byteOffset);
  }

  /**
   * A utility method to convert LE to an unsigned 8-bit integer values.
   *
   * @param data The DataView binary data.
   * @param byteOffset The offset, in byte, from the start of the view where to read the data.
   * @return An unsigned 8-bit integer number.
   */
  littleEndianToUint8(data: any, byteOffset: number): number {
    return data.getUint8(byteOffset);
  }

  /**
   * Sends random data (for testing purposes only).
   *
   * @return Random unsigned 8-bit integer values.
   */
  fakeNext(fakeValue?: () => DataView) {
    if (fakeValue === undefined) {
      fakeValue = () => {
        const dv = new DataView(new ArrayBuffer(8));
        // tslint:disable-next-line:no-bitwise
        dv.setUint8(0, (Math.random() * 110) | 0);
        return dv;
      };
    }

    this.characteristicValueChanges$.emit(fakeValue());
  }
}
