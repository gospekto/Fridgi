import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
  const { handleRegister } = useAuth();

  const showSnackbar = (msg) => setSnackbar({ visible: true, message: msg });

  const handleRegisterSubmit = async () => {
    if (password !== repeatPassword)
      return showSnackbar("Hasła nie są takie same!");

    try {
      setLoading(true);

      const res = await handleRegister({ email, password, name });

      showSnackbar("Utworzono konto 🎉");

    } catch (error) {
      showSnackbar(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Utwórz konto</Text>

      <TextInput
        label="Nazwa użytkownika"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        label="Hasło"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        label="Powtórz hasło"
        value={repeatPassword}
        onChangeText={setRepeatPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button
        mode="contained"
        loading={loading}
        disabled={loading}
        onPress={handleRegisterSubmit}
      >
        Zarejestruj
      </Button>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar({ visible: false, message: '' })}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: 'center' },
  input: { marginBottom: 12 },
  title: { textAlign: 'center', marginBottom: 20 },
});

export default RegisterForm;
