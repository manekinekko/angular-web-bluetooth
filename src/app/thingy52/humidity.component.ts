import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { SmoothieChart, TimeSeries } from 'smoothie';
import { BleBatchService } from '../ble-batch.service';


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
})
export class HumidityComponent implements OnInit, OnDestroy {
  static serviceUUID: BluetoothServiceUUID = 'ef680200-9b35-4933-9b10-52ffa9740042';
  static characteristicUUID: BluetoothCharacteristicUUID = 'ef680203-9b35-4933-9b10-52ffa9740042';

  series: TimeSeries;
  chart: SmoothieChart;
  valuesSubscription: Subscription;
  streamSubscription: Subscription;

  @ViewChild('chart', {static: true})
  chartRef: ElementRef<HTMLCanvasElement>;

  get device() {
    return this.bleService.device();
  }

  constructor(
    public bleService: BleBatchService,
    public snackBar: MatSnackBar) {}

  ngOnInit() {
    this.initChart();

    this.streamSubscription = this.bleService.streamsBy(
      HumidityComponent.serviceUUID,
      HumidityComponent.characteristicUUID)
        .subscribe((value: number) => {
          this.updateValue(value);
        }, error => this.hasError(error));
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
    this.valuesSubscription = this.bleService.valuesBy(
      HumidityComponent.serviceUUID,
      HumidityComponent.characteristicUUID)
        .subscribe((value: number) => {
          this.updateValue(value);
        }, error => this.hasError(error));
  }

  updateValue(value: number) {
    console.log('Reading humidity %d', value);
    this.series.append(Date.now(), value);
    this.chart.start();
  }

  disconnect() {
    this.series.clear();
    this.chart.stop();
    this.bleService?.disconnectDevice();
    this.valuesSubscription?.unsubscribe();
  }

  hasError(error: string) {
    this.snackBar.open(error, 'Close');
  }

  ngOnDestroy() {
    this.valuesSubscription?.unsubscribe();
    this.streamSubscription?.unsubscribe();
  }
}
