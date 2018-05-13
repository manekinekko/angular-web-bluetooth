import { Component, OnInit, NgZone } from '@angular/core';
import { BatteryLevelService } from './battery-level.service';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';

@Component({
  selector: 'ble-battery-level',
  template: `
    <a href="#" (click)="getBatteryLevel()">Get Battery Level ({{batteryLevel || 'N/A'}}%)</a>
  `,
  styles: [
    `
    a {
      position: relative;
      color: rgba(255,255,255,1);
      text-decoration: none;
      background-color: #CD2834;
      font-family: monospace;
      font-weight: 700;
      font-size: 3em;
      display: block;
      padding: 4px;
      border-radius: 8px;
      box-shadow: 0px 9px 0px #B52231, 0px 9px 25px rgba(0,0,0,.7);
      margin: 100px auto;
      width: 410px;
      text-align: center;
      transition: all .1s ease;
    }

    a:active {
      box-shadow: 0px 3px 0px rgba(219,31,5,1), 0px 3px 6px rgba(0,0,0,.9);
      position: relative;
      top: 6px;
    }
  `
  ],
  providers: [BatteryLevelService]
})
export class BatteryLevelComponent implements OnInit {
  batteryLevel: string = '--';
  device: any = {};

  constructor(public _zone: NgZone, public _batteryLevelService: BatteryLevelService) {}

  ngOnInit() {
    this.getDeviceStatus();
    this.streamValues();
  }

  streamValues() {
    this._batteryLevelService.streamValues().subscribe(this.showBatteryLevel.bind(this));
  }

  getDeviceStatus() {
    this._batteryLevelService.getDevice().subscribe(device => {
      if (device) {
        this.device = device;
      } else {
        // device not connected or disconnected
        this.device = null;
        this.batteryLevel = '--';
      }
    });
  }

  getFakeValue() {
    this._batteryLevelService.getFakeValue();
  }

  getBatteryLevel() {
    return this._batteryLevelService.getBatteryLevel().subscribe(this.showBatteryLevel.bind(this));
  }

  showBatteryLevel(value: number) {
    // force change detection
    this._zone.run(() => {
      console.log('Reading battery level %d', value);
      this.batteryLevel = '' + value;
    });
  }
}
