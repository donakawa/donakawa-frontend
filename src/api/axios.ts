import axios from 'axios';

export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  headers: {
   'Content-Type': 'application/json',
   },
  withCredentials: true,
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);