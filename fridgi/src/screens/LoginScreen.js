import React from 'react';
import { SafeAreaView, View, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const Tab = createMaterialTopTabNavigator();

const LoginScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { paddingTop: 24, },
          tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
          tabBarIndicatorStyle: { backgroundColor: '#6200ee' },
        }}
      >
        <Tab.Screen name="Login" component={LoginForm} options={{ title: 'Logowanie' }} />
        <Tab.Screen name="Register" component={RegisterForm} options={{ title: 'Rejestracja' }} />
      </Tab.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});

export default LoginScreen;
