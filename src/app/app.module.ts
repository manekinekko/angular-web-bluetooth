import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { WebBluetoothModule } from '@manekinekko/angular-web-bluetooth';

import { AppComponent } from './app.component';
import { BatteryLevelComponent } from './battery-level/battery-level.component';

@NgModule({
  declarations: [AppComponent, BatteryLevelComponent],
  entryComponents: [BatteryLevelComponent],
  imports: [
    BrowserModule,
    WebBluetoothModule.forRoot({
      enableTracing: true
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
