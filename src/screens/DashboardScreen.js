import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, ScrollView, PermissionsAndroid, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/store';
import { bleService } from '../services/bleManager';

export default function DashboardScreen({ navigation }) {
  const activePatientId = useAppStore((state) => state.activePatientId);
  const activePatient = useAppStore((state) => state.patients[state.activePatientId]);
  const setActivePatient = useAppStore((state) => state.setActivePatient);

  const lastGlucose = activePatient.lastGlucoseReading || '--';
  const saveGlucose = useAppStore((state) => state.saveGlucoseReading);
  const clearGlucose = useAppStore((state) => state.clearCurrentGlucose);
  const lastInsulin = activePatient.lastInsulinDose || '--';
  const lastBP = activePatient.lastBloodPressure;
  const isConnected = useAppStore((state) => state.isGlucometerConnected);

  // Micro-animación (efecto de "respiración" suave)
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Motion Graphics: Animación de entrada limpia
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Auto-escanear al abrir el Dashboard
  useEffect(() => {
    const autoScan = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        if (granted['android.permission.ACCESS_FINE_LOCATION'] !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log("Falta permiso de ubicación para auto-escanear");
          return;
        }
      }
      console.log("Iniciando escaneo automático en segundo plano desde el Dashboard...");
      bleService.scanAndConnect();
    };
    
    // Lo ejecutamos con un ligero retraso para no trabar la animación de UI inicial
    setTimeout(() => {
      autoScan();
    }, 1000);
  }, []);

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      })
    ]).start();

    // Loop de respiración
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim, fadeAnim, slideAnim]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <Animated.ScrollView 
          contentContainerStyle={{ paddingBottom: 40 }} 
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        >
          <View style={styles.header}>
            <View style={styles.brandContainer}>
              <Text style={styles.brandTitle}>GLUCMT<Text style={styles.brandHighlight}>-Y4GA</Text></Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>Hola, {activePatient.name}</Text>
                <Text style={styles.subtitle}>Tu salud está bajo control.</Text>
              </View>
              <TouchableOpacity 
                style={{ backgroundColor: '#E2E8F0', padding: 8, borderRadius: 20 }}
                onPress={() => setActivePatient(activePatientId === '1' ? '2' : '1')}
              >
                <Text style={{ fontWeight: 'bold', color: '#0575E6' }}>Cambiar Perfil 👥</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.mainOrbContainer}>
            <Animated.View style={[styles.orb, { transform: [{ scale: pulseAnim }] }]}>
              <LinearGradient
                colors={isConnected ? ['#00F260', '#0575E6'] : ['#1A2980', '#26D0CE']}
                style={styles.orbGradient}
              >
                <Text style={styles.orbLabel}>PRESIÓN ARTERIAL</Text>
                <Text style={styles.orbValue}>
                  {lastBP ? `${lastBP.sys}/${lastBP.dia}` : '--/--'}
                </Text>
                <Text style={styles.orbUnit}>mmHg</Text>
              </LinearGradient>
            </Animated.View>
            <Text style={styles.orbStatus}>
              {isConnected ? '🟢 Dispositivo Sincronizado' : '⚪ Esperando toma...'}
            </Text>
          </View>

          <View style={styles.cardsRow}>
            <View style={styles.glassCard}>
              <Text style={styles.cardLabel}>Glucosa</Text>
              <Text style={styles.cardValue}>{lastGlucose} <Text style={styles.unitSmall}>mg/dL</Text></Text>
              {lastGlucose !== '--' && (
                <View style={styles.glucoseActions}>
                  <TouchableOpacity style={styles.glucoseBtnSave} onPress={saveGlucose}>
                    <Text style={styles.glucoseBtnText}>Guardar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.glucoseBtnClear} onPress={clearGlucose}>
                    <Text style={styles.glucoseBtnText}>Limpiar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
            <View style={styles.glassCard}>
              <Text style={styles.cardLabel}>Insulina</Text>
              <Text style={styles.cardValue}>{lastInsulin} <Text style={styles.unitSmall}>U</Text></Text>
            </View>
          </View>

          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, { flex: 1, marginRight: 8 }]} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('InsulinLog')}
            >
              <LinearGradient
                colors={['#FF416C', '#FF4B2B']}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.actionText}>💉 Insulina</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { flex: 1, marginLeft: 8 }]} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Medications')}
            >
              <LinearGradient
                colors={['#8E2DE2', '#4A00E0']}
                style={styles.actionGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.actionText}>💊 Pastillas</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.ScrollView>
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
    paddingTop: 15,
  },
  brandContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F2027',
    letterSpacing: 4,
    fontStyle: 'italic',
  },
  brandHighlight: {
    color: '#0575E6',
  },
  greetingContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#0575E6',
    paddingLeft: 15,
    marginTop: 10,
  },
  greeting: {
    fontSize: 36,
    fontWeight: '300', // Delgado, elegante
    color: '#0F2027',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  mainOrbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  orb: {
    width: 280,
    height: 280,
    borderRadius: 140,
    shadowColor: '#0575E6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: '#FFFFFF',
  },
  orbGradient: {
    flex: 1,
    borderRadius: 140,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  orbValue: {
    fontSize: 85,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -3,
    marginVertical: 0,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  orbLabel: {
    fontSize: 16,
    color: '#E2E8F0',
    fontWeight: '700',
    letterSpacing: 2,
    opacity: 0.9,
  },
  orbUnit: {
    fontSize: 22,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  orbStatus: {
    marginTop: 25,
    fontSize: 16,
    color: '#CBD5E0',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  glassCard: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    marginHorizontal: 8,
    padding: 24,
    borderRadius: 24,
    borderColor: '#E2E8F0',
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#0F2027',
  },
  unitSmall: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '600',
  },
  glucoseActions: {
    flexDirection: 'row',
    marginTop: 15,
    width: '100%',
    justifyContent: 'space-around',
  },
  glucoseBtnSave: {
    backgroundColor: '#00F260',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  glucoseBtnClear: {
    backgroundColor: '#FF4B2B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  glucoseBtnText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionContainer: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    marginTop: 20,
  },
  actionButton: {
    borderRadius: 24,
    shadowColor: '#FF4B2B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8,
  },
  actionGradient: {
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
