import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // Soporte Multi-Paciente
  activePatientId: '1',
  patients: {
    '1': {
      id: '1',
      name: 'Papá',
      lastGlucoseReading: null,
      glucoseHistory: [],
      lastBloodPressure: null,
      lastInsulinDose: null,
    },
    '2': {
      id: '2',
      name: 'Mamá',
      lastGlucoseReading: null,
      glucoseHistory: [],
      lastBloodPressure: null,
      lastInsulinDose: null,
    }
  },
  
  setActivePatient: (id) => set({ activePatientId: id }),

  addPatient: (name) => set((state) => {
    const newId = Date.now().toString();
    return {
      patients: {
        ...state.patients,
        [newId]: {
          id: newId,
          name: name,
          lastGlucoseReading: null,
          glucoseHistory: [],
          lastBloodPressure: null,
          lastInsulinDose: null,
        }
      },
      activePatientId: newId
    };
  }),

  // Helpers para interactuar con el paciente activo
  setLastGlucoseReading: (reading) => set((state) => ({
    patients: {
      ...state.patients,
      [state.activePatientId]: { ...state.patients[state.activePatientId], lastGlucoseReading: reading }
    }
  })),
  
  saveGlucoseReading: () => set((state) => {
    const activePatient = state.patients[state.activePatientId];
    if (!activePatient.lastGlucoseReading) return state;
    
    return {
      patients: {
        ...state.patients,
        [state.activePatientId]: {
          ...activePatient,
          glucoseHistory: [
            ...activePatient.glucoseHistory,
            { value: activePatient.lastGlucoseReading, date: new Date().toISOString() }
          ],
          lastGlucoseReading: null
        }
      }
    };
  }),

  clearCurrentGlucose: () => set((state) => ({
    patients: {
      ...state.patients,
      [state.activePatientId]: { ...state.patients[state.activePatientId], lastGlucoseReading: null }
    }
  })),

  setLastBloodPressure: (bp) => set((state) => ({
    patients: {
      ...state.patients,
      [state.activePatientId]: { ...state.patients[state.activePatientId], lastBloodPressure: bp }
    }
  })),
  
  setLastInsulinDose: (dose) => set((state) => ({
    patients: {
      ...state.patients,
      [state.activePatientId]: { ...state.patients[state.activePatientId], lastInsulinDose: dose }
    }
  })),

  // Estado de Bluetooth (es global al teléfono, no por paciente)
  isGlucometerConnected: false,
  setGlucometerConnected: (status) => set({ isGlucometerConnected: status }),

  // Estado de Alarmas y Medicamentos (Por simplicidad, los dejamos globales o se podrían migrar)
  nextAlarmTime: null,
  setNextAlarmTime: (time) => set({ nextAlarmTime: time }),

  // Estado de Medicamentos
  medications: [
    { id: '1', name: 'Metformina 850mg', frequency: 'Cada 12 horas', nextDose: '20:00', takenToday: false },
    { id: '2', name: 'Losartán 50mg', frequency: 'Cada 24 horas', nextDose: '08:00', takenToday: true }
  ],
  markMedicationTaken: (id) => set((state) => ({
    medications: state.medications.map(med => 
      med.id === id ? { ...med, takenToday: true } : med
    )
  })),
  addMedication: (newMed) => set((state) => ({
    medications: [...state.medications, newMed]
  })),

  // Estado del Perfil Médico
  userProfile: {
    name: 'Papá',
    age: '',
    weight: '',
    bloodType: '',
    diabetesType: 'Tipo 2',
    allergies: '',
    emergencyContact: ''
  },
  updateUserProfile: (newData) => set((state) => ({
    userProfile: { ...state.userProfile, ...newData }
  })),

  // Estado de la Dieta (Personalizable)
  dietMeals: [
    {
      id: '1',
      title: '🌅 Desayuno',
      time: '08:00 AM',
      description: '• Avena cocida con manzana y canela.\n• Té verde sin azúcar.\n• 1 huevo cocido.',
    },
    {
      id: '2',
      title: '☀️ Comida',
      time: '02:00 PM',
      description: '• Pechuga de pollo a la plancha (150g).\n• Ensalada mixta (lechuga, tomate, pepino).\n• 1/2 taza de arroz integral.',
    },
    {
      id: '3',
      title: '🌙 Cena',
      time: '08:00 PM',
      description: '• Salmón al horno o atún en agua.\n• Espárragos salteados.\n• Infusión relajante (manzanilla).',
    }
  ],
  addDietMeal: (newMeal) => set((state) => ({
    dietMeals: [...state.dietMeals, newMeal]
  })),
  removeDietMeal: (id) => set((state) => ({
    dietMeals: state.dietMeals.filter((meal) => meal.id !== id)
  }))
}));
