import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { WebBluetoothModule } from '@manekinekko/angular-web-bluetooth';

import { AppComponent } from './app.component';
import { BatteryLevelComponent } from './demo/battery-level/battery-level.component';
import { DemoComponent } from './demo/demo.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule, MatButtonModule, MatIconModule, MatListModule, MatExpansionModule, MatSnackBarModule, MatProgressBarModule } from '@angular/material';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TemperatureComponent } from './demo/temperature/temperature.component';
import { HumidityComponent } from './demo/humidity/humidity.component';

@NgModule({
  declarations: [
    AppComponent, 
    BatteryLevelComponent, 
    DemoComponent,
    TemperatureComponent,
    HumidityComponent
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
    MatProgressBarModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
