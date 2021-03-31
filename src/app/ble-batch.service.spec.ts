import { TestBed } from '@angular/core/testing';
import {
  BluetoothCore,
  ConsoleLoggerService,
  DetailedValue,
  FakeBluetoothRemoteGATTCharacteristic, FakeBluetoothRemoteGATTService,
  NoLoggerService
} from '@manekinekko/angular-web-bluetooth';
import { of, Subject, throwError } from 'rxjs';
import { bufferCount, filter, mergeMap, take } from 'rxjs/operators';
import { BleBatchService } from './ble-batch.service';
import { fakeGATTServer, gattServices } from './fake.utils';

describe('BleBatchService', () => {
  let service: BleBatchService;

  const batteryServiceUUID = '0000180f-0000-1000-8000-00805f9b34fb';
  const batteryLevelCharacteristicUUID = '00002a19-0000-1000-8000-00805f9b34fb';
  const unsupportedServiceUUUID = '00002acd-0000-1000-8000-00805f9b34fb';
  const unsupportedCharacteristicUUID = '00002acb-0000-1000-8000-00805f9b34fb';

  const fakeStreamDetailedValues = new Subject<DetailedValue>();
  const fakeDeviceDisconnect = jest.fn();

  const fakeBluetoothCore = {
    discover$() {
      fakeGATTServer.connect();
      return of(fakeGATTServer);
    },
    getGATT$() {
      return of(fakeGATTServer);
    },
    getPrimaryService$(gatt, serviceUUID: string) {
      if (serviceUUID === unsupportedServiceUUUID) {
        return throwError(`Service ${unsupportedServiceUUUID} is unsupported`);
      }
      return of(gattServices[serviceUUID]);
    },
    getCharacteristic$(gattService: FakeBluetoothRemoteGATTService, characteristicUUID: BluetoothCharacteristicUUID) {
      if (characteristicUUID === unsupportedCharacteristicUUID) {
        return throwError(`Characteristic ${unsupportedCharacteristicUUID} is unsupported`);
      }
      return of(gattServices[gattService?.uuid]?.characteristics[characteristicUUID]);
    },
    readValue$(gattCharacteristic: FakeBluetoothRemoteGATTCharacteristic) {
      return this.getCharacteristic$(gattCharacteristic.service, gattCharacteristic.uuid)
        .pipe(
          mergeMap((characteristic: FakeBluetoothRemoteGATTCharacteristic) => characteristic.readValue()),
          filter((value: DataView) => value && value.byteLength > 0),
        );
    },
    streamDetailedValues$() {
      return fakeStreamDetailedValues;
    },
    disconnectDevice() {
      fakeGATTServer.disconnect();
      fakeDeviceDisconnect();
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BleBatchService,
        {provide: BluetoothCore, useValue: fakeBluetoothCore},
        {provide: ConsoleLoggerService, useValue: new NoLoggerService()},
      ]
    });

    service = TestBed.inject(BleBatchService);
  });

  it('should create service', () => {
    expect(service).toBeDefined();
  });

  it('should request decoded service characteristic values', (done) => {
    service.valuesBy(batteryServiceUUID, batteryLevelCharacteristicUUID)
      .subscribe(next => {
        expect(next).toEqual(55); // initial Value from fake.utils.ts
        done();
      }, error => done(error));
  });

  it('should stream decoded characteristic values change', (done) => {
    service.streamsBy(batteryServiceUUID, batteryLevelCharacteristicUUID)
      .pipe(
        bufferCount(2)
      )
      .subscribe(next => {
        expect(next).toEqual([99, 100]);
        done();
      }, error => done(error));

    // when
    const fakeDataView = new DataView(new ArrayBuffer(8));
    fakeDataView.setInt8(0, 99);
    fakeStreamDetailedValues.next({
      service: batteryServiceUUID,
      characteristic: batteryLevelCharacteristicUUID,
      value: fakeDataView,
    });

    fakeDataView.setInt8(0, 100);
    fakeStreamDetailedValues.next({
      service: batteryServiceUUID,
      characteristic: batteryLevelCharacteristicUUID,
      value: fakeDataView,
    });
  });

  it('should stream error', (done) => {
    // async then
    service.errorsBy(unsupportedServiceUUUID, unsupportedCharacteristicUUID)
      .pipe(
        filter(value => !!value),
        take(1),
      )
      .subscribe(next => {
        expect(next).toBe(`Service ${unsupportedServiceUUUID} is unsupported`);
        done();
      }, error => done(error));

    // when
    service.valuesBy(unsupportedServiceUUUID, unsupportedCharacteristicUUID)
      .pipe(
        take(1),
      )
      .subscribe();
  });

  it('should disconnect device', () => {
    // when
    service.disconnectDevice();

    // then
    expect(fakeDeviceDisconnect).toHaveBeenCalled();
  });
});
