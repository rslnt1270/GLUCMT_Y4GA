import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from './src/screens/DashboardScreen';
import InsulinLogScreen from './src/screens/InsulinLogScreen';
import BluetoothScreen from './src/screens/BluetoothScreen';
import DietScreen from './src/screens/DietScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack para el Home que contiene el Dashboard y el Registro de Insulina
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0A2540' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Mi Salud' }} />
      <Stack.Screen name="InsulinLog" component={InsulinLogScreen} options={{ title: 'Registrar Dosis' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#A0AEC0',
          tabBarStyle: {
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 14,
            fontWeight: '600',
          }
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeStack} 
          options={{ tabBarLabel: 'Inicio' }} 
        />
        <Tab.Screen 
          name="DietTab" 
          component={DietScreen} 
          options={{ tabBarLabel: 'Dieta' }} 
        />
        <Tab.Screen 
          name="BluetoothTab" 
          component={BluetoothScreen} 
          options={{ tabBarLabel: 'Dispositivos' }} 
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
