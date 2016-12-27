import { Component, OnInit, NgZone } from '@angular/core';
import { BatteryLevelService } from './battery.service';
import { WebBluetooth } from '@manekinekko/angular-web-bluetooth';

@Component({
  selector: 'app-battery',
  templateUrl: `
    <header>Battery Level is: {{ batteryLevel }}</header>
    <button (click)="getBatteryLevel()">Get Battery Level</button>
  `,
  providers: [ 
    BatteryLevelService, 
    
    // you can also inject this provider on the module level
    WebBluetooth 
  ]
})
export class BatteryLevelComponent implements OnInit {

    batteryLevel: string = '--';
    device: any = {};

    constructor(
      private _zone: NgZone,
      private _batteryLevelService: BatteryLevelService
    ) {}

    ngOnInit() {
      this.getDeviceStatus();
      this.streamValues();
    }

    streamValues() {
      this._batteryLevelService.streamValues().subscribe(this.showBatteryLevel.bind(this));
    }

    getDeviceStatus() {
      this._batteryLevelService.getDevice().subscribe(
        (device) => {

          if(device) {
            this.device = device
          }
          else {
            // device not connected or disconnected
            this.device = null;
            this.batteryLevel = '--';
          }
        }
      );
    }

    getFakeValue() {
      this._batteryLevelService.getFakeValue();
    }

    getBatteryLevel() {
      return this._batteryLevelService.getBatteryLevel().subscribe(this.showBatteryLevel.bind(this));
    }

    showBatteryLevel(value: number) {

      // force change detection
      this._zone.run( () =>  {
        console.log('Reading battery level %d', value);
        this.batteryLevel = ''+value;
      });
    }

  }
