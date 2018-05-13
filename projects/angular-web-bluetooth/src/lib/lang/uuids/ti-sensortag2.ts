// http://processors.wiki.ti.com/images/a/a8/BLE_SensorTag_GATT_Server.pdf

// prettier-ignore
export const TiTag = {

  DEVICE_INFORMATION : {
    SERVICE :                 'f000180a-0451-4000-b000-000000000000',
    SYSTEM_ID :               'f0002a23-0451-4000-b000-000000000000',
    MODEL_NUMBER :            'f0002a24-0451-4000-b000-000000000000',
    SERIAL_NUMBER :           'f0002a25-0451-4000-b000-000000000000',
    FIRMWARE_REV :            'f0002a26-0451-4000-b000-000000000000',
    HARDWARE_REV :            'f0002a27-0451-4000-b000-000000000000',
    SOFTWARE_REV :            'f0002a28-0451-4000-b000-000000000000',
    MANIFACTURER :            'f0002a29-0451-4000-b000-000000000000',
    IEEE11073 :               'f0002a2a-0451-4000-b000-000000000000',
    PNP_ID :                  'f0002a50-0451-4000-b000-000000000000'
  },

  BATTERY : {
    SERVICE :                 'f000180f-0451-4000-b000-000000000000',
    LEVEL :                   'f0002a19-0451-4000-b000-000000000000'
  },

  TEMPERATURE : {
    SERVICE :                 'f000aa00-0451-4000-b000-000000000000',
    DATA :                    'f000aa01-0451-4000-b000-000000000000',
    CONFIGURATION :           'f000aa02-0451-4000-b000-000000000000',
    PERIOD :                  'f000aa03-0451-4000-b000-000000000000'
  },

  HUMIDITY : {
    SERVICE :                 'f000aa20-0451-4000-b000-000000000000',
    DATA :                    'f000aa21-0451-4000-b000-000000000000',
    CONFIGURATION :           'f000aa22-0451-4000-b000-000000000000',
    PERIOD :                  'f000aa23-0451-4000-b000-000000000000'
  },

  BAROMETER : {
    SERVICE :                 'f000aa40-0451-4000-b000-000000000000',
    DATA :                    'f000aa41-0451-4000-b000-000000000000',
    CONFIGURATION :           'f000aa42-0451-4000-b000-000000000000',
    PERIOD :                  'f000aa44-0451-4000-b000-000000000000'
  },

  // service not available in model CC2650
  // ACCELEROMETER : {
  //   SERVICE :                 'f000aa10-0451-4000-b000-000000000000',
  //   DATA :                    'f000aa11-0451-4000-b000-000000000000',
  //   CONFIGURATION :           'f000aa12-0451-4000-b000-000000000000',
  //   PERIOD :                  'f000aa13-0451-4000-b000-000000000000'
  // },

  // service not available in model CC2650
  // MAGNETOMETER : {
  //   SERVICE :                 'f000aa30-0451-4000-b000-000000000000',
  //   DATA :                    'f000aa31-0451-4000-b000-000000000000',
  //   CONFIGURATION :           'f000aa32-0451-4000-b000-000000000000',
  //   PERIOD :                  'f000aa33-0451-4000-b000-000000000000'
  // },

  // service not available in model CC2650
  // GYROSCOPE : {
  //   SERVICE :                 'f000aa50-0451-4000-b000-000000000000',
  //   DATA :                    'f000aa51-0451-4000-b000-000000000000',
  //   CONFIGURATION :           'f000aa52-0451-4000-b000-000000000000',
  //   PERIOD :                  'f000aa53-0451-4000-b000-000000000000'
  // },

  MOVEMENT : {
    SERVICE :                 'f000aa80-0451-4000-b000-000000000000',
    DATA :                    'f000aa81-0451-4000-b000-000000000000',
    CONFIGURATION :           'f000aa82-0451-4000-b000-000000000000',
    PERIOD :                  'f000aa83-0451-4000-b000-000000000000'
  },

  LIGHT : {
    SERVICE :                 'f000aa70-0451-4000-b000-000000000000',
    DATA :                    'f000aa71-0451-4000-b000-000000000000',
    CONFIGURATION :           'f000aa72-0451-4000-b000-000000000000',
    PERIOD :                  'f000aa73-0451-4000-b000-000000000000'
  },

  KEYPRESS : {
    SERVICE :                 'f000ffe0-0451-4000-b000-000000000000',
    STATE :                   'f000ffe1-0451-4000-b000-000000000000'
  },

  __REGISTER__ : {
    SERVICE :                 'f000ac00-0451-4000-b000-000000000000',
    DATA :                    'f000ac01-0451-4000-b000-000000000000',
    ADDRESS :                 'f000ac02-0451-4000-b000-000000000000',
    DEVICE_ID :               'f000ac03-0451-4000-b000-000000000000'
  },

  CONTROL : {
    SERVICE :                 'f000ccc0-0451-4000-b000-000000000000',
    CURRENT_USED_PARAMETERS : 'f000ccc1-0451-4000-b000-000000000000',
    REQUEST_NEW_PARAMETERS :  'f000ccc2-0451-4000-b000-000000000000',
    DISCONNECT_REQUEST :      'f000ccc3-0451-4000-b000-000000000000'
  },

  OAD : {
    SERVICE :                 'f000ffc0-0451-4000-b000-000000000000',
    IMAGE_NOTIFY :            'f000ffc1-0451-4000-b000-000000000000',
    IMAGE_BLOCK_REQUEST :     'f000ffc2-0451-4000-b000-000000000000',
    IMAGE_COUNT :             'f000ffc3-0451-4000-b000-000000000000',
    IMAGE_STATUS :            'f000ffc4-0451-4000-b000-000000000000'
  },

  IO : {
    SERVICE :                 'f000aa64-0451-4000-b000-000000000000',
    DATA :                    'f000aa65-0451-4000-b000-000000000000',
    CONFIG :                  'f000aa66-0451-4000-b000-000000000000'
  }
};

export const TI_SENSORAG_SERVICES = Object.keys(TiTag).map(key => TiTag[key].SERVICE);
