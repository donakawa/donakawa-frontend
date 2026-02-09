import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// 1. Axios 인스턴스 생성
export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 2. 응답 인터셉터 (Response Interceptor)
instance.interceptors.response.use(
  (response) => response,

  // (2) 에러 났을 때: 토큰 만료 처리
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // 에러 응답이 없거나, 이미 재시도한 요청이면 에러 던짐 (무한 루프 방지)
    if (!error.response || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 백엔드 에러 데이터 추출
    const errorData = error.response.data as {
      error?: { errorCode: string; reason: string };
    };

    const status = error.response.status;
    const errorCode = errorData?.error?.errorCode;

    // 요청 URL이 '/auth/refresh'가 아닐 때만 재발급 시도!
    const isRefreshRequest = originalRequest.url?.includes('/auth/refresh');

    // 401 에러 또는 A005(만료)이면서, 리프레시 요청 자체가 아닐 때만 진입
    if ((status === 401 || errorCode === 'A005') && !isRefreshRequest) {
      
      originalRequest._retry = true;

      try {
        // A. 토큰 재발급 요청
        await instance.post('/auth/refresh');

        // B. 성공 시 원래 요청 다시 시도
        return instance(originalRequest);
      } catch (refreshError) {
        // C. 재발급 실패 시 (리프레시 토큰도 만료됨)
        console.error('토큰 재발급 실패:', refreshError);
        
        // alert가 연속으로 뜨는 것을 방지하기 위해 한 번만 띄우거나, 바로 이동
        alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
        
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    // 리프레시 토큰 요청 자체가 401이 나면 여기서 그냥 에러를 던져서 끝냄 (무한루프 방지)
    return Promise.reject(error);
  },
);
