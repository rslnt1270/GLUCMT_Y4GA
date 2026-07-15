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
}));
