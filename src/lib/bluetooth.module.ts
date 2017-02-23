import { NgModule, ModuleWithProviders, OpaqueToken, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BluetoothCore }   from './bluetooth.service';
import { BrowserWebBluetooth }   from './platform/browser';

import { ConsoleLoggerService, NoLoggerService } from './logger.service';

export function browserWebBluetooth() {
  return new BrowserWebBluetooth()
};

export interface AWBOptions {
  enableTracing?: boolean;
}

export function consoleLoggerServiceConfig(options: AWBOptions) {
  if (options && options.enableTracing) {
    return new ConsoleLoggerService();
  }
  else {
    return new NoLoggerService();
  }
}
export function makeMeTokenInjector() {
  return new OpaqueToken('AWBOptions');
}

@NgModule({
  imports: [CommonModule]
})
export class WebBluetoothModule {
    static forRoot(options: AWBOptions = {}): ModuleWithProviders {
    return {
      ngModule: WebBluetoothModule,
      providers: [
        BluetoothCore,
        {
          provide: BrowserWebBluetooth,
          useFactory: browserWebBluetooth
        },
        {
          provide: makeMeTokenInjector, useValue: options
        },
        {
          provide: ConsoleLoggerService,
          useFactory: consoleLoggerServiceConfig,
          deps: [
            makeMeTokenInjector
          ]
        }
      ]
    };
  }
}
