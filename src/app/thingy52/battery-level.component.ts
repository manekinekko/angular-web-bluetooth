import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BluetoothCore, BrowserWebBluetooth, ConsoleLoggerService } from '@manekinekko/angular-web-bluetooth';
import { Subscription } from 'rxjs';
import { BleService } from '../ble.service';

export const bleCore = (b: BrowserWebBluetooth, l: ConsoleLoggerService) => new BluetoothCore(b, l);
export const bleService = (b: BluetoothCore) => new BleService(b);


// make sure we get a singleton instance of each service
const PROVIDERS = [{
  provide: BluetoothCore,
  useFactory: bleCore,
  deps: [BrowserWebBluetooth, ConsoleLoggerService]
}, {
  provide: BleService,
  useFactory: bleService,
  deps: [BluetoothCore]
}];


@Component({
  selector: 'ble-battery-level',
  template: `
    <span data-testid="value">{{ value || "000" }}<sup>%</sup></span>
    <mat-progress-spinner
        [color]="color"
        [mode]="mode"
        diameter="250"
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
    font-size: 5em;
    position: absolute;
    top: 222px;
    width: 120px;
    display: block;
    text-align: center;
  }
  sup {
    font-size: 24px;
  }
  mat-progress-spinner {
    top: 90px;
    left: 5px;
  }
  mat-icon {
    position: absolute;
    bottom: 255px;
  }
  `],
  providers: PROVIDERS
})
export class BatteryLevelComponent implements OnInit, OnDestroy {
  value = null;
  mode = 'determinate';
  color = 'primary';
  valuesSubscription: Subscription;
  streamSubscription: Subscription;
  deviceSubscription: Subscription;

  get device() {
    return this.service.getDevice();
  }

  constructor(
    public service: BleService,
    public snackBar: MatSnackBar,
    public console: ConsoleLoggerService) {

    service.config({
      decoder: (value: DataView) => value.getInt8(0),
      service: 'battery_service',
      characteristic: 'battery_level'
    });
  }

  ngOnInit() {
    this.getDeviceStatus();

    this.streamSubscription = this.service.stream()
      .subscribe((value: number) => {
        this.updateValue(value);
      }, error => this.hasError(error));

  }

  getDeviceStatus() {
    this.deviceSubscription = this.service.getDevice()
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
    this.valuesSubscription = this.service.value()
      .subscribe({
        next: (val: number) => this.updateValue(val),
        error: (err) => this.hasError(err)
      });
  }

  updateValue(value: number) {
    this.console.log('Reading battery level %d', value);
    this.value = value;
    this.mode = 'determinate';
  }

  disconnect() {
    this.service.disconnectDevice();
    this.deviceSubscription.unsubscribe();
    this.valuesSubscription.unsubscribe();
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

