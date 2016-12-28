import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BluetoothCore }   from './bluetooth.service';
import { BrowserWebBluetooth }   from './platform/browser';

@NgModule({
  imports: [CommonModule]
})
export class WebBluetoothModule {
    static forRoot(): ModuleWithProviders {
    return {
      ngModule: WebBluetoothModule,
      providers: [
        BluetoothCore,
        {
          provide: BrowserWebBluetooth,
          useFactory: () => {
            /** @TODO provide a server polyfill */
            return new BrowserWebBluetooth();
          }
        },
      ]
    };
  }
}
