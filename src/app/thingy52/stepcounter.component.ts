import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { DashboardService } from '../dashboard/dashboard.service';


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
    position: absolute;
    bottom: 55px;
    left: 258px;
    font-size: 38px;
  }`],
})
export class StepCounterComponent implements OnInit, OnDestroy {
  static serviceUUID: BluetoothServiceUUID = 'ef680400-9b35-4933-9b10-52ffa9740042';
  static characteristicUUID: BluetoothCharacteristicUUID = 'ef680405-9b35-4933-9b10-52ffa9740042';

  valuesSubscription: Subscription;
  streamSubscription: Subscription;
  value = 0;

  get device() {
    return this.dashboardService.device();
  }

  constructor(
    public dashboardService: DashboardService,
    public snackBar: MatSnackBar) {}

  ngOnInit() {
    this.streamSubscription = this.dashboardService.streamsBy(
      StepCounterComponent.serviceUUID,
      StepCounterComponent.characteristicUUID)
        .subscribe((value: { time: number, count: number }) => {
          this.updateValue(value);
        }, error => this.hasError(error));
  }

  requestValue() {
    this.valuesSubscription = this.dashboardService.valuesBy(
      StepCounterComponent.serviceUUID,
      StepCounterComponent.characteristicUUID)
        .subscribe((value: { time: number, count: number }) => {
          this.updateValue(value);
        }, error => this.hasError(error));
  }

  updateValue(value: { time: number, count: number }) {
    console.log('Reading step counter %d', value.count);
    this.value = value.count;
  }

  disconnect() {
    this.dashboardService?.disconnectDevice();
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


