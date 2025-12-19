import Axios, { AxiosInstance, type AxiosRequestConfig } from "axios";
import { createQueryClient } from "./react-query";
import store from "../store/store";

const BASE_URL = "https://716cddbcadef.ngrok-free.app";

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
  const state = store.getState();
  const token = state.auth.userToken;

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
  (error) => {
    const status = error.response?.status || 500;

    if (status === 401) {
      createQueryClient().clear();
      console.log("401 Unauthorized - Token may be invalid or expired");
    }

    return Promise.reject(error);
  }
);
