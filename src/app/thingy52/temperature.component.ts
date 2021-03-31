import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { SmoothieChart, TimeSeries } from 'smoothie';
import { BleBatchService } from '../ble-batch.service';


@Component({
  selector: 'ble-temperature',
  template: `
    <canvas #chart width="549" height="200"></canvas>
    <mat-icon *ngIf="error" [attr.aria-label]="error" [title]="error" color="warn" class="not-supported">bluetooth_disabled</mat-icon>
  `,
  styles: [`
  :host {
    display: block;
  }
  canvas {
    margin-left: -16px;
  }`],
})
export class TemperatureComponent implements OnInit, OnDestroy {
  static serviceUUID: BluetoothServiceUUID = 'ef680200-9b35-4933-9b10-52ffa9740042';
  static characteristicUUID: BluetoothCharacteristicUUID = 'ef680201-9b35-4933-9b10-52ffa9740042';

  series: TimeSeries;
  chart: SmoothieChart;
  valuesSubscription: Subscription;
  streamSubscription: Subscription;
  errorSubscription: Subscription;
  error: string;

  @ViewChild('chart', {static: true})
  chartRef: ElementRef<HTMLCanvasElement>;

  get device() {
    return this.dashboardService.device();
  }

  constructor(
    public dashboardService: BleBatchService,
    public snackBar: MatSnackBar) {}

  ngOnInit() {
    this.initChart();

    this.streamSubscription = this.dashboardService.streamsBy(
      TemperatureComponent.serviceUUID,
      TemperatureComponent.characteristicUUID)
        .subscribe((value: number) => {
          this.updateValue(value);
        }, error => this.hasError(error));

    this.errorSubscription = this.dashboardService.errorsBy(
      TemperatureComponent.serviceUUID,
      TemperatureComponent.characteristicUUID)
      .subscribe((error) => {
        this.error = error;
      });
  }

  initChart() {
    this.series = new window.TimeSeries() as TimeSeries;
    const canvas = this.chartRef.nativeElement;
    this.chart = new window.SmoothieChart({
      interpolation: 'step',
      grid: {
        fillStyle: '#ffffff',
        strokeStyle: 'rgba(119,119,119,0.18)',
        borderVisible: false
      },
      labels: {
        fillStyle: '#000000',
        fontSize: 17
      },
      tooltip: true
    });
    this.chart.addTimeSeries(this.series, { lineWidth: 1, strokeStyle: '#ff0000', fillStyle: 'rgba(255,161,161,0.30)' });
    this.chart.streamTo(canvas);
    this.chart.stop();
  }

  requestValue() {
    this.valuesSubscription = this.dashboardService.valuesBy(
      TemperatureComponent.serviceUUID,
      TemperatureComponent.characteristicUUID)
        .subscribe((value: number) => {
          this.updateValue(value);
        }, error => this.hasError(error));
  }

  updateValue(value: number) {
    console.log('Reading temperature %d', value);
    this.series.append(Date.now(), value);
    this.chart.start();
  }

  disconnect() {
    this.series.clear();
    this.chart.stop();
    this.dashboardService?.disconnectDevice();
    this.valuesSubscription?.unsubscribe();
    this.errorSubscription?.unsubscribe();
  }

  hasError(error: string) {
    this.snackBar.open(error, 'Close');
  }

  ngOnDestroy() {
    this.valuesSubscription?.unsubscribe();
    this.streamSubscription?.unsubscribe();
    this.errorSubscription?.unsubscribe();
  }
}


