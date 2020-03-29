import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BluetoothCore, BrowserWebBluetooth, ConsoleLoggerService } from '@manekinekko/angular-web-bluetooth';
import { of, Subscription } from 'rxjs';
import { SmoothieChart, TimeSeries } from 'smoothie';
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
  selector: 'ble-humidity',
  template: `
    <canvas #chart width="549" height="200"></canvas>
  `,
  styles: [`
  :host {
    display: block;
  }
  canvas {
    margin-left: -16px;
  }`],
  providers: PROVIDERS
})
export class HumidityComponent implements OnInit, OnDestroy {
  series: TimeSeries;
  chart: SmoothieChart;
  valuesSubscription: Subscription;
  streamSubscription: Subscription;

  @ViewChild('chart', {static: true})
  chartRef: ElementRef<HTMLCanvasElement>;

  get device() {
    return this.service.getDevice();
  }

  constructor(
    public service: BleService,
    public snackBar: MatSnackBar) {

    service.config({
      decoder: (value: DataView) => value.getInt8(0),
      service: 'ef680200-9b35-4933-9b10-52ffa9740042',
      characteristic: 'ef680203-9b35-4933-9b10-52ffa9740042'
    });
  }

  ngOnInit() {
    this.initChart();

    this.streamSubscription = this.service.stream()
    .subscribe(
      () => this.updateValue.bind(this),
      () => of(this.hasError.bind(this)),
      );
  }

  initChart() {
    this.series = new window.TimeSeries() as TimeSeries;
    const canvas = this.chartRef.nativeElement;
    // tslint:disable-next-line: max-line-length
    this.chart = new window.SmoothieChart({ interpolation: 'step', grid: { fillStyle: '#ffffff', strokeStyle: 'rgba(119,119,119,0.18)', borderVisible: false }, labels: { fillStyle: '#000000', fontSize: 17 }, tooltip: true });
    this.chart.addTimeSeries(this.series, { lineWidth: 1, strokeStyle: '#ff0000', fillStyle: 'rgba(255,161,161,0.30)' });
    this.chart.streamTo(canvas);
    this.chart.stop();
  }

  requestValue() {
    this.valuesSubscription = this.service.value()
    .subscribe(
      () => null,
      () => of(this.hasError.bind(this)),
    );
  }


  updateValue(value: number) {
    console.log('Reading humidity %d', value);
    this.series.append(Date.now(), value);
    this.chart.start();
  }


  disconnect() {
    this.service.disconnectDevice();
    this.series.clear();
    this.chart.stop();
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
