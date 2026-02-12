import axios, { AxiosHeaders } from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

http.interceptors.request.use((config) => {
  const isForm =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  if (!config.headers) config.headers = new AxiosHeaders();

  const headers = config.headers as AxiosHeaders;

  if (isForm) {
    headers.delete("Content-Type");
    headers.delete("content-type");
  } else {
    headers.set("Content-Type", "application/json");
  }

  return config;
});
