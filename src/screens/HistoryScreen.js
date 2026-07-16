import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useAppStore } from '../utils/store';

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
  const [selectedDate, setSelectedDate] = useState('');
  
  const lastGlucose = useAppStore((state) => state.lastGlucoseReading);
  const lastBP = useAppStore((state) => state.lastBloodPressure);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <View style={styles.header}>
          <Text style={styles.title}>Historial Médico</Text>
          <Text style={styles.subtitle}>Selecciona un día para ver tus registros</Text>
        </View>

        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
            }}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: '#0575E6', selectedTextColor: '#FFFFFF' },
            }}
            theme={{
              backgroundColor: '#FFFFFF',
              calendarBackground: '#FFFFFF',
              textSectionTitleColor: '#64748B',
              selectedDayBackgroundColor: '#0575E6',
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: '#0575E6',
              dayTextColor: '#0F2027',
              textDisabledColor: '#CBD5E0',
              dotColor: '#0575E6',
              selectedDotColor: '#FFFFFF',
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
              
              <View style={styles.historyItem}>
                <View style={styles.historyIconContainer}>
                  <Text style={styles.historyIcon}>🩸</Text>
                </View>
                <View style={styles.historyTextContainer}>
                  <Text style={styles.historyItemTitle}>Presión Arterial</Text>
                  <Text style={styles.historyItemTime}>08:30 AM</Text>
                </View>
                <Text style={styles.historyItemValue}>{lastBP ? `${lastBP.sys}/${lastBP.dia}` : '130/80'}</Text>
              </View>

              <View style={styles.historyItem}>
                <View style={styles.historyIconContainer}>
                  <Text style={styles.historyIcon}>💧</Text>
                </View>
                <View style={styles.historyTextContainer}>
                  <Text style={styles.historyItemTitle}>Glucosa</Text>
                  <Text style={styles.historyItemTime}>09:00 AM</Text>
                </View>
                <Text style={styles.historyItemValue}>{lastGlucose || '95'} mg/dL</Text>
              </View>
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
  }
});
