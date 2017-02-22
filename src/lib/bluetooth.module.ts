import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BluetoothCore }   from './bluetooth.service';
import { BrowserWebBluetooth }   from './platform/browser';

import { ConsoleLoggerService, NoLoggerService } from './logger.service';

export function browserWebBluetooth() {
  return new BrowserWebBluetooth()
};

export function consoleLoggerService(options: Options) {
  return function () {
    if (options.enableTracing) {
      return new ConsoleLoggerService();
    }
    else {
      return new NoLoggerService();
    }
  }
}

export interface Options {
  enableTracing: boolean;
}

@NgModule({
  imports: [CommonModule]
})
export class WebBluetoothModule {
    static forRoot(options: Options): ModuleWithProviders {
    return {
      ngModule: WebBluetoothModule,
      providers: [
        BluetoothCore,
        {
          provide: BrowserWebBluetooth,
          useFactory: browserWebBluetooth
        },
        {
          provide: ConsoleLoggerService,
          useFactory: consoleLoggerService(options)
        }
      ]
    };
  }
}
