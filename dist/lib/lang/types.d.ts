export interface BluetoothRemoteGATTDescriptor {
}
export interface BluetoothServiceUUID {
}
export interface BluetoothCharacteristicUUID {
}
export interface BluetoothCharacteristicProperties {
    authenticatedSignedWrites: boolean;
    broadcast: boolean;
    indicate: boolean;
    notify: boolean;
    read: boolean;
    reliableWrite: boolean;
    writableAuxiliaries: boolean;
    write: boolean;
    writeWithoutResponse: boolean;
}
export interface BluetoothDescriptorUUID {
}
export interface BluetoothRemoteGATTDescriptor {
}
export interface BluetoothDescriptorUUID {
}
export interface RequestDeviceOptions {
    filters?: Array<any>;
    optionalServices?: Array<any>;
}
export interface BluetoothRemoteGATTServer {
    connected: boolean;
    device: BluetoothDevice;
    connect(): Promise<BluetoothRemoteGATTServer>;
    disconnect(): any;
    getPrimaryService(service: BluetoothServiceUUID): Promise<BluetoothRemoteGATTService>;
    getPrimaryServices(service?: BluetoothServiceUUID): Promise<Array<BluetoothRemoteGATTService>>;
}
export interface BluetoothGATTService {
    uuid: string;
    isPrimary: boolean;
    device: BluetoothDevice;
    getCharacteristic(characteristic: BluetoothCharacteristicUUID): Promise<BluetoothGATTCharacteristic>;
    getCharacteristics(characteristic?: BluetoothCharacteristicUUID): Promise<Array<BluetoothGATTCharacteristic>>;
    getIncludedService(service: BluetoothServiceUUID): Promise<BluetoothGATTService>;
    getIncludedServices(service?: BluetoothServiceUUID): Promise<Array<BluetoothGATTService>>;
}
export interface BluetoothRemoteGATTService extends BluetoothGATTService {
}
export interface ArrayBuffer {
}
export interface DataView {
    buffer: ArrayBuffer;
    byteLength: number;
    byteOffset: number;
    getInt8(byteOffset: number, littlEndian?: boolean): number;
    getUint8(byteOffset: number, littlEndian?: boolean): number;
    getInt16(byteOffset: number, littlEndian?: boolean): number;
    getUint16(byteOffset: number, littlEndian?: boolean): number;
    getInt32(byteOffset: number, littlEndian?: boolean): number;
    getUint32(byteOffset: number, littlEndian?: boolean): number;
    getFloat32(byteOffset: number, littlEndian?: boolean): number;
    getFloat64(byteOffset: number, littlEndian?: boolean): number;
    setInt8(byteOffset: number, value: number, littlEndian?: boolean): void;
    setUint8(byteOffset: number, value: number, littlEndian?: boolean): void;
    setInt16(byteOffset: number, value: number, littlEndian?: boolean): void;
    setUint16(byteOffset: number, value: number, littlEndian?: boolean): void;
    setInt32(byteOffset: number, value: number, littlEndian?: boolean): void;
    setUint32(byteOffset: number, value: number, littlEndian?: boolean): void;
    setFloat32(byteOffset: number, value: number, littlEndian?: boolean): void;
    setFloat64(byteOffset: number, value: number, littlEndian?: boolean): void;
}
export interface BluetoothRemoteGATTCharacteristic {
    service: BluetoothRemoteGATTService;
    uuid: string;
    properties: BluetoothCharacteristicProperties;
    value: DataView;
    oncharacteristicvaluechanged: (event: Event) => void;
    readValue(): Promise<DataView>;
    writeValue(value: ArrayBuffer): Promise<void>;
    startNotifications(): Promise<void>;
    stopNotifications(): Promise<void>;
    getDescriptor(descriptor: BluetoothDescriptorUUID): Promise<BluetoothRemoteGATTDescriptor>;
    getDescriptors(descriptor?: BluetoothDescriptorUUID): Promise<Array<BluetoothRemoteGATTDescriptor>>;
}
export interface BluetoothGATTCharacteristic extends BluetoothRemoteGATTCharacteristic {
}
export interface BluetoothDevice {
    gatt: BluetoothRemoteGATTServer;
    id: string;
    name: string;
    ongattserverdisconnected: (event: Event) => void;
    uuids: number[];
}
