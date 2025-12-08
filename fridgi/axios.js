import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { refreshAccessToken } from "./authServices";
import * as SecureStore from "expo-secure-store";
  
export const API_BASE_URL = "http://127.0.0.1:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const saved = await AsyncStorage.getItem("authData");

      if (saved) {
        const { accessToken } = JSON.parse(saved);
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
      }
    } catch (error) {
      console.error("Błąd przy pobieraniu tokenu z AsyncStorage", error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }
    
    isRefreshing = true;

    try {
      const refreshData = await refreshAccessToken();

      const newAccessToken = refreshData.accessToken;

      // zapisujemy nowe tokeny
      await AsyncStorage.setItem(
        "authData",
        JSON.stringify({
          accessToken: refreshData.accessToken,
          refreshToken: refreshData.refreshToken,
        })
      );

      processQueue(null, newAccessToken);

      // dodajemy nowy token do requestu i wywołujemy ponownie
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);

      // jeśli refreshToken nie działa → wyloguj
      await AsyncStorage.removeItem("authData");

      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
