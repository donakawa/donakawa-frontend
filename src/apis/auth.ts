import type { AxiosResponse } from 'axios';
import { instance } from './axios';

interface CommonResponse<T> {
  resultType: string;
  error: { errorCode: string; reason: string } | null;
  data: T;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  id: string;
  email: string;
  nickname: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
  goal: string;
}

interface UserResponse {
  id: string;
  email: string;
  nickname: string;
  goal: string;
  hasPassword: boolean;
  providers: string[];
}

// 비밀번호 재설정 요청 타입
interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

// --- [API 함수] ---

//  API 응답을 검사해서 FAILED면 에러를 던지는 함수
const handleResponse = <T>(response: AxiosResponse<CommonResponse<T>>): T => {
  if (response.data.resultType === 'FAILED') {
    throw { response };
  }
  return response.data.data;
};

// 1. 로그인
export const login = async (data: LoginRequest) => {
  const response = await instance.post<CommonResponse<LoginResponse>>('/auth/login', data);
  return handleResponse(response);
};

// 2. 이메일 인증번호 발송 (type 매개변수 추가, 기본값은 'REGISTER')
export const sendAuthCode = async (email: string, type: 'REGISTER' | 'RESET_PASSWORD' = 'REGISTER') => {
  const response = await instance.post<CommonResponse<null>>('/auth/email/send-code', { email, type });
  return handleResponse(response);
};

// 3. 이메일 인증번호 검증 (type 매개변수 추가, 기본값은 'REGISTER')
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
  const response = await instance.get<CommonResponse<{ isAvailable: boolean }>>(`/auth/nickname/duplicate?nickname=${encodedNickname}`);
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