import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BluetoothCore, ConsoleLoggerService } from '@manekinekko/angular-web-bluetooth';
import { EMPTY, merge, of, Subscription } from 'rxjs';
import { catchError, filter, map, mergeMap } from 'rxjs/operators';

type ServiceOptions = {
  characteristic: string;
  service: string;
  decoder(value: DataView): number | { [key: string]: number };
};

@Injectable({
  providedIn: 'root'
})
export class BleBatchService {
  private config: ServiceOptions[];
  private discoverSubscription: Subscription;

  constructor(
    public ble: BluetoothCore,
    public snackBar: MatSnackBar,
    public console: ConsoleLoggerService) {
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
        service: '0000180f-0000-1000-8000-00805f9b34fb', // battery_service
        characteristic: '00002a19-0000-1000-8000-00805f9b34fb' // battery_level
      }
    ];
  }

  device() {
    return this.ble.getDevice$();
  }

  streamsBy(service: BluetoothServiceUUID, characteristic: BluetoothCharacteristicUUID) {
    return this.ble.streamDetailedValues$()
        .pipe(
            filter(this.getServicePredicate(service, characteristic)),
            map(({value}) => this.getDecoder(service, characteristic)(value)),
        );
  }

  values() {
    this.discoverSubscription = this.ble.discover$({
      acceptAllDevices: true,
      optionalServices: this.config.map(c => c.service)
    }).subscribe(() => {
      this.console.log('[DashboardService::Values] Discovery process launched');
    });

    const values = this.config.map(c => {
      return of({
        service: c.service,
        characteristic: c.characteristic,
        value: this.ble.getGATT$()
          .pipe(
            mergeMap((gatt: BluetoothRemoteGATTServer) => this.ble.getPrimaryService$(gatt, c.service)
              .pipe(catchError(error => {
                this.hasError(error);
                return EMPTY;
              }))),
            mergeMap((gattService: BluetoothRemoteGATTService) => this.ble.getCharacteristic$(gattService, c.characteristic)
              .pipe(catchError(error => {
                this.hasError(error);
                return EMPTY;
              }))),
            mergeMap((gattCharacteristic: BluetoothRemoteGATTCharacteristic) => this.ble.readValue$(gattCharacteristic)),
            map((dataView: DataView) => c.decoder(dataView)),
          )
      });
    });

    return merge(...values);
  }

  valuesBy(service: BluetoothServiceUUID, characteristic: BluetoothCharacteristicUUID) {
    return this.values()
      .pipe(
        filter(this.getServicePredicate(service, characteristic)),
        mergeMap(conf => conf.value),
      );
  }

  getDecoder(service: BluetoothServiceUUID, characteristic: BluetoothCharacteristicUUID) {
    return this.config.find(conf => conf.service === service && conf.characteristic === characteristic)?.decoder;
  }

  getServicePredicate(service: BluetoothServiceUUID, characteristic: BluetoothCharacteristicUUID) {
    return (conf) => {
      return conf.service === service && conf.characteristic === characteristic;
    };
  }

  disconnectDevice() {
    this.ble.disconnectDevice();
    this.discoverSubscription?.unsubscribe();
  }

  hasError(error: string) {
    this.snackBar.open(error, 'Close');
  }
}
