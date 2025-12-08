import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  loginUser,
  registerUser,
  refreshAccessToken,
} from "../services/authServices";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveAuthData = async (data) => {
    try {
      await AsyncStorage.setItem("authData", JSON.stringify(data));
    } catch (err) {
      console.error("Błąd zapisu AsyncStorage", err);
    }
  };

  const loadAuthData = async () => {
    try {
      const json = await AsyncStorage.getItem("authData");
      if (json) return JSON.parse(json);
      return null;
    } catch (err) {
      console.error("Błąd odczytu AsyncStorage", err);
      return null;
    }
  };

  const clearAuthData = async () => {
    try {
      await AsyncStorage.removeItem("authData");
    } catch (err) {
      console.error("Błąd czyszczenia AsyncStorage", err);
    }
  };

  const handleLogin = async ({ email, password }) => {
    const res = await loginUser({ email, password });

    const data = {
      user: res.user,
      accessToken: res.accessToken,
      refreshToken: res.refreshToken,
    };

    setUser(res.user);
    setAccessToken(res.accessToken);
    setRefreshToken(res.refreshToken);

    await saveAuthData(data);

    return res;
  };

  const handleRegister = async ({ email, password, name }) => {
    const res = await registerUser({ email, password, name });
    return res;
  };

  const logout = async () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    await clearAuthData();
  };

  const fetchUserFromBackend = async (token) => {
    try {
      const response = await axios.get("http://127.0.0.1:3000/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.user;
    } catch (error) {
      return null;
    }
  };

  const initializeAuth = async () => {
    setLoading(true);

    const data = await loadAuthData();
    if (!data) {
      setLoading(false);
      return;
    }

    const { accessToken, refreshToken, user } = data;

    // najpierw próbujemy backend
    const remoteUser = await fetchUserFromBackend(accessToken);

    if (remoteUser) {
      // token nadal działa
      setUser(remoteUser);
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      setLoading(false);
      return;
    }

    // jeśli accessToken wygasł:
    try {
      const newTokens = await refreshAccessToken();

      const refreshedData = {
        user,
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
      };

      setUser(user);
      setAccessToken(newTokens.accessToken);
      setRefreshToken(newTokens.refreshToken);
      await saveAuthData(refreshedData);
    } catch (err) {
      console.log("Token refresh failed");
      logout();
    }

    setLoading(false);
  };

  useEffect(() => {
    initializeAuth();
  }, []);

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    handleLogin,
    handleRegister,
    logout,
    refreshAccessToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
