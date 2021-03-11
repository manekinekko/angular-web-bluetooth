import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { bufferCount, take } from 'rxjs/operators';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';
import { BleService } from './ble.service';

describe('BleService', () => {
  let serviceUnderTest: BleService;

  const fakeDevice = new Subject();
  const fakeStreamValue = new Subject();
  const fakeRequestValue = jest.fn((options) => fakeStreamValue);
  const fakeDeviceDisconnect = jest.fn();

  const fakeBluetoothCore = {
    getDevice$() {
      return fakeDevice;
    },
    streamValues$() {
      return fakeStreamValue;
    },
    value$(options) {
      return fakeRequestValue(options);
    },
    disconnectDevice() {
      fakeDeviceDisconnect();
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BleService,
        {provide: BluetoothCore, useValue: fakeBluetoothCore}
      ]
    });

    serviceUnderTest = TestBed.inject(BleService);
  });

  it('should create service', () => {
    expect(serviceUnderTest).toBeDefined();
  });

  it('should request decoded service characteristic values', (done) => {
    // given
    serviceUnderTest.config({
      service: 'battery_service',
      characteristic: 'battery_level',
      decoder: (value: DataView) => value.getInt8(0)
    });

    // async then
    // Kiss or use marble tests ? That's the question
    serviceUnderTest.value()
      .pipe(take(1))
      .subscribe(next => {
        expect(next).toEqual(99);
        expect(fakeRequestValue).toBeCalledWith({
          service: 'battery_service',
          characteristic: 'battery_level',
        });
        done();
      }, error => done(error));

    // when
    const fakeDataView = new DataView(new ArrayBuffer(8));
    fakeDataView.setInt8(0, 99);
    fakeStreamValue.next(fakeDataView);
  });

  it('should stream decoded characteristic values change', (done) => {
    // given
    serviceUnderTest.config({
      service: 'battery_service',
      characteristic: 'battery_level',
      decoder: (value: DataView) => value.getInt8(0)
    });

    // async then
    serviceUnderTest.stream()
      .pipe(bufferCount(2))
      .subscribe(next => {
        expect(next).toEqual([99, 100]);
        done();
      }, error => done(error));

    // when
    const fakeDataView = new DataView(new ArrayBuffer(8));
    fakeDataView.setInt8(0, 99);
    fakeStreamValue.next(fakeDataView);

    fakeDataView.setInt8(0, 100);
    fakeStreamValue.next(fakeDataView);
  });

  it('should disconnect device', () => {
    // when
    serviceUnderTest.disconnectDevice();

    // then
    expect(fakeDeviceDisconnect).toHaveBeenCalled();
  });
});
