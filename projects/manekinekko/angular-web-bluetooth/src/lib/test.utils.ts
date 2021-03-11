/*
 * Fake Web Bluetooth implementation
 * Replace real browser Bluetooth objects by a much simpler objects that implement some required functionalities
 */

export class FakeBluetoothDevice {
  gatt: BluetoothRemoteGATTServer;
  private listeners: {
    [key in 'gattserverdisconnected']: EventListener[]
  } = {
    gattserverdisconnected: []
  };

  constructor(public id: string, public name: string) {
  }

  addEventListener(type: string, listener: EventListener) {
    this.listeners[type] = [
      ...this.listeners[type],
      listener
    ];
  }

  disconnect() {
    const mockedEvent = {target: this} as unknown;
    this.listeners.gattserverdisconnected.forEach(listener => listener(mockedEvent as Event));
  }

  clear() {
    this.id = undefined;
    this.name = undefined;
    this.listeners = {
      gattserverdisconnected: []
    };
  }
}

export class FakeBluetoothRemoteGATTServer {
  connected = false;

  constructor(public device, public services: { [key: string]: { service, primary: boolean } }) {
    device.gatt = this;
  }

  connect() {
    this.connected = true;
    return Promise.resolve(this);
  }

  getPrimaryService(service: BluetoothServiceUUID) {
    return Promise.resolve(this.services[service].service);
  }

  disconnect() {
    this.device.disconnect();
    this.connected = false;
  }
}

export class FakeBluetoothRemoteGATTService {
  constructor(public device, public characteristics) {
    this.characteristics.service = this;
  }

  getCharacteristic(characteristic: BluetoothCharacteristicUUID) {
    return Promise.resolve(this.characteristics[characteristic]);
  }
}

export class FakeBluetoothRemoteGATTCharacteristic {
  value: DataView;
  properties: BluetoothCharacteristicProperties;
  private readonly initialValue: DataView;
  private listeners: {
    [key in 'characteristicvaluechanged']: EventListener[]
  } = {
    characteristicvaluechanged: []
  };

  constructor(properties: BluetoothCharacteristicProperties, initialValue?: DataView) {
    this.properties = properties;
    this.value = initialValue;
    this.initialValue = initialValue;
  }

  readValue() {
    return Promise.resolve(this.value);
  }

  addEventListener(type: string, listener: EventListener) {
    this.listeners[type] = [
      ...this.listeners[type],
      listener
    ];
  }

  changeValue(value: DataView) {
    this.value = value;
    const mockedEvent = {target: this} as unknown;
    this.listeners.characteristicvaluechanged.forEach(listener => listener(mockedEvent as Event));
  }

  clear() {
    this.value = this.initialValue;
    this.listeners = {
      characteristicvaluechanged: []
    };
  }
}
