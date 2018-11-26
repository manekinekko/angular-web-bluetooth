import { Component, OnInit, NgZone } from '@angular/core';
import { BatteryLevelService } from './battery-level.service';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { BluetoothCore, BrowserWebBluetooth, ConsoleLoggerService } from '@manekinekko/angular-web-bluetooth';

// make sure we get a singleton instance of each service
const PROVIDERS = [{
  provide: BluetoothCore,
  useFactory: (b, l) => new BluetoothCore(b, l),
  deps: [BrowserWebBluetooth, ConsoleLoggerService]
}, {
  provide: BatteryLevelService,
  useFactory: (b) => new BatteryLevelService(b),
  deps: [BluetoothCore]
}];

@Component({
  selector: 'ble-battery-level',
  template: `
    <span>{{ value || "000" }}<sup>%</sup></span>
    <mat-progress-spinner
        [color]="color"
        [mode]="mode"
        diameter="200"
        strokeWidth="5"
        [value]="value || 100">
    </mat-progress-spinner>
    <mat-icon>battery_charging_full</mat-icon>
  `,
  styles: [`
  span {
    font-size: 5em;
    position: absolute;
    top: 112px;
    left: 207px;
    width: 120px;
    display: block;
    text-align: center;
  }
  sup {
    font-size: 24px;
  }
  mat-progress-spinner {
    margin-top: 20px;
    margin-left: 150px;
  }
  mat-icon {
    position: absolute;
    bottom: 95px;
    left: 248px;
    font-size: 38px;
  }
  `],
  providers: [PROVIDERS]
})
export class BatteryLevelComponent implements OnInit {
  value = null;
  mode = "determinate";
  color = "primary";

  get device() {
    return this.batteryLevelService.getDevice();
  }

  constructor(
    public zone: NgZone, 
    public batteryLevelService: BatteryLevelService,
    public snackBar: MatSnackBar) {}

  ngOnInit() {
    this.getDeviceStatus();
  }

  getDeviceStatus() {
    this.batteryLevelService.getDevice()
    .subscribe(device => {
      if (device) {
        this.color = "warn";
        this.mode = "indeterminate";
        this.value = null;
      } else {
        // device not connected or disconnected
        this.value = null;
        this.mode = "determinate";
        this.color = "primary";
      }
    }, this.hasError.bind(this));
  }

  requestValue() {
    return this.batteryLevelService.getBatteryLevel()
      .subscribe(this.showBatteryLevel.bind(this), this.hasError.bind(this));
  }

  showBatteryLevel(value: number) {
    console.log('Reading battery level %d', value);
    this.value = value;
    this.mode = "determinate";
  }

  disconnect() {
    this.batteryLevelService.disconnectDevice();
  }

  hasError(error: string) {
    this.snackBar.open(error, 'Close');
  }
}


