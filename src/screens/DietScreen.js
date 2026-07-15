import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { scheduleDailyMealAlarms } from '../utils/notifications';

const MEALS = [
  { id: '1', title: 'Desayuno', time: '08:00 AM', items: '2 Huevos revueltos, 1 rebanada pan integral, café sin azúcar.', icon: '🍳' },
  { id: '2', title: 'Colación Mañana', time: '11:30 AM', items: '1 Manzana o un puñado de almendras.', icon: '🍎' },
  { id: '3', title: 'Comida', time: '02:30 PM', items: 'Pechuga asada (150g), ensalada verde, 1/2 taza de arroz.', icon: '🥗' },
  { id: '4', title: 'Colación Tarde', time: '05:30 PM', items: 'Gelatina sin azúcar o yogur griego.', icon: '🥣' },
  { id: '5', title: 'Cena', time: '08:00 PM', items: 'Ensalada de atún con galletas habaneras.', icon: '🐟' },
];

export default function DietScreen() {
  useEffect(() => {
    // Al abrir esta pestaña, garantizamos que las alarmas estén programadas
    scheduleDailyMealAlarms();
  }, []);

  return (
    <View style={styles.container}>
      {/* Fondo Premium */}
      <LinearGradient
        colors={['#0F2027', '#203A43', '#2C5364']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Plan Nutricional</Text>
          <Text style={styles.subtitle}>Sincronizado con tus alarmas</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {MEALS.map((meal) => (
            <View key={meal.id} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealIcon}>{meal.icon}</Text>
                <View style={styles.mealTitleContainer}>
                  <Text style={styles.mealTitle}>{meal.title}</Text>
                  <Text style={styles.mealTime}>⏰ {meal.time}</Text>
                </View>
                <View style={styles.alarmStatus}>
                  <Text style={styles.alarmStatusText}>Activada</Text>
                </View>
              </View>
              <View style={styles.mealBody}>
                <Text style={styles.mealItems}>{meal.items}</Text>
              </View>
            </View>
          ))}

          <TouchableOpacity style={styles.uploadButton}>
            <LinearGradient
              colors={['#34C759', '#28A745']}
              style={styles.uploadGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.uploadText}>📸 Subir Foto de Nueva Dieta</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
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
  title: {
    fontSize: 36,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  mealCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  mealIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  mealTitleContainer: {
    flex: 1,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  mealTime: {
    fontSize: 14,
    color: '#F6AD55',
    fontWeight: '700',
    marginTop: 2,
  },
  alarmStatus: {
    backgroundColor: 'rgba(0, 242, 96, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  alarmStatusText: {
    color: '#00F260',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mealBody: {
    marginTop: 5,
  },
  mealItems: {
    fontSize: 16,
    color: '#CBD5E0',
    lineHeight: 24,
  },
  uploadButton: {
    marginTop: 20,
    borderRadius: 20,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  uploadGradient: {
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
