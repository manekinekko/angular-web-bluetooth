import { LayoutModule } from '@angular/cdk/layout';
import { NgModule } from '@angular/core';
import { MatButtonModule, MatCardModule, MatExpansionModule, MatGridListModule, MatIconModule, MatListModule, MatMenuModule, MatProgressSpinnerModule, MatSnackBarModule, MatToolbarModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WebBluetoothModule } from '@manekinekko/angular-web-bluetooth';
import { AppComponent } from './app.component';
import { BatteryLevelComponent } from './thingy52/battery-level.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HumidityComponent } from './thingy52/humidity.component';
import { StepCounterComponent } from './thingy52/stepcounter.component';
import { TemperatureComponent } from './thingy52/temperature.component';


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
  bootstrap: [AppComponent]
})
export class AppModule { }
