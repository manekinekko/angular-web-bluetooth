import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { BleBatchService } from '../ble-batch.service';


@Component({
  selector: 'ble-stepcounter',
  template: `
  <span>{{ value || "000" }}</span>
  <mat-icon>directions_walk</mat-icon>
  `,
  styles: [`
  :host {
    display: flex;
    justify-content: center;
    flex-direction: row;
    text-align: center;
  }
  span {
    font-size: 5em;
    position: absolute;
    top: 111px;
    width: 100px;
    display: block;
    text-align: center;
  }
  mat-icon {
    position: absolute;
    bottom: 80px;
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
    return this.bleService.device();
  }

  constructor(
    public bleService: BleBatchService,
    public snackBar: MatSnackBar) {}

  ngOnInit() {
    this.streamSubscription = this.bleService.streamsBy(
      StepCounterComponent.serviceUUID,
      StepCounterComponent.characteristicUUID)
        .subscribe((value: { time: number, count: number }) => {
          this.updateValue(value);
        }, error => this.hasError(error));
  }

  requestValue() {
    this.valuesSubscription = this.bleService.valuesBy(
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


