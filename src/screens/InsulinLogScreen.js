import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Alert } from 'react-native';
// import { collection, addDoc } from 'firebase/firestore';
// import { db } from '../utils/firebaseConfig';

export default function InsulinLogScreen({ navigation }) {
  const [dose, setDose] = useState('');

  const handleSave = async () => {
    if (!dose || isNaN(dose)) {
      Alert.alert('Error', 'Por favor ingresa un número válido de unidades.');
      return;
    }

    try {
      /* 
      // Código de conexión a base de datos (Comentado hasta configurar credenciales)
      await addDoc(collection(db, 'insulin_logs'), {
        units: parseInt(dose, 10),
        timestamp: new Date().toISOString(),
      });
      */
      Alert.alert('Éxito', `Has registrado ${dose} unidades de insulina exitosamente.`);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el registro.');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Registrar Insulina</Text>
        <Text style={styles.subtitle}>¿Cuántas unidades te inyectaste?</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="0"
          value={dose}
          onChangeText={setDose}
          maxLength={3}
        />
        <Text style={styles.unitText}>Unidades</Text>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>💾 Guardar Registro</Text>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  input: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#2D3748',
    marginRight: 15,
    textAlign: 'center',
    minWidth: 100,
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  unitText: {
    fontSize: 24,
    color: '#A0AEC0',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
