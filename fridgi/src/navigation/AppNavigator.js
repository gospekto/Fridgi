import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import BarcodeScanner from '../components/BarcodeScanner';
import ProductAdd from '../screens/ProductAdd';
import ProductDatabaseScreen from '../screens/ProductDatabaseScreen';
import FridgeScreen from '../screens/FridgeScreen';
import ProductSelection from '../components/ProductSelection';
import ShoppingListScreen from '../screens/ShoppingListScreen';

// Screens - będziesz je implementować później
const SettingsScreen = () => null;

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();


// Główny Stack Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="ShoppingList" 
          component={ShoppingListScreen} 
          options={{ title: 'Lista zakupów' }} 
        />
        <Stack.Screen 
          name="Settings" 
          component={SettingsScreen} 
          options={{ title: 'Ustawienia' }} 
        />
        <Stack.Screen 
          name="BarcodeScanner" 
          component={BarcodeScanner} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ProductAdd" 
          component={ProductAdd} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ProductsList" 
          component={FridgeScreen} 
          options={{ title: 'Stan lodówki' }} 
        />
        <Stack.Screen name="ProductDatabase" 
          component={ProductDatabaseScreen} 
        />
        <Stack.Screen name="ProductSelection" 
          component={ProductSelection} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;