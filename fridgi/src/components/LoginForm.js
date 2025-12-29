import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

const LoginForm = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '' });
    const { handleLogin } = useAuth();

  const showSnackbar = (msg) => setSnackbar({ visible: true, message: msg });

  const handleLoginSubmit = async () => {
    try {
      setLoading(true);

      const data = await handleLogin({ email, password });
      showSnackbar("Zalogowano pomyślnie");

    } catch (error) {
      showSnackbar(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Zaloguj się</Text>

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

      <Button
        mode="contained"
        loading={loading}
        disabled={loading}
        onPress={handleLoginSubmit}
        style={styles.button}
      >
        Zaloguj
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
  button: { marginTop: 10 },
  title: { textAlign: 'center', marginBottom: 20 }
});

export default LoginForm;
