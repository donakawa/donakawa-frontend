import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { LOCAL_STORAGE_KEY } from '@/constants/key';

// 1) Axios 인스턴스 생성 (팀원 코드 유지: export const instance)
export const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** =========================
 *  A) Request Interceptor
 *  - 네 코드 장점: Bearer 토큰 자동 첨부
 *  - 토큰 없으면 그냥 패스 (쿠키 기반에도 영향 거의 없음)
 *  ========================= */
instance.interceptors.request.use(
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
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/** =========================
 *  B) Response Interceptor
 *  - 팀원 코드 장점: refresh 큐 + 401/A005 처리
 *  ========================= */

// 재발급 진행 중인지 체크하는 플래그
let isRefreshing = false;

// 재발급 대기열 (큐)
let refreshSubscribers: ((success: boolean) => void)[] = [];

// 대기열에 있는 요청들을 처리하는 함수
const onRefreshed = (success: boolean) => {
  refreshSubscribers.forEach((callback) => callback(success));
  refreshSubscribers = [];
};

instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    // 에러 응답이 없거나, originalRequest가 없거나, 이미 재시도한 요청이면 그대로 reject
    if (!error.response || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 백엔드 에러 데이터 추출 (형태가 달라도 안전하게)
    const errorData = error.response.data as { error?: { errorCode: string; reason: string } } | undefined;

    const status = error.response.status;
    const errorCode = errorData?.error?.errorCode;

    // refresh 요청 자체면 재진입 방지
    const isRefreshRequest = originalRequest.url?.includes('/auth/refresh') ?? false;

    // 401 또는 A005(만료)이며 refresh 요청 자체가 아닐 때만 재발급 시도
    if ((status === 401 || errorCode === 'A005') && !isRefreshRequest) {
      // 이미 누군가 재발급 중이면 큐에 등록 후 대기
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshSubscribers.push((success: boolean) => {
            if (success) resolve(instance(originalRequest));
            else reject(error);
          });
        });
      }

      // 내가 대표로 재발급 시작
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await instance.post('/auth/refresh');

        isRefreshing = false;
        onRefreshed(true);

        // 원래 요청 재시도 (방금 request interceptor가 다시 Authorization도 붙여줌)
        return instance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        onRefreshed(false);

        console.error('토큰 재발급 실패:', refreshError);

        // UX 정책은 팀 스타일에 맞춰: alert/redirect 유지
        alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login';

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
