import Axios, { AxiosInstance, type AxiosRequestConfig } from "axios";
import { signOut } from "../store/auth/action";
import store from "../store/store";
import { navigateToMain } from "../utils/navigation";
import storage from "../utils/storage";
import { createQueryClient } from "./react-query";

const BASE_URL = "https://quickwagon.com/";

export const axios: AxiosInstance = Axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

const authRequestInterceptor: any = async (config: AxiosRequestConfig) => {
  const token = await storage.getToken();
  const newConfig = { ...config };
  if (!newConfig.headers) {
    newConfig.headers = {};
  }
  if (token) {
    newConfig.headers.Authorization = `${token}`;
  }
  newConfig.headers.accept = "application/json";
  return newConfig;
};

axios.interceptors.request.use(authRequestInterceptor);

axios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const status = error.response?.status || 500;

    if (status === 401) {
      // Clear query cache
      createQueryClient().clear();
      
      // Clear token from storage
      await storage.clearToken();
      
      // Sign out user from Redux store
      store.dispatch(signOut());
      
      // Navigate to main screen
      navigateToMain();
    }

    return Promise.reject(error);
  }
);
