import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import {
  BluetoothCore,
  BrowserWebBluetooth,
  ConsoleLoggerService,
  FakeBluetoothDevice, NoLoggerService
} from '@manekinekko/angular-web-bluetooth';
import { BleService } from '../ble.service';
import { BatteryLevelComponent } from './battery-level.component';


describe('BatteryLevelComponent', () => {
  let component: BatteryLevelComponent;
  let fixture: ComponentFixture<BatteryLevelComponent>;

  const fakeDevice = new Subject();
  const fakeStreamValue = new Subject();
  const fakeValue = new Subject();
  const fakeValueFn = jest.fn((options) => fakeValue);
  const fakeDeviceDisconnectFn = jest.fn();

  const fakeBluetoothCore: unknown = {
    test: 'bob',
    getDevice$() {
      return fakeDevice;
    },
    streamValues$() {
      return fakeStreamValue;
    },
    value$(options) {
      return fakeValueFn(options);
    },
    disconnectDevice() {
      fakeDeviceDisconnectFn();
    }
  };
  const fakeBleService = new BleService(fakeBluetoothCore as BluetoothCore);

  beforeEach(() => {
    TestBed
      .configureTestingModule({
        imports: [
          MatSnackBarModule,
          MatIconModule,
          MatProgressSpinnerModule,
          NoopAnimationsModule,
        ],
        declarations: [
          BatteryLevelComponent,
        ],
      })
      .overrideProvider(BleService, {useValue: fakeBleService})
      .overrideProvider(BluetoothCore, {useValue: jest.fn()})
      .overrideProvider(BrowserWebBluetooth, {useValue: jest.fn()})
      .overrideProvider(ConsoleLoggerService, {useValue: new NoLoggerService()});

    fixture = TestBed.createComponent(BatteryLevelComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeDefined();
    expect(fixture).toMatchSnapshot();
  });

  it('should display device connected state', () => {
    // given
    component.ngOnInit();
    component.requestValue();

    // when
    fakeDevice.next(new FakeBluetoothDevice('1', 'My Device'));
    fixture.detectChanges();

    // then
    expect(fixture).toMatchSnapshot();
  });

  it('should display device service/characteristic value changes', () => {
    // given
    component.ngOnInit();
    component.requestValue();

    // when
    // 1 st value change
    const dataView = new DataView(new ArrayBuffer(8));
    dataView.setInt8(0, 99);
    fakeStreamValue.next(dataView);

    // then
    fixture.detectChanges();
    const nativeElement: HTMLElement = fixture.nativeElement;

    expect(component.value).toEqual(99);
    expect(nativeElement.querySelector('[data-testid="value"]').textContent).toEqual('99%');

    // when
    // 2 nd value change
    dataView.setInt8(0, 100);
    fakeStreamValue.next(dataView);

    // then
    fixture.detectChanges();
    expect(component.value).toEqual(100);
    expect(nativeElement.querySelector('[data-testid="value"]').textContent).toEqual('100%');
  });

  it('should disconnect', () => {
    // given
    component.ngOnInit();
    component.requestValue();
    fakeDevice.next(new FakeBluetoothDevice('1', 'My Device'));

    // when
    component.disconnect();

    // then
    expect(fakeDeviceDisconnectFn).toHaveBeenCalled();
  });
});
