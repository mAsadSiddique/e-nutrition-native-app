import Axios, { AxiosInstance, type AxiosRequestConfig } from "axios";
import storage from "../../utils/storage";
import { createQueryClient } from "./react-query";

const BASE_URL = "https://3b1490d97465.ngrok-free.app";

export const axios: AxiosInstance = Axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});
const authRequestInterceptor: any = async (config: AxiosRequestConfig) => {
  const token = await storage.getToken();
  console.log('🔑 Token check:', token ? `Present (${token.substring(0, 20)}...)` : 'Missing');
  
  const newConfig = { ...config };
  if (!newConfig.headers) {
    newConfig.headers = {};
  }
  if (token) {
    newConfig.headers.Authorization = `${token}`;
  }
  newConfig.headers.accept = "application/json";
  
  console.log('📡 API Request:', {
    url: `${config.baseURL}${config.url}`,
    method: config.method?.toUpperCase(),
    hasToken: !!token
  });
  
  return newConfig;
};
axios.interceptors.request.use(authRequestInterceptor);
axios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response?.status || 500;
    
    if (status === 401) {
      createQueryClient().clear();
      console.log('401 Unauthorized - Token may be invalid or expired');
    }
    
    return Promise.reject(error);
  }
);