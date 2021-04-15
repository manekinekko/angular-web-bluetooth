import { of, Subject } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ComponentFixture } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { render, screen } from '@testing-library/angular';
import { createMock } from '@testing-library/angular/jest-utils';
import { BluetoothCore, ConsoleLoggerService, NoLoggerService } from '@manekinekko/angular-web-bluetooth';
import { BleBatchService } from '../ble-batch.service';
import { fakeDevice, fakeGATTServer } from '../fake.utils';
import { BatteryLevelComponent } from './battery-level.component';


describe('BatteryLevelComponent', () => {
  let component: BatteryLevelComponent;
  let fixture: ComponentFixture<BatteryLevelComponent>;


  const fakeStreamDetailedValue = new Subject();
  const fakeDeviceDisconnectFn = jest.fn();

  const fakeBluetoothCore = createMock(BluetoothCore);
  fakeBluetoothCore.getDevice$.mockImplementation(() => of(fakeDevice));
  fakeBluetoothCore.discover$.mockImplementation(() => {
    fakeGATTServer.connect();
    return of(fakeGATTServer);
  });
  fakeBluetoothCore.getGATT$.mockImplementation(() => of(fakeGATTServer));
  fakeBluetoothCore.streamDetailedValues$.mockImplementation(() => fakeStreamDetailedValue);
  fakeBluetoothCore.disconnectDevice.mockImplementation(() => fakeDeviceDisconnectFn());

  const fakeBleService = new BleBatchService(fakeBluetoothCore as BluetoothCore, new NoLoggerService());

  beforeEach(async () => {
    const renderResult = await render(BatteryLevelComponent, {
      imports: [
        MatSnackBarModule,
        MatIconModule,
        MatProgressSpinnerModule,
        NoopAnimationsModule,
      ],
      componentProviders: [
        {provide: BleBatchService, useValue: fakeBleService},
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
    fakeStreamDetailedValue.next({
      service: BatteryLevelComponent.serviceUUID,
      characteristic: BatteryLevelComponent.characteristicUUID,
      value: dataView
    });
    fixture.detectChanges();

    // then
    expect(component.value).toEqual(99);
    expect(screen.getByTestId('value').textContent).toBe('99%');

    // when
    // 2 nd value change
    dataView.setInt8(0, 100);
    fakeStreamDetailedValue.next({
      service: BatteryLevelComponent.serviceUUID,
      characteristic: BatteryLevelComponent.characteristicUUID,
      value: dataView
    });
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
