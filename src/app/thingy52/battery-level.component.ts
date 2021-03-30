import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConsoleLoggerService } from '@manekinekko/angular-web-bluetooth';
import { Subscription } from 'rxjs';
import { BleBatchService } from '../ble-batch.service';


@Component({
  selector: 'ble-battery-level',
  template: `
    <span data-testid="value">{{ value || "000" }}<sup>%</sup></span>
    <mat-progress-spinner
        [color]="color"
        [mode]="mode"
        diameter="100"
        strokeWidth="2"
        [value]="value || 100">
    </mat-progress-spinner>
    <mat-icon>battery_charging_full</mat-icon>
  `,
  styles: [`
  :host {
    display: flex;
    justify-content: center;
    flex-direction: row;
    text-align: center;
  }
  span {
    font-size: 3em;
    position: absolute;
    top: 111px;
    width: 100px;
    display: block;
    text-align: center;
  }
  sup {
    font-size: 24px;
  }
  mat-icon {
    position: absolute;
    bottom: 80px;
    font-size: 38px;
  }
  `],
})
export class BatteryLevelComponent implements OnInit, OnDestroy {
  static serviceUUID: BluetoothServiceUUID = '0000180f-0000-1000-8000-00805f9b34fb';
  static characteristicUUID: BluetoothCharacteristicUUID = '00002a19-0000-1000-8000-00805f9b34fb';

  value = null;
  mode = 'determinate';
  color = 'primary';
  valuesSubscription: Subscription;
  streamSubscription: Subscription;
  deviceSubscription: Subscription;


  get device() {
    return this.dashboardService.device();
  }

  constructor(
    public dashboardService: BleBatchService,
    public snackBar: MatSnackBar,
    public console: ConsoleLoggerService) {}

  ngOnInit() {
    this.getDeviceStatus();

    this.streamSubscription = this.dashboardService.streamsBy(
      BatteryLevelComponent.serviceUUID,
      BatteryLevelComponent.characteristicUUID)
        .subscribe((value: number) => {
          this.updateValue(value);
        }, error => this.hasError(error));
  }

  getDeviceStatus() {
    this.deviceSubscription = this.device
      .subscribe(device => {
        if (device) {
          this.color = 'warn';
          this.mode = 'indeterminate';
          this.value = null;
        } else {
          // device not connected or disconnected
          this.value = null;
          this.mode = 'determinate';
          this.color = 'primary';
        }
      }, this.hasError.bind(this));
  }

  requestValue() {
    this.valuesSubscription = this.dashboardService.valuesBy(
      BatteryLevelComponent.serviceUUID,
      BatteryLevelComponent.characteristicUUID)
        .subscribe((value: number) => {
          this.updateValue(value);
        }, error => this.hasError(error));
  }

  updateValue(value: number) {
    this.console.log('Reading battery level %d', value);
    this.value = value;
    this.mode = 'determinate';
  }

  disconnect() {
    this.dashboardService?.disconnectDevice();
    this.deviceSubscription?.unsubscribe();
    this.valuesSubscription?.unsubscribe();
  }

  hasError(error: string) {
    this.snackBar.open(error, 'Close');
  }

  ngOnDestroy() {
    this.valuesSubscription?.unsubscribe();
    this.deviceSubscription?.unsubscribe();
    this.streamSubscription?.unsubscribe();
  }
}


