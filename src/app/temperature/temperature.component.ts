import { Component, OnInit, NgZone, ElementRef, ViewChild } from '@angular/core';
import { TemperatureThingy52Service } from './temperature-thingy52.service';
import { tap, mergeMap } from 'rxjs/operators';
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
    <canvas #chart width="549" height="200"></canvas>
  `,
  styles: [`
  :host {
    display: block;
  }
  canvas {
    margin-left: -16px;
  }`],
  providers: [PROVIDERS]
})
export class TemperatureComponent implements OnInit {
  series: any = {};

  @ViewChild('chart')
  chartRef: ElementRef<HTMLCanvasElement>;

  get device() {
    return this.service.getDevice();
  }

  constructor(
    public zone: NgZone,
    public service: TemperatureThingy52Service,
    public snackBar: MatSnackBar) { }

  ngOnInit() {
    this.initChart();
    // this.service.stream().subscribe(
    //   this.updateValue.bind(this), this.hasError.bind(this)
    // )
  }

  initChart() {
    this.series = new window['TimeSeries']();
    const canvas = this.chartRef.nativeElement;
    const chart = new window['SmoothieChart']({ interpolation: 'step', grid: { fillStyle: '#ffffff', strokeStyle: 'rgba(119,119,119,0.18)', borderVisible: false }, labels: { fillStyle: '#000000', fontSize: 17 }, tooltip: true });
    chart.addTimeSeries(this.series, { maxValue: 100, minValue: -100, lineWidth: 1, strokeStyle: '#ff0000', fillStyle: 'rgba(255,161,161,0.30)' });
    chart.streamTo(canvas);
  }

  requestValue() {
    return this.service.temperature()
      .subscribe(this.updateValue.bind(this), this.hasError.bind(this));
  }

  updateValue(value: number) {
    console.log('Reading temperature %d', value);
    this.series.append(Date.now(), value);
  }

  disconnect() {
    this.service.disconnectDevice();
    this.series.clear();
  }

  hasError(error: string) {
    this.snackBar.open(error, 'Close');
  }
}


