import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../utils/store';

export default function ProfileScreen() {
  const userProfile = useAppStore((state) => state.userProfile);
  const updateUserProfile = useAppStore((state) => state.updateUserProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(userProfile);

  const handleSave = () => {
    updateUserProfile(formData);
    setIsEditing(false);
  };

  const renderInput = (label, key, placeholder, keyboardType = 'default') => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !isEditing && styles.inputDisabled]}
        value={formData[key]}
        onChangeText={(text) => setFormData({ ...formData, [key]: text })}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        editable={isEditing}
        keyboardType={keyboardType}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <KeyboardAvoidingView 
          style={{ flex: 1 }} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Perfil Médico</Text>
            <Text style={styles.subtitle}>Ficha clínica y de emergencia</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>👤 Datos Personales</Text>
              </View>
              {renderInput('Nombre Completo', 'name', 'Ej. Juan Pérez')}
              {renderInput('Edad', 'age', 'Ej. 65', 'numeric')}
              {renderInput('Peso (kg)', 'weight', 'Ej. 75', 'numeric')}
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>⚕️ Historial Clínico</Text>
              </View>
              {renderInput('Tipo de Diabetes', 'diabetesType', 'Ej. Tipo 2, Tipo 1...')}
              {renderInput('Tipo de Sangre', 'bloodType', 'Ej. O+')}
              {renderInput('Alergias Conocidas', 'allergies', 'Ej. Penicilina, Ninguna')}
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>🚨 Contacto de Emergencia</Text>
              </View>
              {renderInput('Teléfono de Familiar', 'emergencyContact', 'Ej. 55 1234 5678', 'phone-pad')}
            </View>

            <View style={styles.buttonContainer}>
              {isEditing ? (
                <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
                  <LinearGradient colors={['#0575E6', '#021B79']} style={styles.gradient}>
                    <Text style={styles.actionText}>💾 Guardar Cambios</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.actionButton} onPress={() => setIsEditing(true)}>
                  <LinearGradient colors={['#0575E6', '#021B79']} style={styles.gradient}>
                    <Text style={styles.actionText}>✏️ Editar Perfil</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0F2027',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginTop: 5,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
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
  cardHeader: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F2027',
  },
  inputContainer: {
    marginBottom: 15,
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
  },
  inputDisabled: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    color: '#0F2027',
    padding: 5,
    paddingLeft: 0,
    fontSize: 18,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  actionButton: {
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  }
});
