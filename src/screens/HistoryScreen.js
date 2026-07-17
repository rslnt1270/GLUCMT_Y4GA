import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useAppStore } from '../store/store';

// Configurar calendario en español
LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

export default function HistoryScreen() {
  // El calendario se inicializa en el día actual (formato YYYY-MM-DD)
  const todayString = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayString);
  
  const activePatientId = useAppStore((state) => state.activePatientId);
  const activePatient = useAppStore((state) => state.patients[state.activePatientId]);
  
  const glucoseHistory = activePatient.glucoseHistory || [];
  const lastBP = activePatient.lastBloodPressure; // Todavía podemos mostrarlo si fue hoy

  // Crear objeto de markedDates para el calendario basado en glucoseHistory
  const markedDates = useMemo(() => {
    let marks = {};
    glucoseHistory.forEach(record => {
      // Extraemos solo la parte YYYY-MM-DD de la fecha ISO
      const dateKey = record.date.split('T')[0];
      marks[dateKey] = { marked: true, dotColor: '#00F260' };
    });
    // Agregar el día seleccionado actual
    if (marks[selectedDate]) {
      marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: '#0575E6', selectedTextColor: '#FFFFFF' };
    } else {
      marks[selectedDate] = { selected: true, selectedColor: '#0575E6', selectedTextColor: '#FFFFFF' };
    }
    return marks;
  }, [glucoseHistory, selectedDate]);

  // Filtrar las lecturas para el día seleccionado
  const recordsForSelectedDate = useMemo(() => {
    return glucoseHistory.filter(record => record.date.startsWith(selectedDate));
  }, [glucoseHistory, selectedDate]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={styles.header}>
          <Text style={styles.title}>Historial Médico de {activePatient.name}</Text>
          <Text style={styles.subtitle}>Selecciona un día para ver los registros</Text>
        </View>

        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
            }}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#FFFFFF',
              calendarBackground: '#FFFFFF',
              textSectionTitleColor: '#64748B',
              selectedDayBackgroundColor: '#0575E6',
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: '#0575E6',
              dayTextColor: '#0F2027',
              textDisabledColor: '#CBD5E0',
              dotColor: '#00F260',
              selectedDotColor: '#00F260',
              arrowColor: '#0575E6',
              monthTextColor: '#0F2027',
              indicatorColor: '#0575E6',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 20,
              textDayHeaderFontSize: 14
            }}
          />
        </View>

        <ScrollView contentContainerStyle={styles.detailsContainer}>
          {selectedDate ? (
            <View>
              <Text style={styles.dateTitle}>Registros del {selectedDate}</Text>
              
              {/* Iterar sobre el historial de glucosa del día */}
              {recordsForSelectedDate.length > 0 ? (
                recordsForSelectedDate.map((record, index) => {
                  const dateObj = new Date(record.date);
                  const timeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const snap = record.fullSnapshot || { glucose: record.value }; // Retrocompatibilidad
                  
                  return (
                    <View key={`combo-${index}`} style={styles.comboCard}>
                      <View style={styles.comboHeader}>
                        <Text style={styles.comboTime}>{timeString}</Text>
                        <Text style={styles.comboBadge}>Toma Registrada</Text>
                      </View>
                      
                      {snap.glucose && (
                        <View style={styles.historyItem}>
                          <View style={styles.historyIconContainer}><Text style={styles.historyIcon}>💧</Text></View>
                          <View style={styles.historyTextContainer}><Text style={styles.historyItemTitle}>Glucosa</Text></View>
                          <Text style={styles.historyItemValue}>{snap.glucose} mg/dL</Text>
                        </View>
                      )}
                      
                      {snap.bloodPressure && (
                        <View style={styles.historyItem}>
                          <View style={styles.historyIconContainer}><Text style={styles.historyIcon}>🩸</Text></View>
                          <View style={styles.historyTextContainer}><Text style={styles.historyItemTitle}>Presión Arterial</Text></View>
                          <Text style={styles.historyItemValue}>{snap.bloodPressure.sys}/{snap.bloodPressure.dia}</Text>
                        </View>
                      )}

                      {snap.insulin && (
                        <View style={styles.historyItem}>
                          <View style={styles.historyIconContainer}><Text style={styles.historyIcon}>💉</Text></View>
                          <View style={styles.historyTextContainer}><Text style={styles.historyItemTitle}>Insulina Inyectada</Text></View>
                          <Text style={styles.historyItemValue}>{snap.insulin} U</Text>
                        </View>
                      )}

                      {snap.medicationsTaken && snap.medicationsTaken.length > 0 && (
                        <View style={styles.historyItem}>
                          <View style={styles.historyIconContainer}><Text style={styles.historyIcon}>💊</Text></View>
                          <View style={styles.historyTextContainer}>
                            <Text style={styles.historyItemTitle}>Medicamentos</Text>
                            <Text style={styles.historyItemTime}>{snap.medicationsTaken.join(', ')}</Text>
                          </View>
                          <Text style={styles.historyItemValue}>✓</Text>
                        </View>
                      )}
                    </View>
                  );
                })
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay registros guardados para este día.</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Toca un día en el calendario para ver los detalles.</Text>
            </View>
          )}
        </ScrollView>
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
  calendarContainer: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F2027',
    marginBottom: 15,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  historyIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  historyIcon: {
    fontSize: 22,
  },
  historyTextContainer: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F2027',
    marginBottom: 4,
  },
  historyItemTime: {
    fontSize: 13,
    color: '#94A3B8',
  },
  historyItemValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0575E6',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
    textAlign: 'center',
  },
  comboCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  comboHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 10,
  },
  comboTime: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F2027',
  },
  comboBadge: {
    backgroundColor: '#E0F2FE',
    color: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
  }
});
