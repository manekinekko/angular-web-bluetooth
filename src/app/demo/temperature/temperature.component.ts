import { Component, OnInit, NgZone, ElementRef, ViewChild } from '@angular/core';
import { TemperatureThingy52Service } from './temperature-thingy52.service';
import { tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { BluetoothCore, BrowserWebBluetooth, ConsoleLoggerService } from '@manekinekko/angular-web-bluetooth';

// make sure we get a singleton instance of each service
const PROVIDERS = [{
  provide: BluetoothCore,
  useFactory: (b, l) => new BluetoothCore(b, l),
  deps: [BrowserWebBluetooth, ConsoleLoggerService]
}, {
  provide: TemperatureThingy52Service,
  useFactory: (b) => new TemperatureThingy52Service(b),
  deps: [BluetoothCore]
}];

@Component({
  selector: 'ble-temperature',
  template: `
    <button mat-button color="primary" href="#" (click)="getValue()">Get temperature ({{value || 'N/A'}}°C)</button>
    <button mat-button color="warn" href="#" (click)="disconnectDevice()" *ngIf="isDeviceValid">Disconnect</button> 
    <span mat-error>{{error}}</span>
    <canvas  #chart width="700" height="100"></canvas>
  `,
  styles: [`
  canvas {
    width: 800px;
    height: 100px;
    margin-left: -20px;
  }`],
  providers: [PROVIDERS]
})
export class TemperatureComponent implements OnInit {
  value = '--';
  error = '';
  device: any = {};
  series: any = {};

  @ViewChild('chart')
  chartRef: ElementRef<HTMLCanvasElement>;

  get isDeviceValid() {
    return this.device && Object.keys(this.device).length > 0;
  }

  constructor(
    public zone: NgZone,
    public service: TemperatureThingy52Service,
    public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.getDeviceStatus();
    this.initChart();
  }

  initChart() {
    this.series = new window['TimeSeries']();
    const canvas = this.chartRef.nativeElement;
    const chart = new window['SmoothieChart']({ interpolation: 'step', grid: { fillStyle: '#ffffff', strokeStyle: 'rgba(119,119,119,0.18)', borderVisible: false }, labels: { fillStyle: '#000000', fontSize: 17 }, tooltip: true });
    chart.addTimeSeries(this.series, { maxValue: 100, minValue: -100, lineWidth: 1, strokeStyle: '#ff0000', fillStyle: 'rgba(255,161,161,0.30)' });
    chart.streamTo(canvas);
  }

  getDeviceStatus() {
    this.service.getDevice()
      .pipe(
        tap(e => this.error = '')
      ).subscribe(device => {
        if (device) {
          this.device = device;
        } else {
          // device not connected or disconnected
          this.device = null;
          this.value = '--';
        }
      }, this.hasError.bind(this));
  }

  getValue() {
    return this.service.getTemperature()
      .pipe(
        tap(e => this.error = '')
      )
      .subscribe(this.updateValue.bind(this), this.hasError.bind(this));
  }

  updateValue(value: number) {
    // force change detection
    this.zone.run(() => {
      console.log('Reading temperature %d', value);
      this.value = '' + value;
      this.series.append(Date.now(), value);
    });
  }

  disconnectDevice() {
    this.service.disconnectDevice();
  }

  hasError(error: string) {
    this.snackBar.open(error, 'Close');
  }
}


