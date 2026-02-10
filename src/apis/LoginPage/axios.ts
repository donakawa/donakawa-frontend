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
  // (1) 성공했을 때: 응답 그대로 반환
  (response) => {
    return response;
  },

  // (2) 에러 났을 때: 토큰 만료 처리
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // 에러 응답이 없거나, 이미 재시도한 요청이면 에러 던짐 (무한 루프 방지)
    if (!error.response || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // 백엔드 에러 데이터 추출
    const errorData = error.response.data as { 
      error?: { errorCode: string; reason: string } 
    };

    const status = error.response.status;
    const errorCode = errorData?.error?.errorCode;

    // 오직 "액세스 토큰 만료(A005)" 또는 "인증 실패(401)"일 때만 재발급 시도
    if (status === 401 || errorCode === 'A005') {
      
      originalRequest._retry = true; // "나 재시도 하는 중이야" 표시

      try {
        // A. 토큰 재발급 요청 
        // [참고사항] 쿠키에 저장된 refreshToken이 자동으로 전송됩니다 (withCredentials: true 덕분)
        await instance.post('/auth/refresh');

        // B. 재발급 성공! 
        // [참고사항] 자동 토큰 갱신: 브라우저가 새 쿠키를 받아뒀으니, 원래 요청 다시 시도
        return instance(originalRequest);

      } catch (refreshError) {
        // C. 재발급 실패 상황
        // 1. 리프레시 토큰 없음 (A004)
        // 2. 리프레시 토큰 만료 (U005) - [참고사항] 만료 시 재로그인
        // 3. 세션 만료 (U003) 등
        console.error('토큰 재발급 실패 (세션 만료):', refreshError);
        alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
        
        // 로그인 페이지로 강제 이동
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    // 그 외의 에러는 그냥 던짐
    return Promise.reject(error);
  }
);