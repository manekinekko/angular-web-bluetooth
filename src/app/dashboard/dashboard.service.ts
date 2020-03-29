import { Injectable } from '@angular/core';
import { BluetoothCore } from '@manekinekko/angular-web-bluetooth';
import { map, flatMap } from 'rxjs/operators';
import { of } from 'rxjs';

type ServiceOptions = {
  characteristic: string;
  service: string;
  decoder(value: DataView): number | { [key: string]: number };
};

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  // tslint:disable-next-line: variable-name
  private config: ServiceOptions[];

  constructor(public ble: BluetoothCore) {
    this.config = [
      // temperature
      {
        decoder: (value: DataView) => {
          const integer = value.getInt8(0);
          const decimal = value.getUint8(1);
          return integer + decimal / 100;
        },
        characteristic: 'ef680201-9b35-4933-9b10-52ffa9740042',
        service: 'ef680200-9b35-4933-9b10-52ffa9740042'
      },
      // step counter
      {
        decoder: (value: DataView) => {
          const count = value.getUint32(0, true);
          const time = value.getUint32(4, true);
          return {
            count,
            time
          };
        },
        service: 'ef680400-9b35-4933-9b10-52ffa9740042',
        characteristic: 'ef680405-9b35-4933-9b10-52ffa9740042'
      },

      // humidity
      {
        decoder: (value: DataView) => value.getInt8(0),
        service: 'ef680200-9b35-4933-9b10-52ffa9740042',
        characteristic: 'ef680203-9b35-4933-9b10-52ffa9740042'
      },

      // battery level
      {
        decoder: (value: DataView) => value.getInt8(0),
        service: 'battery_service',
        characteristic: 'battery_level'
      }
    ];
  }

  getDevice() {
    return this.ble.getDevice$();
  }

  stream() {
    return of(this.config.map(c => {
      return this.ble.streamValues$().pipe(map(c.decoder));
    }));
  }

  value() {
    const services = this.config.map(c => c.service);
    const characteristics = this.config.map(c => c.characteristic);

    return of(1).pipe(
      flatMap(() => {
        return this.config.map(c => {
          return this.ble.value$({
            service: c.service,
            characteristic: c.characteristic,
          });
        });
      })
    );
  }

  disconnectDevice() {
    this.ble.disconnectDevice();
  }
}
