import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalDateKey } from '../utils/dates';

const createEmptyPatient = (id, name) => ({
  id,
  name,
  lastGlucoseReading: null,
  glucoseHistory: [],
  lastBloodPressure: null,
  lastInsulinDose: null,
});

export const useAppStore = create(
  persist(
    (set) => ({
      // Soporte Multi-Paciente
      activePatientId: '1',
      patients: {
        '1': createEmptyPatient('1', 'Papá'),
        '2': createEmptyPatient('2', 'Mamá'),
      },

      setActivePatient: (id) => set({ activePatientId: id }),

      addPatient: (name) => set((state) => {
        const newId = Date.now().toString();
        return {
          patients: {
            ...state.patients,
            [newId]: createEmptyPatient(newId, name),
          },
          activePatientId: newId,
        };
      }),

      // Helpers para interactuar con el paciente activo
      setLastGlucoseReading: (reading) => set((state) => ({
        patients: {
          ...state.patients,
          [state.activePatientId]: { ...state.patients[state.activePatientId], lastGlucoseReading: reading }
        }
      })),

      saveCompleteReading: () => set((state) => {
        const activePatient = state.patients[state.activePatientId];

        if (!activePatient.lastGlucoseReading && !activePatient.lastBloodPressure && !activePatient.lastInsulinDose) {
          return state;
        }

        const snapshot = {
          glucose: activePatient.lastGlucoseReading || null,
          bloodPressure: activePatient.lastBloodPressure || null,
          insulin: activePatient.lastInsulinDose || null,
          medicationsTaken: state.medications.filter(m => m.takenToday).map(m => m.name)
        };

        const now = new Date();

        return {
          patients: {
            ...state.patients,
            [state.activePatientId]: {
              ...activePatient,
              glucoseHistory: [
                ...activePatient.glucoseHistory,
                {
                  value: snapshot.glucose || (snapshot.bloodPressure ? `${snapshot.bloodPressure.sys}/${snapshot.bloodPressure.dia}` : '✓'),
                  fullSnapshot: snapshot,
                  date: now.toISOString(),
                  dateKey: getLocalDateKey(now),
                }
              ],
              lastGlucoseReading: null,
              lastBloodPressure: null,
              lastInsulinDose: null
            }
          }
        };
      }),

      clearAllReadings: () => set((state) => ({
        patients: {
          ...state.patients,
          [state.activePatientId]: {
            ...state.patients[state.activePatientId],
            lastGlucoseReading: null,
            lastBloodPressure: null,
            lastInsulinDose: null
          }
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

      // Estado de Bluetooth (es global al teléfono, no por paciente, y no se persiste)
      isGlucometerConnected: false,
      setGlucometerConnected: (status) => set({ isGlucometerConnected: status }),

      // Estado de Medicamentos (global al teléfono; se podría migrar a por-paciente)
      medications: [
        { id: '1', name: 'Metformina 850mg', frequency: 'Cada 12 horas', nextDose: '20:00', takenToday: false },
        { id: '2', name: 'Losartán 50mg', frequency: 'Cada 24 horas', nextDose: '08:00', takenToday: true }
      ],
      // Fecha (local) del último reset diario de 'takenToday'
      lastMedicationResetKey: getLocalDateKey(),
      markMedicationTaken: (id) => set((state) => ({
        medications: state.medications.map(med =>
          med.id === id ? { ...med, takenToday: true } : med
        )
      })),
      addMedication: (newMed) => set((state) => ({
        medications: [...state.medications, newMed]
      })),
      // Si cambió el día, desmarcar todos los medicamentos tomados
      resetMedicationsIfNewDay: () => set((state) => {
        const todayKey = getLocalDateKey();
        if (state.lastMedicationResetKey === todayKey) {
          return state;
        }
        return {
          lastMedicationResetKey: todayKey,
          medications: state.medications.map(med => ({ ...med, takenToday: false })),
        };
      }),

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
    }),
    {
      name: 'glucmt-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // No persistir estado efímero de hardware/sesión
      partialize: (state) => {
        const { isGlucometerConnected, ...persisted } = state;
        return persisted;
      },
    }
  )
);
