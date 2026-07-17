import { BleManager } from 'react-native-ble-plx';
import { useAppStore } from './store';
import { saveReadingToCloud } from './firebaseConfig';

// UUIDs estándar mundial (Bluetooth SIG)
const GLUCOSE_SERVICE_UUID = '00001808-0000-1000-8000-00805f9b34fb';
const GLUCOSE_MEASUREMENT_CHARACTERISTIC = '00002a18-0000-1000-8000-00805f9b34fb';

const BLOOD_PRESSURE_SERVICE_UUID = '00001810-0000-1000-8000-00805f9b34fb';
const BLOOD_PRESSURE_MEASUREMENT_CHARACTERISTIC = '00002a35-0000-1000-8000-00805f9b34fb';

class BLEService {
  constructor() {
    this.manager = new BleManager();
    this.device = null;
  }

  // Escanear buscando Glucómetros (0x1808) O Baumanómetros (0x1810)
  scanAndConnect() {
    console.log('Verificando estado de la antena...');
    
    this.manager.state().then((bleState) => {
      if (bleState !== 'PoweredOn') {
        alert("¡Atención! Enciende tu Bluetooth para poder buscar el OMRON.");
        return;
      }

      // Lista de prefijos para filtrar solo glucómetros y baumanómetros
      const MEDICAL_PREFIXES = [
        'BLEsmart', 'OMRON', 'HEM-', 
        'Contour', 'OneTouch', 'Accu-Chek', 'Meter+', 
        'FORA', 'iHealth', 'BPM'
      ];

      console.log("Iniciando escaneo (Filtrando solo equipos médicos: OMRON, OneTouch, Accu-Chek, etc.)...");
      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          // El error código 102 significa que los Servicios de Ubicación (GPS) están apagados
          if (error.errorCode === 102 || error.message.includes('Location')) {
            alert("Por reglas de Android, debes encender tu UBICACIÓN (GPS) para poder buscar dispositivos Bluetooth.");
          } else {
            console.error("Error escaneando:", error);
          }
          return;
        }

        if (device && device.name) {
          // Verificar si el nombre del dispositivo coincide con algún prefijo médico
          const isMedicalDevice = MEDICAL_PREFIXES.some(prefix => 
            device.name.toLowerCase().includes(prefix.toLowerCase())
          );

          if (!isMedicalDevice) {
            // Es una bocina (LE-Bose), TV, audífonos, etc. Lo ignoramos en silencio.
            return;
          }

          console.log(`📡 Señal médica detectada: ${device.name}`);
        
          console.log(`¡🎉 DISPOSITIVO MÉDICO ENCONTRADO (${device.name})! Deteniendo escaneo y conectando...`);
          this.manager.stopDeviceScan();
          this.connectToDevice(device);
        }
      });
    });
  }

  async connectToDevice(device) {
    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      const connectedDevice = await device.connect();
      this.device = connectedDevice;
      useAppStore.getState().setGlucometerConnected(true);
      this.isConnecting = false;

      // Limpiamos la suscripción de desconexión si ya existía una
      if (this.disconnectSubscription) {
        this.disconnectSubscription.remove();
      }

      // Detectar cuando el OMRON se apaga (se desconecta) para prepararnos para la siguiente lectura
      this.disconnectSubscription = this.manager.onDeviceDisconnected(device.id, (error, d) => {
        console.log(`🔌 El dispositivo cerró la conexión (Se apagó).`);
        useAppStore.getState().setGlucometerConnected(false);
        this.device = null;
        
        // Esperamos 3 segundos antes de volver a escanear para que Android limpie la caché de Bluetooth
        setTimeout(() => {
          this.scanAndConnect();
        }, 3000);
      });

      await connectedDevice.discoverAllServicesAndCharacteristics();
      
      // Intentamos suscribirnos a ambos servicios (el que exista en el dispositivo no fallará)
      this.subscribeToMeasurements(connectedDevice, GLUCOSE_SERVICE_UUID, GLUCOSE_MEASUREMENT_CHARACTERISTIC, 'GLUCOSE');
      this.subscribeToMeasurements(connectedDevice, BLOOD_PRESSURE_SERVICE_UUID, BLOOD_PRESSURE_MEASUREMENT_CHARACTERISTIC, 'BLOOD_PRESSURE');

    } catch (error) {
      console.error("Error al conectar:", error);
      useAppStore.getState().setGlucometerConnected(false);
      this.isConnecting = false;
    }
  }

  subscribeToMeasurements(device, serviceUUID, characteristicUUID, type) {
    device.monitorCharacteristicForService(
      serviceUUID,
      characteristicUUID,
      (error, characteristic) => {
        if (error) {
          // Es normal que falle si el dispositivo es un glucómetro y tratamos de leer presión (o viceversa)
          return;
        }

        const rawData = characteristic.value;
        console.log(`Dato crudo recibido de ${type}:`, rawData);

        if (type === 'GLUCOSE') {
          try {
            const { Buffer } = require('buffer');
            const buf = Buffer.from(rawData, 'base64');
            
            // Estándar GATT de Glucosa: 
            // Byte 0: Flags (8 bits)
            // Byte 1-2: Sequence Number
            // Byte 3-9: Base Time
            const flags = buf.readUInt8(0);
            
            const timeOffsetPresent = (flags & 0x01) > 0;
            const concentrationPresent = (flags & 0x02) > 0;
            // 0 = kg/L, 1 = mol/L
            const isMolPerL = (flags & 0x04) > 0;

            if (concentrationPresent) {
              let offset = 10; // Inicio después del Base Time
              if (timeOffsetPresent) offset += 2;

              // La concentración viene en formato SFLOAT (16 bits) IEEE-11073
              const rawConcentration = buf.readUInt16LE(offset);
              const mantissa = rawConcentration & 0x0FFF;
              const expRaw = rawConcentration >> 12;
              const exponent = expRaw >= 8 ? expRaw - 16 : expRaw;
              
              let glucoseValue = mantissa * Math.pow(10, exponent);

              // Convertimos a la medida universal mg/dL
              if (!isMolPerL) {
                // kg/L a mg/dL (1 kg/L = 100,000 mg/dL)
                glucoseValue = glucoseValue * 100000;
              } else {
                // mol/L a mg/dL (1 mol/L = 18.0182 * 1000 mg/dL)
                glucoseValue = glucoseValue * 18018.2;
              }

              const finalValue = Math.round(glucoseValue);
              if (finalValue > 0 && finalValue < 1000) {
                console.log(`¡LECTURA DE GLUCOSA DESCIFRADA! Nivel: ${finalValue} mg/dL`);
                useAppStore.getState().setLastGlucoseReading(finalValue);
                // Si Firebase estuviera activo: saveReadingToCloud('GLUCOSE', { value: finalValue });
              }
            }
          } catch (e) {
            console.error("Error al decodificar la glucosa:", e);
          }
        }

        if (type === 'BLOOD_PRESSURE') {
          try {
            // Desencriptamos el Base64 que nos envía el OMRON
            const { Buffer } = require('buffer');
            const buf = Buffer.from(rawData, 'base64');
            
            // Los estándares médicos dictan que la Sistólica está en los bytes 1 y 2, y la Diastólica en los bytes 3 y 4
            const sys = buf.readUInt16LE(1);
            const dia = buf.readUInt16LE(3);

            // Evitamos leer ceros o basura
            if (sys > 0 && dia > 0) {
              console.log(`¡LECTURA MÉDICA DESCIFRADA! Sistólica: ${sys}, Diastólica: ${dia}`);
              useAppStore.getState().setLastBloodPressure({ sys, dia });
              
              // ¡MAGIA! Lo enviamos directamente a la nube
              saveReadingToCloud('BLOOD_PRESSURE', { sys, dia });
            }
          } catch (e) {
            console.error("Error al decodificar la presión arterial:", e);
          }
        }
      }
    );
  }
}

export const bleService = new BLEService();
