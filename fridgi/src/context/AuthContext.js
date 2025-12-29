import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../axios";
import { pullProductsFromBackend, syncProducts } from "../services/productServices/productSyncService";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initData() {
      if(user) {
        console.log("syncing");
        await syncProducts();
        // pullProductsFromBackend();
      }
    }
    
    initData();
  }, [user]);

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
      return json ? JSON.parse(json) : null;
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
    try {
      const res = await api.post("/auth/login", { email, password });

      const data = {
        user: res.data.user,
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      };

      setUser(data.user);
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);

      await saveAuthData(data);

      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Błąd logowania");
    }
  };

  const handleRegister = async ({ email, password, name }) => {
    try {
      const res = await api.post("/auth/register", {
        email,
        password,
        name,
      });

      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || "Błąd rejestracji");
    }
  };

  const logout = async () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    await clearAuthData();
  };

  const fetchUserFromBackend = async () => {
    try {
      const response = await api.get("/auth/me");
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

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);

    const remoteUser = await fetchUserFromBackend();

    if (remoteUser) {
      setUser(remoteUser);
    } else {
      await logout();
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
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
