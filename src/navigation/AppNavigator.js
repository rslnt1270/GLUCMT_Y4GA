import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from '../screens/DashboardScreen';
import InsulinLogScreen from '../screens/InsulinLogScreen';
import MedicationScreen from '../screens/MedicationScreen';
import HistoryScreen from '../screens/HistoryScreen';
import BluetoothScreen from '../screens/BluetoothScreen';
import DietScreen from '../screens/DietScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack para el Home que contiene el Dashboard y el Registro de Insulina
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTintColor: '#0575E6',
        headerTitleStyle: { 
          fontWeight: '900', 
          fontSize: 22, 
          letterSpacing: 1,
        },
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerShadowVisible: false,
        // Transición consistente en todo el stack: deslizamiento nativo desde la derecha
        animation: 'slide_from_right',
        animationDuration: 280,
        // Congela la pantalla anterior mientras no es visible (fluidez y menos trabajo de render)
        freezeOnBlur: true,
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="InsulinLog" component={InsulinLogScreen} options={{ title: 'Registrar Dosis', headerTintColor: '#0575E6', headerTitleStyle: { fontWeight: '900' } }} />
      <Stack.Screen name="Medications" component={MedicationScreen} options={{ title: 'Mis Medicamentos', headerTintColor: '#0575E6', headerTitleStyle: { fontWeight: '900' } }} />
    </Stack.Navigator>
  );
}

// Funciones auxiliares para renderizar iconos nativos limpios
const renderTabIcon = (emoji) => <Text style={{ fontSize: 24, marginTop: 4 }}>{emoji}</Text>;

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          // Transición sutil al cambiar de pestaña (soportado por bottom-tabs v7)
          animation: 'shift',
          tabBarActiveTintColor: '#0575E6',
          tabBarInactiveTintColor: '#94A3B8',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#F1F5F9',
            elevation: 0, 
            height: 65,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 0.5,
            marginTop: 4,
          }
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeStack} 
          options={{ 
            tabBarLabel: 'Inicio',
            tabBarIcon: () => renderTabIcon('🏠')
          }} 
        />
        <Tab.Screen 
          name="DietTab" 
          component={DietScreen} 
          options={{ 
            tabBarLabel: 'Dieta',
            tabBarIcon: () => renderTabIcon('🍏')
          }} 
        />
        <Tab.Screen 
          name="HistoryTab" 
          component={HistoryScreen} 
          options={{ 
            tabBarLabel: 'Historial',
            tabBarIcon: () => renderTabIcon('🗓️')
          }} 
        />
        <Tab.Screen 
          name="BluetoothTab" 
          component={BluetoothScreen} 
          options={{ 
            tabBarLabel: 'Dispositivos',
            tabBarIcon: () => renderTabIcon('📡')
          }} 
        />
        <Tab.Screen 
          name="ProfileTab" 
          component={ProfileScreen} 
          options={{ 
            tabBarLabel: 'Perfil',
            tabBarIcon: () => renderTabIcon('👤')
          }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
