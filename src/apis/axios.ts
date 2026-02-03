// import { LOCAL_STORAGE_KEY } from '@/constants/key';
// import axios from 'axios';

// export const axiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   withCredentials: true,
// });

// axiosInstance.interceptors.request.use(
//   (config) => {
//     const item = localStorage.getItem(LOCAL_STORAGE_KEY.accessToken);
//     const token: string | null = item ? JSON.parse(item) : null;

//     if (token) {
//       config.headers = config.headers ?? {};
//       config.headers.Authorization = `Bearer ${token}`;
//     }

//     return config;
//   },
//   (error) => Promise.reject(error),
// );

import { LOCAL_STORAGE_KEY } from '@/constants/key';
import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const item = localStorage.getItem(LOCAL_STORAGE_KEY.accessToken);

    let token: string | null = null;

    if (item) {
      try {
        const parsed: unknown = JSON.parse(item);
        token = typeof parsed === 'string' ? parsed : null;
      } catch {
        token = item;
      }
    }

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);
