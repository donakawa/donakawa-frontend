import { instance } from './axios';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
  goal: string;
}

// --- [API 함수] ---

// 1. 로그인
export const login = async (data: LoginRequest) => {
  const response = await instance.post<LoginResponse>('/auth/login', data);
  return response.data;
};

// 2. 이메일 인증번호 발송
export const sendAuthCode = async (email: string) => {
  const response = await instance.post('/auth/email/send-code', { email, type: 'REGISTER' });
  return response.data;
};

// 3. 이메일 인증번호 검증
export const verifyAuthCode = async (email: string, code: string) => {
  const response = await instance.post('/auth/email/verify-code', { email, code, type: 'REGISTER' });
  return response.data;
};

// 4. 회원가입
export const register = async (data: RegisterRequest) => {
  const response = await instance.post('/auth/register', data);
  return response.data;
};

// 5. 닉네임 중복 확인
export const checkNicknameDuplicate = async (nickname: string) => {
  const response = await instance.get(`/auth/nickname/duplicate?nickname=${encodeURIComponent(nickname)}`);
  return response.data;
};