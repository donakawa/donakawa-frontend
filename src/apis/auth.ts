import type { AxiosResponse } from 'axios';
import { instance } from './axios';
import type { Provider } from '@/types/MyPage/mypage';

export interface CommonResponse<T> {
  resultType: 'SUCCESS' | 'FAILED' | string;
  error: { errorCode: string; reason: string } | null;
  data: T;
}

const handleResponse = <T>(response: AxiosResponse<CommonResponse<T>>): T => {
  if (response.data.resultType === 'FAILED') {
    throw { response };
  }
  return response.data.data;
};

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  id: string;
  email: string;
  nickname: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
  goal: string;
}

export interface UserResponse {
  id: string;
  email: string;
  nickname: string;
  goal: string;
  hasPassword: boolean;
  providers: string[];
}

// 비밀번호 재설정 요청 타입
export interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

// 목표 수정 응답 데이터 타입
export interface UpdateGoalResponse {
  id: string;
  goal: string;
  updatedAt: string;
}

export type ResultType = 'SUCCESS' | 'FAILED';

export type ApiErrorPayload = {
  errorCode: string;
  reason: string;
  message?: string;
  data: unknown | null;
};

export type ApiResponse<T> =
  | { resultType: 'SUCCESS'; error: null; data: T }
  | { resultType: 'FAILED'; error: ApiErrorPayload; data: null };

export type MeData = {
  id: string;
  email: string;
  nickname: string;
  goal: string;
  hasPassword: boolean;
  providers: string[];
};

export const pickPrimaryProvider = (providers: string[]): Provider | 'email' => {
  const lower = providers.map((p) => p.toLowerCase());

  if (lower.includes('google')) return 'google' as Provider;
  if (lower.includes('kakao')) return 'kakao' as Provider;
  if (lower.includes('naver')) return 'naver' as Provider;

  return 'email';
};

// 1. 로그인
export const login = async (data: LoginRequest) => {
  const response = await instance.post<CommonResponse<LoginResponse>>('/auth/login', data);
  return handleResponse(response);
};

// 2. 이메일 인증번호 발송
export const sendAuthCode = async (email: string, type: 'REGISTER' | 'RESET_PASSWORD' = 'REGISTER') => {
  const response = await instance.post<CommonResponse<null>>('/auth/email/send-code', { email, type });
  return handleResponse(response);
};

// 3. 이메일 인증번호 검증
export const verifyAuthCode = async (email: string, code: string, type: 'REGISTER' | 'RESET_PASSWORD' = 'REGISTER') => {
  const response = await instance.post<CommonResponse<null>>('/auth/email/verify-code', { email, code, type });
  return handleResponse(response);
};

// 4. 회원가입
export const register = async (data: RegisterRequest) => {
  const response = await instance.post<CommonResponse<null>>('/auth/register', data);
  return handleResponse(response);
};

// 5. 닉네임 중복 확인
export const checkNicknameDuplicate = async (nickname: string) => {
  const encodedNickname = encodeURIComponent(nickname);
  const response = await instance.get<CommonResponse<{ isAvailable: boolean }>>(
    `/auth/nickname/duplicate?nickname=${encodedNickname}`,
  );
  return handleResponse(response);
};

// 6. 비밀번호 재설정
export const resetPassword = async (data: ResetPasswordRequest) => {
  const response = await instance.post<CommonResponse<null>>('/auth/account-recovery/password', data);
  return handleResponse(response);
};

// 7. 내 정보 조회
export const getMe = async () => {
  const response = await instance.get<CommonResponse<UserResponse>>('/auth/me');
  return handleResponse(response);
};

// 8. 목표 수정
export const updateGoal = async (goal: string) => {
  const response = await instance.patch<CommonResponse<UpdateGoalResponse>>('/auth/profile/goal', { newGoal: goal });
  return handleResponse(response);
};

// 닉네임 변경
export type NicknamePatchData = {
  id: string;
  nickname: string;
  updatedAt: string;
};

export type NicknameUiState = 'idle' | 'ok' | 'over' | 'same' | 'dup' | 'auth' | 'server' | 'done';
