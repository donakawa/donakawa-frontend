import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

// 1. Axios 인스턴스 생성
export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

//  재발급 진행 중인지 체크하는 플래그
let isRefreshing = false;

//  재발급을 기다리는 요청들을 담아둘 대기열 (큐)
let refreshSubscribers: ((success: boolean) => void)[] = [];

// 대기열에 있는 요청들을 처리하는 함수
const onRefreshed = (success: boolean) => {
  refreshSubscribers.forEach((callback) => callback(success));
  refreshSubscribers = []; // 처리 후 초기화
};

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
      
      //  이미 재발급이 진행 중이면 -> 대기열에 넣고 기다림
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((success: boolean) => {
            if (success) {
              // 재발급 성공 시 원래 요청 재시도
              resolve(instance(originalRequest));
            } else {
              // 재발급 실패 시 에러 리턴
              reject(error);
            }
          });
        });
      }

      // 아무도 재발급 안 하고 있다면 -> 내가 대표로 재발급 시작
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // A. 토큰 재발급 요청 (대표자 1명만 실행)
        await instance.post('/auth/refresh');

        // B. 성공했음을 대기열에 알림
        isRefreshing = false;
        onRefreshed(true); // "얘들아 키 받아왔다! 출발해!"

        // C. 원래 요청 재시도
        return instance(originalRequest);
      } catch (refreshError) {
        // D. 실패 처리
        isRefreshing = false;
        onRefreshed(false); // "실패했다... 다들 해산(에러 처리)해."

        console.error('토큰 재발급 실패:', refreshError);
        alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
