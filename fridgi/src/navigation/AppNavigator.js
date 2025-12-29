import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useAuth } from '../context/AuthContext';

import DashboardScreen from '../screens/DashboardScreen';
import BarcodeScanner from '../components/BarcodeScanner';
import ProductAdd from '../screens/ProductAdd';
import ProductDatabaseScreen from '../screens/ProductDatabaseScreen';
import FridgeScreen from '../screens/FridgeScreen';
import ProductSelection from '../screens/ProductSelectionScreen';
import ShoppingListScreen from '../screens/ShoppingListScreen';
import LoginScreen from '../screens/LoginScreen';
import ProductReviewScreen from '../screens/ProductReviewScreen';

const SettingsScreen = () => null;

const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

const AuthenticatedStack = () => {
  return (
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
      <Stack.Screen 
        name="ProductDatabase" 
        component={ProductDatabaseScreen} 
      />
      <Stack.Screen 
        name="ProductSelection" 
        component={ProductSelection} 
      />
      <Stack.Screen 
        name="ProductReviewScreen" 
        component={ProductReviewScreen} 
        options={{ title: 'Opinia o produkcie' }}
      />
    </Stack.Navigator>
  );
};

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      {user ? <AuthenticatedStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;