import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, PermissionsAndroid, Platform } from 'react-native';
import { useAppStore } from '../utils/store';
import { bleService } from '../utils/bleManager';

export default function BluetoothScreen() {
  const isConnected = useAppStore((state) => state.isGlucometerConnected);
  const setConnected = useAppStore((state) => state.setGlucometerConnected);

  const startRealScan = async () => {
    // Pedir permisos obligatorios en Android
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]);
      if (
        granted['android.permission.ACCESS_FINE_LOCATION'] !== PermissionsAndroid.RESULTS.GRANTED
      ) {
        alert("Necesitamos permiso de ubicación para usar el Bluetooth.");
        return;
      }
    }
    
    // Iniciar antena real
    bleService.scanAndConnect();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vincular Glucómetro</Text>
        <Text style={styles.subtitle}>Conecta tu dispositivo vía Bluetooth</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.statusText}>
          Estado: {isConnected ? '✅ Conectado' : '❌ Desconectado'}
        </Text>
        <Text style={styles.infoText}>
          Asegúrate de que el glucómetro/baumanómetro esté encendido.
        </Text>
      </View>

      <TouchableOpacity 
        style={[styles.bigButton, isConnected ? styles.buttonRed : styles.buttonTeal]} 
        onPress={startRealScan}
      >
        <Text style={styles.buttonText}>
          {isConnected ? 'Escaneando...' : '🔗 Buscar Dispositivos Físicos'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F6F9',
    padding: 20,
  },
  header: {
    marginBottom: 40,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0A2540',
  },
  subtitle: {
    fontSize: 18,
    color: '#6E7A8A',
    marginTop: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 30,
    borderRadius: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: '#A0AEC0',
    textAlign: 'center',
  },
  bigButton: {
    paddingVertical: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonTeal: {
    backgroundColor: '#34C759',
  },
  buttonRed: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
