import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../store/store';
import FadeSlideIn from '../components/FadeSlideIn';
import PressableScale from '../components/PressableScale';

export default function MedicationScreen({ navigation }) {
  const medications = useAppStore((state) => state.medications);

  const renderItem = ({ item, index }) => (
    <FadeSlideIn delay={Math.min(index, 6) * 80}>
      <View style={styles.medCard}>
        <View style={styles.medIconContainer}>
          <Text style={styles.medIcon}>💊</Text>
        </View>
        <View style={styles.medInfo}>
          <Text style={styles.medName}>{item.name}</Text>
          <Text style={styles.medDose}>{item.dose}</Text>
          <Text style={styles.medFrequency}>🕒 {item.frequency}</Text>
        </View>
      </View>
    </FadeSlideIn>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <FadeSlideIn style={styles.header}>
          <Text style={styles.title}>Mis Medicamentos</Text>
          <Text style={styles.subtitle}>Control de dosis y frecuencia</Text>
        </FadeSlideIn>

        {medications.length > 0 ? (
          <FlatList
            data={medications}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <FadeSlideIn delay={100} style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tienes medicamentos registrados aún.</Text>
          </FadeSlideIn>
        )}

        <FadeSlideIn delay={150} style={styles.buttonContainer}>
          <PressableScale
            style={styles.actionButton}
            onPress={() => alert('Próximamente: Añadir Medicamento')}
          >
            <LinearGradient colors={['#0575E6', '#021B79']} style={styles.gradient}>
              <Text style={styles.buttonText}>➕ Añadir Nuevo Medicamento</Text>
            </LinearGradient>
          </PressableScale>
        </FadeSlideIn>
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
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F2027',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 5,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  medCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  medIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  medIcon: {
    fontSize: 28,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F2027',
    marginBottom: 4,
  },
  medDose: {
    fontSize: 15,
    color: '#0575E6',
    fontWeight: '600',
    marginBottom: 4,
  },
  medFrequency: {
    fontSize: 14,
    color: '#64748B',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  actionButton: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  gradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
