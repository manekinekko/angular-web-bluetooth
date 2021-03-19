/*
 * Fake Web Bluetooth implementation
 * Replace real browser Bluetooth objects by a much simpler objects that implement some required functionalities
 */

export class FakeBluetoothDevice {
  gatt: BluetoothRemoteGATTServer;
  private listeners: {
    [key in 'gattserverconnected' | 'gattserverdisconnected']: EventListener[]
  } = {
    gattserverconnected: [],
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

  connect() {
    const mockedEvent = {target: this} as unknown;
    this.listeners.gattserverconnected.forEach(listener => listener(mockedEvent as Event));
  }

  disconnect() {
    const mockedEvent = {target: this} as unknown;
    this.listeners.gattserverdisconnected.forEach(listener => listener(mockedEvent as Event));
  }

  clear() {
    this.id = undefined;
    this.name = undefined;
    this.listeners = {
      gattserverconnected: [],
      gattserverdisconnected: []
    };
  }
}

export class FakeBluetoothRemoteGATTServer {
  connected = false;

  constructor(public device, public services: { [uuid: string]: FakeBluetoothRemoteGATTService } = {}) {
    device.gatt = this;
  }

  connect() {
    this.connected = true;
    this.device.connect();
    return Promise.resolve(this);
  }

  getPrimaryService(uuid: BluetoothServiceUUID) {
    return Promise.resolve(this.services[uuid]);
  }

  getPrimaryServices(uuids: BluetoothServiceUUID[]) {
    return Promise.resolve(
      Object.keys(this.services)
        .filter(uuid => uuids.includes(uuid))
        .map(uuid => this.services[uuid])
    );
  }

  disconnect(callbackFn?: () => void) {
    this.device.disconnect();
    this.connected = false;
    if (callbackFn) {
      callbackFn();
    }
  }
}

export class FakeBluetoothRemoteGATTService {
  constructor(
    public uuid,
    public device,
    public characteristics: {[uuid: string]: FakeBluetoothRemoteGATTCharacteristic}) {
    Object.keys(characteristics).forEach(characteristicUuid => this.characteristics[characteristicUuid].service = this);
  }

  getCharacteristic(uuid: BluetoothCharacteristicUUID) {
    return Promise.resolve(this.characteristics[uuid]);
  }

  getCharacteristics(uuids: BluetoothCharacteristicUUID[]) {
    return Promise.resolve(
      Object.keys(this.characteristics)
        .filter(uuid => uuids.includes(uuid))
        .map(uuid => this.characteristics[uuid])
    );
  }
}

export class FakeBluetoothRemoteGATTCharacteristic {
  uuid: BluetoothCharacteristicUUID;
  service: FakeBluetoothRemoteGATTService;
  value: DataView;
  properties: BluetoothCharacteristicProperties;
  private readonly initialValue: DataView;
  readonly randomValueFn: () => DataView;
  private listeners: {
    [key in 'characteristicvaluechanged']: EventListener[]
  } = {
    characteristicvaluechanged: []
  };

  constructor(
    uuid: BluetoothCharacteristicUUID,
    properties: BluetoothCharacteristicProperties,
    initialValue?: DataView,
    randomValueFn?: () => DataView) {
    this.uuid = uuid;
    this.properties = properties;
    this.value = initialValue;
    this.initialValue = initialValue;
    this.randomValueFn = randomValueFn;
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
    this.listeners.characteristicvaluechanged.forEach(listener => {
      listener(mockedEvent as Event);
    });
  }

  clear() {
    this.value = this.initialValue;
    this.listeners = {
      characteristicvaluechanged: []
    };
  }
}
