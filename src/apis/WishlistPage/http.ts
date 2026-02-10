import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
          email: "freddyshin@naver.com",
          password: "landy1025"
        }, { withCredentials: true });

        return http(originalRequest);
      } catch (loginErr) {
        return Promise.reject(loginErr);
      }
    }
    return Promise.reject(err);
  }
);