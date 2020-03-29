import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { DashboardService } from './dashboard.service';

@Component({
  selector: 'ble-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnDestroy, OnInit {
  valuesSubscription: Subscription;

  get device() {
    return this.service.getDevice();
  }

  constructor(
    public readonly service: DashboardService,
    public snackBar: MatSnackBar
  ) {
  }

  ngOnInit() {}

  requestValue() {
    this.valuesSubscription = this.service.value().subscribe(
      () => null,
      error => this.hasError(error)
    );
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
  }
}
