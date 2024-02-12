import { TestBed } from '@angular/core/testing';
import { bufferCount, skip, take } from 'rxjs/operators';
import { BluetoothCore } from './bluetooth.service';
import { ConsoleLoggerService, NoLoggerService } from './logger.service';
import { BrowserWebBluetooth } from './platform/browser';
import {
  FakeBluetoothRemoteGATTCharacteristic,
  FakeBluetoothRemoteGATTServer,
  FakeBluetoothRemoteGATTService,
  FakeBluetoothDevice,
} from './test.utils';

describe('BluetoothCore', () => {
  let serviceUnderTest: BluetoothCore;

  // fake fixtures
  const fakeDevice = new FakeBluetoothDevice('1', 'device 1');
  const fakeDataView = new DataView(new ArrayBuffer(8));
  fakeDataView.setInt8(0, 99);
  const fakeCharacteristic = new FakeBluetoothRemoteGATTCharacteristic(
    { notify: false } as BluetoothCharacteristicProperties,
    fakeDataView
  );
  const fakeService = new FakeBluetoothRemoteGATTService(fakeDevice, {
    battery_level: fakeCharacteristic,
  });
  const fakeGATTServer = new FakeBluetoothRemoteGATTServer(fakeDevice, {
    battery_service: {
      service: fakeService,
      primary: true,
    },
  });

  // Set navigator fake bluetooth test double
  Object.defineProperty(navigator, 'bluetooth', {
    value: {
      requestDevice: (options: RequestDeviceOptions) =>
        Promise.resolve(fakeDevice),
    },
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        BluetoothCore,
        BrowserWebBluetooth,
        { provide: ConsoleLoggerService, useClass: NoLoggerService },
      ],
    });

    serviceUnderTest = TestBed.inject(BluetoothCore);
  });

  it('should create service', () => {
    expect(serviceUnderTest).toBeDefined();
  });

  it('should discover device', async () => {
    // when
    const device = await serviceUnderTest.discover();
    // then
    expect(device).toBe(fakeDevice);
  });

  it('should emit discovered device', (done) => {
    // async then
    serviceUnderTest
      .getDevice$()
      .pipe(take(1))
      .subscribe({
        next: (next) => {
          expect(next).toBe(fakeDevice);
          done();
        },
        error: (_error) => done(),
      });

    // when
    serviceUnderTest.discover();
  });

  it('should connect device', async () => {
    // when
    const device = await serviceUnderTest.discover();
    const gattServer = await serviceUnderTest.connectDevice(device);
    // then
    expect(gattServer).toBe(fakeGATTServer);
  });

  it('should emit connected gatt server', (done) => {
    // async then
    serviceUnderTest
      .getGATT$()
      .pipe(take(1))
      .subscribe({
        next: (next) => {
          expect(next).toBe(fakeGATTServer);
          done();
        },
        error: (_error) => done(),
      });

    serviceUnderTest
      .discover()
      .then((device) => serviceUnderTest.connectDevice(device));
  });

  xit('should disconnect device', (done) => {
    // async then
    let gattServerDisconnectSpy: any;
    serviceUnderTest
      .getDevice$()
      // skip the first emission which will be the fake device
      // and take only the second one which will be null
      .pipe(take(2), skip(1))
      .subscribe({
        next: (next) => {
          expect(next).toBeNull();
          expect(gattServerDisconnectSpy).toHaveBeenCalledTimes(1);
          done();
        },
        complete: () => done,
        error: (_error) => done(),
      });

    // when
    serviceUnderTest
      .discover()
      .then((device) => serviceUnderTest.connectDevice(device))
      .then((gattServer) => {
        gattServerDisconnectSpy = jest.spyOn(gattServer as any, 'disconnect');
      })
      .finally(() => serviceUnderTest.disconnectDevice());
  });

  it('should read provided service and characteristic', async () => {
    // when
    const value = await serviceUnderTest.value({
      service: 'battery_service',
      characteristic: 'battery_level',
    });

    // then
    expect(value.getUint8(0)).toEqual(99);
  });

  it('should emit characteristic value changes', (done) => {
    // given
    const newDataView1 = new DataView(new ArrayBuffer(8));
    newDataView1.setInt8(0, 25);

    const newDataView2 = new DataView(new ArrayBuffer(8));
    newDataView2.setInt8(0, 15);

    // async then
    serviceUnderTest
      .streamValues$()
      .pipe(bufferCount(2))
      .subscribe({
        next: (next: DataView[]) => {
          expect(next.map((dv) => dv.getUint8(0))).toEqual([25, 15]);
          done();
        },
        error: (_error) => done(),
      });

    // when
    serviceUnderTest
      .value({
        service: 'battery_service',
        characteristic: 'battery_level',
      })
      .then(() => {
        fakeCharacteristic.changeValue(newDataView1);
        fakeCharacteristic.changeValue(newDataView2);
      });
  });
});
