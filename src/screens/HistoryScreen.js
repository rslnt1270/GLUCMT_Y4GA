import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useAppStore } from '../store/store';
import { exportReport } from '../services/reportGenerator';
import { getLocalDateKey, recordDateKey } from '../utils/dates';
import FadeSlideIn from '../components/FadeSlideIn';
import PressableScale from '../components/PressableScale';

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
  // El calendario se inicializa en el día actual LOCAL (formato YYYY-MM-DD)
  const todayString = getLocalDateKey();
  const [selectedDate, setSelectedDate] = useState(todayString);
  
  const activePatientId = useAppStore((state) => state.activePatientId);
  const activePatient = useAppStore((state) => state.patients[state.activePatientId]);
  const userProfile = useAppStore((state) => state.userProfile);

  const glucoseHistory = activePatient.glucoseHistory || [];
  const lastBP = activePatient.lastBloodPressure; // Todavía podemos mostrarlo si fue hoy

  // Estado del exportador de reportes
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportRangeDays, setExportRangeDays] = useState(7);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      const { totalReadings } = await exportReport({
        patient: activePatient,
        profile: userProfile,
        rangeDays: exportRangeDays,
        format,
      });
      setExportModalVisible(false);
      if (totalReadings === 0) {
        Alert.alert('Reporte generado', 'El período seleccionado no tiene tomas registradas; el reporte se generó vacío.');
      }
    } catch (error) {
      console.error('Error al exportar el reporte:', error);
      Alert.alert('Error', 'No se pudo generar el reporte. Inténtalo de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  // Crear objeto de markedDates para el calendario basado en glucoseHistory
  const markedDates = useMemo(() => {
    let marks = {};
    glucoseHistory.forEach(record => {
      marks[recordDateKey(record)] = { marked: true, dotColor: '#00F260' };
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
    return glucoseHistory.filter(record => recordDateKey(record) === selectedDate);
  }, [glucoseHistory, selectedDate]);

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <FadeSlideIn style={styles.header}>
          <Text style={styles.title}>Historial Médico de {activePatient.name}</Text>
          <Text style={styles.subtitle}>Selecciona un día para ver los registros</Text>
          <PressableScale
            style={styles.exportButton}
            activeOpacity={0.85}
            onPress={() => setExportModalVisible(true)}
          >
            <LinearGradient colors={['#0575E6', '#021B79']} style={styles.exportGradient}>
              <Text style={styles.exportButtonText}>📄 Exportar Reporte</Text>
            </LinearGradient>
          </PressableScale>
        </FadeSlideIn>

        {/* Modal de exportación: período + formato */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={exportModalVisible}
          onRequestClose={() => !isExporting && setExportModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Exportar Reporte de {activePatient.name}</Text>

              <Text style={styles.modalLabel}>Período del reporte</Text>
              <View style={styles.rangeRow}>
                <TouchableOpacity
                  style={[styles.rangeButton, exportRangeDays === 7 && styles.rangeButtonActive]}
                  onPress={() => setExportRangeDays(7)}
                  disabled={isExporting}
                >
                  <Text style={[styles.rangeButtonText, exportRangeDays === 7 && styles.rangeButtonTextActive]}>
                    Semanal{'\n'}(7 días)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.rangeButton, exportRangeDays === 30 && styles.rangeButtonActive]}
                  onPress={() => setExportRangeDays(30)}
                  disabled={isExporting}
                >
                  <Text style={[styles.rangeButtonText, exportRangeDays === 30 && styles.rangeButtonTextActive]}>
                    Mensual{'\n'}(30 días)
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Formato</Text>
              {isExporting ? (
                <View style={styles.exportingContainer}>
                  <ActivityIndicator size="large" color="#0575E6" />
                  <Text style={styles.exportingText}>Generando reporte...</Text>
                </View>
              ) : (
                <View style={styles.rangeRow}>
                  <TouchableOpacity style={styles.formatButton} onPress={() => handleExport('pdf')}>
                    <LinearGradient colors={['#FF416C', '#FF4B2B']} style={styles.formatGradient}>
                      <Text style={styles.formatButtonText}>📕 PDF</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.formatButton} onPress={() => handleExport('html')}>
                    <LinearGradient colors={['#8E2DE2', '#4A00E0']} style={styles.formatGradient}>
                      <Text style={styles.formatButtonText}>🌐 HTML</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setExportModalVisible(false)}
                disabled={isExporting}
              >
                <Text style={styles.modalCloseButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <FadeSlideIn delay={120} style={styles.calendarContainer}>
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
        </FadeSlideIn>

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
                    // La key incluye la fecha para que las tarjetas re-animen su entrada al cambiar de día
                    <FadeSlideIn key={`combo-${selectedDate}-${index}`} delay={Math.min(index, 6) * 80} distance={16} style={styles.comboCard}>
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
                    </FadeSlideIn>
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
  },
  exportButton: {
    marginTop: 15,
    borderRadius: 14,
    shadowColor: '#0575E6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  exportGradient: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 15,
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 20,
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F2027',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 10,
    marginBottom: 8,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeButton: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  rangeButtonActive: {
    backgroundColor: '#0575E6',
  },
  rangeButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#64748B',
    textAlign: 'center',
  },
  rangeButtonTextActive: {
    color: '#FFF',
  },
  formatButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
  },
  formatGradient: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  formatButtonText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 16,
  },
  exportingContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  exportingText: {
    marginTop: 8,
    color: '#64748B',
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 15,
    alignItems: 'center',
    marginTop: 5,
  },
  modalCloseButtonText: {
    color: '#FF4B2B',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
