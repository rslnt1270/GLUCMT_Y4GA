import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PermissionsAndroid, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/store';
import { bleService } from '../services/bleManager';

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
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={styles.header}>
        <Text style={styles.title}>Vincular Dispositivos Médicos</Text>
        <Text style={styles.subtitle}>Conecta tus dispositivos vía Bluetooth</Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusCircle, isConnected ? styles.statusConnected : styles.statusDisconnected]}>
          <Text style={styles.statusIcon}>{isConnected ? '🔗' : '📡'}</Text>
        </View>
        <Text style={styles.statusText}>
          {isConnected ? 'Dispositivo Conectado' : 'Dispositivo Desconectado'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {isConnected ? (
          <TouchableOpacity style={styles.buttonSecondary} onPress={() => setConnected(false)}>
            <Text style={styles.buttonTextSecondary}>Desconectar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.buttonPrimary} onPress={startRealScan}>
            <LinearGradient colors={['#0575E6', '#021B79']} style={styles.gradient}>
              <Text style={styles.buttonTextPrimary}>Escanear y Conectar</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F2027',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 5,
    textAlign: 'center',
  },
  statusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  statusDisconnected: {
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  statusConnected: {
    borderColor: '#0575E6',
    backgroundColor: '#EFF6FF',
  },
  statusIcon: {
    fontSize: 60,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0F2027',
  },
  buttonContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  buttonPrimary: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonSecondary: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  buttonTextSecondary: {
    color: '#64748B',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
