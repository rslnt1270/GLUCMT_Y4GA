import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, TextInput, Modal, Alert } from 'react-native';
import { useAppStore } from '../utils/store';

export default function DietScreen() {
  const dietMeals = useAppStore((state) => state.dietMeals);
  const addDietMeal = useAppStore((state) => state.addDietMeal);
  const removeDietMeal = useAppStore((state) => state.removeDietMeal);

  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleSaveMeal = () => {
    if (!newTitle.trim() || !newDesc.trim()) {
      Alert.alert('Error', 'Por favor llena el título y la descripción (alimentos).');
      return;
    }
    const newMeal = {
      id: Date.now().toString(),
      title: newTitle,
      time: newTime || 'Horario Flexible',
      description: newDesc,
    };
    addDietMeal(newMeal);
    setModalVisible(false);
    setNewTitle('');
    setNewTime('');
    setNewDesc('');
  };

  const handleRemove = (id) => {
    Alert.alert(
      'Eliminar Comida',
      '¿Estás seguro de que quieres eliminar esta comida del plan?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => removeDietMeal(id) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={styles.header}>
          <Text style={styles.title}>Plan de Dieta</Text>
          <Text style={styles.subtitle}>Personaliza tu alimentación saludable</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {dietMeals.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No hay comidas registradas. ¡Añade tu primer platillo!</Text>
            </View>
          ) : (
            dietMeals.map((meal) => (
              <View key={meal.id} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <Text style={styles.mealTitle}>{meal.title}</Text>
                  <View style={styles.timeActionRow}>
                    <Text style={styles.mealTime}>{meal.time}</Text>
                    <TouchableOpacity onPress={() => handleRemove(meal.id)} style={styles.deleteButton}>
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.mealDesc}>{meal.description}</Text>
              </View>
            ))
          )}

          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.addButtonText}>➕ Añadir Comida / Colación</Text>
          </TouchableOpacity>
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Nueva Comida</Text>

              <Text style={styles.label}>Título (ej. 🍏 Colación, 🌙 Cena)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Título" 
                value={newTitle} 
                onChangeText={setNewTitle} 
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.label}>Horario (ej. 11:00 AM)</Text>
              <TextInput 
                style={styles.input} 
                placeholder="Horario (Opcional)" 
                value={newTime} 
                onChangeText={setNewTime} 
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.label}>Alimentos (Descripción)</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="• 1 Manzana&#10;• Almendras" 
                value={newDesc} 
                onChangeText={setNewDesc} 
                multiline
                placeholderTextColor="#94A3B8"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveMeal}>
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0F2027',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 5,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F2027',
  },
  timeActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTime: {
    fontSize: 14,
    color: '#0575E6',
    fontWeight: '600',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  mealDesc: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 26,
  },
  addButton: {
    backgroundColor: '#0575E6',
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#0575E6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 32, 39, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F2027',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 15,
    color: '#0F2027',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0575E6',
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
