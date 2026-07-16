import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // Estado de Glucosa y Bluetooth
  lastGlucoseReading: null,
  isGlucometerConnected: false,
  setLastGlucoseReading: (reading) => set({ lastGlucoseReading: reading }),
  setGlucometerConnected: (status) => set({ isGlucometerConnected: status }),

  // Estado de Insulina
  lastInsulinDose: null,
  setLastInsulinDose: (dose) => set({ lastInsulinDose: dose }),

  // Estado de Presión Arterial (OMRON)
  lastBloodPressure: null, // ej. { sys: 120, dia: 80 }
  setLastBloodPressure: (bp) => set({ lastBloodPressure: bp }),

  // Estado de Alarmas (Se integrará con expo-notifications)
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
