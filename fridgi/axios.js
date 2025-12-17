import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_BASE_URL = "http://backend.ping-serwis.pl/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  async (config) => {
    const saved = await AsyncStorage.getItem("authData");
    if (saved) {
      const { accessToken } = JSON.parse(saved);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
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

const doRefreshToken = async () => {
  const saved = await AsyncStorage.getItem("authData");
  if (!saved) throw new Error("Brak danych auth");

  const { refreshToken, user } = JSON.parse(saved);

  const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
    refreshToken,
  });

  const newAuthData = {
    accessToken: res.data.accessToken,
    refreshToken: res.data.refreshToken,
    user,
  };

  await AsyncStorage.setItem("authData", JSON.stringify(newAuthData));
  return newAuthData;
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (originalRequest?.url?.includes("/auth/refresh")) {
      await AsyncStorage.removeItem("authData");
      return Promise.reject(error);
    }

    if (![403, 401].includes(error.response?.status) || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

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
      const newData = await doRefreshToken();
      const newAccessToken = newData.accessToken;

      processQueue(null, newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      await AsyncStorage.removeItem("authData");
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
