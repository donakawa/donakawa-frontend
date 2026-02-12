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
    const isRefreshRequest = originalRequest.url?.includes('/auth/refresh') ?? false;

    /** * [수정 포인트] 인증 관련 API 목록
     * 이 API들은 401 에러가 나더라도 '토큰 재발급'을 시도하지 않고 
     * 로그인 페이지에서 에러 메시지(예: 소셜 로그인 필요)를 보여줘야 합니다.
     */
    const isAuthRequest = 
      originalRequest.url?.includes('/auth/login') || 
      originalRequest.url?.includes('/auth/register') ||
      originalRequest.url?.includes('/auth/email') ||
      originalRequest.url?.includes('/auth/account-recovery') ||
      originalRequest.url?.includes('/auth/google') ||
      originalRequest.url?.includes('/auth/kakao') || 
      originalRequest.url?.includes('/auth/oauth'); 

    // 401 또는 A005 에러가 발생했지만, 로그인/회원가입/리프레시 요청이 아닐 때만 재발급 시도
    if ((status === 401 || errorCode === 'A005') && !isRefreshRequest && !isAuthRequest) {
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
        
        // 실제 리프레시 토큰이 만료된 경우에만 로그아웃 처리
        localStorage.removeItem(LOCAL_STORAGE_KEY.accessToken);
        alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // 로그인 API 등에서 발생한 401 에러는 이 아래로 내려와서 
    // 호출한 컴포넌트(로그인 페이지)에서 catch 문으로 잡을 수 있게 됩니다.
    return Promise.reject(error);
  },
);