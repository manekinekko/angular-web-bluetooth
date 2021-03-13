import { ComponentFixture } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BluetoothCore, ConsoleLoggerService, NoLoggerService } from '@manekinekko/angular-web-bluetooth';
import { render, screen } from '@testing-library/angular';
import { createMock } from '@testing-library/angular/jest-utils';
import { Subject } from 'rxjs';
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

  const fakeBluetoothCore = createMock(BluetoothCore);
  fakeBluetoothCore.getDevice$.mockImplementation(() => fakeDevice);
  fakeBluetoothCore.streamValues$.mockImplementation(() => fakeStreamValue);
  fakeBluetoothCore.value$.mockImplementation((options) => fakeValueFn(options));
  fakeBluetoothCore.disconnectDevice.mockImplementation(() => fakeDeviceDisconnectFn());

  const fakeBleService = new BleService(fakeBluetoothCore as BluetoothCore);

  beforeEach(async () => {
    const renderResult = await render(BatteryLevelComponent, {
      imports: [
        MatSnackBarModule,
        MatIconModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule,
      ],
      componentProviders: [
        {provide: BleService, useValue: fakeBleService},
        {provide: ConsoleLoggerService, useValue: new NoLoggerService()},
      ],
    });

    fixture = renderResult.fixture;
    component = renderResult.fixture.componentInstance;
  });


  it('should display device initial state', () => {
    // when
    component.requestValue();

    // then
    expect(screen.getByTestId('value').textContent).toBe('000%');
  });

  it('should display device service/characteristic value changes', () => {
    // given
    component.requestValue();

    // when
    // 1 st value change
    const dataView = new DataView(new ArrayBuffer(8));
    dataView.setInt8(0, 99);
    fakeStreamValue.next(dataView);
    fixture.detectChanges();

    // then
    expect(component.value).toEqual(99);
    expect(screen.getByTestId('value').textContent).toBe('99%');

    // when
    // 2 nd value change
    dataView.setInt8(0, 100);
    fakeStreamValue.next(dataView);
    fixture.detectChanges();

    // then
    expect(component.value).toEqual(100);
    expect(screen.getByTestId('value').textContent).toBe('100%');
  });

  it('should disconnect', () => {
    // given
    component.requestValue();

    // when
    component.disconnect();

    // then
    expect(fakeDeviceDisconnectFn).toHaveBeenCalled();
  });
});
