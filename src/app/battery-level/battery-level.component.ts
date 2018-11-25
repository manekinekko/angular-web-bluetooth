import { Component, OnInit, NgZone } from '@angular/core';
import { BatteryLevelService } from './battery-level.service';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'ble-battery-level',
  template: `
    <button mat-button color="primary" href="#" (click)="getBatteryLevel()">Get Battery Level ({{batteryLevel || 'N/A'}}%)</button>
    <button mat-button color="warn" href="#" (click)="disconnectDevice()" *ngIf="isDeviceValid">Disconnect</button> 
    <span mat-error>{{error}}</span>
  `,
  styles: [
    `

  `
  ],
  providers: [BatteryLevelService]
})
export class BatteryLevelComponent implements OnInit {
  batteryLevel = '--';
  error = '';
  device: any = {};

  get isDeviceValid() {
    return this.device && Object.keys(this.device).length > 0;
  }

  constructor(
    public zone: NgZone, 
    public batteryLevelService: BatteryLevelService,
    public snackBar: MatSnackBar) {}

  ngOnInit() {
    this.getDeviceStatus();
    this.streamValues();
  }

  streamValues() {
    this.batteryLevelService.streamValues()
      .pipe(
        tap(e => this.error = '')
      )
      .subscribe(this.showBatteryLevel.bind(this), this.hasError.bind(this));
  }

  getDeviceStatus() {
    this.batteryLevelService.getDevice()
    .pipe(
      tap(e => this.error = '')
    ).subscribe(device => {
      if (device) {
        this.device = device;
      } else {
        // device not connected or disconnected
        this.device = null;
        this.batteryLevel = '--';
      }
    }, this.hasError.bind(this));
  }

  getFakeValue() {
    this.batteryLevelService.getFakeValue();
  }

  getBatteryLevel() {
    return this.batteryLevelService.getBatteryLevel()
      .pipe(
        tap(e => this.error = '')
      )
      .subscribe(this.showBatteryLevel.bind(this), this.hasError.bind(this));
  }

  showBatteryLevel(value: number) {
    // force change detection
    this.zone.run(() => {
      console.log('Reading battery level %d', value);
      this.batteryLevel = '' + value;
    });
  }

  disconnectDevice() {
    this.batteryLevelService.disconnectDevice();
  }

  hasError(error: string) {
    this.snackBar.open(error, 'Close');
  }
}


