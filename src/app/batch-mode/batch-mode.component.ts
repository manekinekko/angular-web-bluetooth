import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { map, mergeAll } from 'rxjs/operators';
import { BleBatchService } from '../ble-batch.service';

@Component({
  selector: 'ble-batch-mode',
  templateUrl: './batch-mode.component.html',
  styles: [`
    .actions {
      display: flex;
      justify-content: flex-end;
      padding: 5px 20px;
    }
  `]
})
export class BatchModeComponent implements OnDestroy, OnInit {
  valuesSubscription: Subscription;

  get device() {
    return this.service.device();
  }

  constructor(
    public readonly service: BleBatchService,
    public snackBar: MatSnackBar
  ) { }

  ngOnInit() {}

  requestValue() {
    this.valuesSubscription = this.service.values()
      .pipe(
        map(conf => conf.value),
        mergeAll(),
      )
      .subscribe(
      () => null,
      error => this.hasError(error)
    );
  }

  disconnect() {
    this.service.disconnectDevice();
    this.valuesSubscription?.unsubscribe();
  }

  hasError(error: string) {
    this.snackBar.open(error, 'Close');
  }

  ngOnDestroy() {
    this.valuesSubscription?.unsubscribe();
  }
}
