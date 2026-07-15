import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../utils/store';

export default function DashboardScreen({ navigation }) {
  const lastGlucose = useAppStore((state) => state.lastGlucoseReading) || '--';
  const lastInsulin = useAppStore((state) => state.lastInsulinDose) || '--';
  const lastBP = useAppStore((state) => state.lastBloodPressure);
  const isConnected = useAppStore((state) => state.isGlucometerConnected);

  // Micro-animación (efecto de "respiración" suave)
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
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
  }, [pulseAnim]);

  return (
    <View style={styles.container}>
      {/* Fondo Premium en modo oscuro / dark-glassmorphism */}
      <LinearGradient
        colors={['#0F2027', '#203A43', '#2C5364']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hola,</Text>
          <Text style={styles.subtitle}>Tu salud está bajo control.</Text>
        </View>

        <View style={styles.mainOrbContainer}>
          <Animated.View style={[styles.orb, { transform: [{ scale: pulseAnim }] }]}>
            <LinearGradient
              colors={isConnected ? ['#00F260', '#0575E6'] : ['#4CA1AF', '#C4E0E5']}
              style={styles.orbGradient}
            >
              <Text style={styles.orbValue}>{lastGlucose}</Text>
              <Text style={styles.orbLabel}>mg/dL</Text>
            </LinearGradient>
          </Animated.View>
          <Text style={styles.orbStatus}>
            {isConnected ? '🟢 Dispositivo Sincronizado' : '⚪ Esperando lectura...'}
          </Text>
        </View>

        <View style={styles.cardsRow}>
          <View style={styles.glassCard}>
            <Text style={styles.cardLabel}>Insulina (Hoy)</Text>
            <Text style={styles.cardValue}>{lastInsulin} <Text style={styles.unitSmall}>U</Text></Text>
          </View>
          <View style={styles.glassCard}>
            <Text style={styles.cardLabel}>Presión Art.</Text>
            <Text style={styles.cardValue}>
              {lastBP ? `${lastBP.sys}/${lastBP.dia}` : '--/--'} <Text style={styles.unitSmall}>mmHg</Text>
            </Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.actionButton} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('InsulinLog')}
          >
            <LinearGradient
              colors={['#FF416C', '#FF4B2B']}
              style={styles.actionGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.actionText}>💉 Registrar Dosis</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    marginTop: 10,
  },
  greeting: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 18,
    color: '#A0AEC0',
    fontWeight: '500',
    marginTop: 4,
  },
  mainOrbContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
  },
  orb: {
    width: 220,
    height: 220,
    borderRadius: 110,
    shadowColor: '#00F260',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  orbGradient: {
    flex: 1,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbValue: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  orbLabel: {
    fontSize: 20,
    color: '#E2E8F0',
    fontWeight: '600',
  },
  orbStatus: {
    marginTop: 20,
    fontSize: 14,
    color: '#CBD5E0',
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    flex: 1,
    marginHorizontal: 5,
    padding: 20,
    borderRadius: 24,
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
  },
  cardLabel: {
    fontSize: 14,
    color: '#A0AEC0',
    fontWeight: '600',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  unitSmall: {
    fontSize: 14,
    fontWeight: '400',
  },
  actionContainer: {
    paddingHorizontal: 24,
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 40,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
