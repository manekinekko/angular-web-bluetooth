import { LayoutModule } from '@angular/cdk/layout';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import {
  BluetoothCore,
  BrowserWebBluetooth,
  ConsoleLoggerService,
  WebBluetoothModule
} from '@manekinekko/angular-web-bluetooth';
import { AppComponent } from './app.component';
import { DashboardService } from './dashboard/dashboard.service';
import { BatteryLevelComponent } from './thingy52/battery-level.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HumidityComponent } from './thingy52/humidity.component';
import { StepCounterComponent } from './thingy52/stepcounter.component';
import { TemperatureComponent } from './thingy52/temperature.component';
import { fakeBrowserWebBluetooth, start } from './fake.utils';

const bleCore = (b: BrowserWebBluetooth, l: ConsoleLoggerService) => new BluetoothCore(b, l);
const fakeBleCore = (b: BrowserWebBluetooth, l: ConsoleLoggerService) => {
  start().then();
  return new BluetoothCore(fakeBrowserWebBluetooth as BrowserWebBluetooth, l);
};

const PROVIDERS = [
  {
    provide: BluetoothCore,
    useFactory: bleCore, // bleCore or fakeBleCore
    deps: [BrowserWebBluetooth, ConsoleLoggerService]
  },
  DashboardService
];

@NgModule({
  declarations: [
    AppComponent,
    BatteryLevelComponent,
    TemperatureComponent,
    HumidityComponent,
    StepCounterComponent,
    DashboardComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    WebBluetoothModule.forRoot({
      enableTracing: true
    }),
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule
  ],
  providers: PROVIDERS,
  bootstrap: [AppComponent]
})
export class AppModule {}
