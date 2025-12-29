import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const Tab = createMaterialTopTabNavigator();

const LoginScreen = () => {
  return (
    <View style={styles.container}>
      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold' },
          tabBarIndicatorStyle: { backgroundColor: '#6200ee' },
        }}
      >
        <Tab.Screen name="Login" component={LoginForm} options={{ title: 'Logowanie' }} />
        <Tab.Screen name="Register" component={RegisterForm} options={{ title: 'Rejestracja' }} />
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});

export default LoginScreen;
