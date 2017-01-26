import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BluetoothCore }   from './bluetooth.service';
import { BrowserWebBluetooth }   from './platform/browser';

export function browserWebBluetooth() {
  return new BrowserWebBluetooth()
};

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
          useFactory: browserWebBluetooth
        },
      ]
    };
  }
}
