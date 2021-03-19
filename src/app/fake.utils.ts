import { Subject, timer } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import {
  FakeBluetoothDevice,
  FakeBluetoothRemoteGATTCharacteristic,
  FakeBluetoothRemoteGATTServer,
  FakeBluetoothRemoteGATTService
} from '@manekinekko/angular-web-bluetooth';

const config = {
  weather: {
    uuid: 'ef680200-9b35-4933-9b10-52ffa9740042',
    characteristics: [{
      uuid: 'ef680201-9b35-4933-9b10-52ffa9740042',
      randomValueFn: () => {
        const dataView = new DataView(new ArrayBuffer(8));
        dataView.setInt8(0, Math.floor(Math.random() * 100) + 10);
        return dataView;
      }
    }, {
      uuid: 'ef680203-9b35-4933-9b10-52ffa9740042',
      randomValueFn: () => {
        const dataView = new DataView(new ArrayBuffer(8));
        dataView.setInt8(0, Math.floor(Math.random() * 100) + 10);
        return dataView;
      }
    }]
  },
  stepCounter: {
    uuid: 'ef680400-9b35-4933-9b10-52ffa9740042',
    characteristics: [{
      uuid: 'ef680405-9b35-4933-9b10-52ffa9740042',
      randomValueFn: () => {
        const dataView = new DataView(new ArrayBuffer(8));
        dataView.setUint32(0, Math.floor(Math.random() * 100) + 10, true);
        dataView.setUint32(4, Math.floor(Math.random() * 100) + 10, true);
        return dataView;
      }
    }]
  },
  batteryLevel: {
    uuid: '0000180f-0000-1000-8000-00805f9b34fb',
    characteristics: [{
      uuid: '00002a19-0000-1000-8000-00805f9b34fb',
      randomValueFn: () => {
        const dataView = new DataView(new ArrayBuffer(8));
        dataView.setInt8(0, Math.floor(Math.random() * 100) + 10);
        return dataView;
      }
    }]
  }
};

const fakeDevice = new FakeBluetoothDevice('1', 'Fake Device');

const instances = Object.keys(config).map(serviceName => {
  const characteristicsInstances = config[serviceName].characteristics.reduce((acc, elem) => {
    return {
      ...acc,
      [elem.uuid]: new FakeBluetoothRemoteGATTCharacteristic(
        elem.uuid,
        {notify: false} as BluetoothCharacteristicProperties,
        elem.randomValueFn(),
        elem.randomValueFn
      )
    };
  }, {});

  const serviceInstance = new FakeBluetoothRemoteGATTService(config[serviceName].uuid , fakeDevice, characteristicsInstances);

  return {
    name: serviceName,
    uuid: config[serviceName].uuid,
    serviceInstance,
    characteristicsInstances,
  };
});

const gattServices = instances.reduce((acc, elem) => {
  return {
    ...acc,
    [elem.uuid]: elem.serviceInstance
  };
}, {});
const fakeGATTServer = new FakeBluetoothRemoteGATTServer(fakeDevice, gattServices);

const fakeBrowserWebBluetooth: unknown = {
  test: 'bob',
  requestDevice: (options: RequestDeviceOptions) => Promise.resolve(fakeDevice),
};

const start = async () => {
  const disconnectSubject = new Subject();

  const generateFakeValues = () => {
    timer(0, 2000)
      .pipe(
        takeUntil(disconnectSubject),
        tap(_ => {
          instances.forEach(({characteristicsInstances}) => {
            Object.keys(characteristicsInstances)
              .forEach(uuid => {
                const random = characteristicsInstances[uuid].randomValueFn();
                characteristicsInstances[uuid].changeValue(random);
              });
          });
        })
      )
      .subscribe();
  };

  fakeDevice.addEventListener('gattserverconnected', generateFakeValues);
  fakeDevice.addEventListener('gattserverdisconnected', () => disconnectSubject.next());

  await fakeGATTServer.connect();
};

export {
  start,
  fakeBrowserWebBluetooth,
  fakeDevice,
  fakeGATTServer,
};
