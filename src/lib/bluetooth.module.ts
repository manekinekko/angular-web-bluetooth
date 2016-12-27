import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { WebBluetooth }   from './bluetooth.service';

@NgModule({
  imports: [CommonModule]
})
export class WebBluetoothModule {
    static forRoot(): WebBluetoothModule {
    return {
      ngModule: WebBluetoothModule,
      providers: [WebBluetooth]
    };
  }
}
