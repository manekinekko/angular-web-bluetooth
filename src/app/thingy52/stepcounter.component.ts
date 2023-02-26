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
  selector: 'ble-stepcounter',
  template: `
  <span>{{ value || "000" }}</span>
  <mat-icon>directions_walk</mat-icon>
  `,
  styles: [`
  :host {
    display: block;
  }
  span {
    font-size: 5em;
    position: absolute;
    top: 112px;
    left: 214px;
    width: 120px;
    display: block;
    text-align: center;
  }
  mat-icon {
    font-size: 11em;
    width: 100%;
    height: 100%;
  }`],
  providers: PROVIDERS
})
export class StepCounterComponent implements OnInit, OnDestroy {
  valuesSubscription: Subscription;
  streamSubscription: Subscription;
  value = 0;

  get device() {
    return this.service.getDevice();
  }

  constructor(
    public service: BleService,
    public snackBar: MatSnackBar) {

    service.config({
      decoder: (value: DataView) => {
        const count = value.getUint32(0, true);
        const time = value.getUint32(4, true);
        return {
          count, time
        };
      },
      service: 'ef680400-9b35-4933-9b10-52ffa9740042',
      characteristic: 'ef680405-9b35-4933-9b10-52ffa9740042'
    });
  }

  ngOnInit() {
    this.streamSubscription = this.service.stream()
      .subscribe({
        next: (val: { time: number, count: number }) => this.updateValue(val),
        error: (err) => this.hasError(err)
      });
  }

  requestValue() {
    this.valuesSubscription = this.service.value()
      .subscribe(() => null, error => this.hasError.bind(this));
  }

  updateValue(value: { time: number, count: number }) {
    console.log('Reading step counter %d', value);
    this.value = value.count;
  }

  disconnect() {
    this.service.disconnectDevice();
    this.valuesSubscription.unsubscribe();
  }

  hasError(error: string) {
    this.snackBar.open(error, 'Close');
  }

  ngOnDestroy() {
    this.valuesSubscription.unsubscribe();
    this.streamSubscription.unsubscribe();
  }
}


