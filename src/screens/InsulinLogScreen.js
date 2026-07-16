import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={styles.header}>
          <Text style={styles.title}>Registrar Insulina</Text>
          <Text style={styles.subtitle}>¿Cuántas unidades te inyectaste?</Text>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#CBD5E0"
              value={dose}
              onChangeText={setDose}
              maxLength={3}
            />
            <Text style={styles.unitText}>Unidades</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <LinearGradient colors={['#0575E6', '#021B79']} style={styles.gradient}>
            <Text style={styles.saveButtonText}>💾 Guardar Registro</Text>
          </LinearGradient>
        </TouchableOpacity>
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
    paddingTop: 10,
    alignItems: 'center',
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
  inputSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 40,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  input: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#0575E6',
    textAlign: 'center',
    minWidth: 150,
  },
  unitText: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 10,
  },
  saveButton: {
    margin: 24,
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
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  }
});
