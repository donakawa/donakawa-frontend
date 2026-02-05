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

// --- [API 함수] ---

//  API 응답을 검사해서 FAILED면 에러를 던지는 함수
const handleResponse = (response: any) => {
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

// 2. 이메일 인증번호 발송
export const sendAuthCode = async (email: string) => {
  const response = await instance.post<CommonResponse<any>>('/auth/email/send-code', { email, type: 'REGISTER' });
  return handleResponse(response);
};

// 3. 이메일 인증번호 검증
export const verifyAuthCode = async (email: string, code: string) => {
  const response = await instance.post<CommonResponse<any>>('/auth/email/verify-code', { email, code, type: 'REGISTER' });
  return handleResponse(response);
};

// 4. 회원가입
export const register = async (data: RegisterRequest) => {
  const response = await instance.post<CommonResponse<any>>('/auth/register', data);
  return handleResponse(response);
};

// 5. 닉네임 중복 확인
export const checkNicknameDuplicate = async (nickname: string) => {
  const encodedNickname = encodeURIComponent(nickname);
  const response = await instance.get<CommonResponse<boolean>>(`/auth/nickname/duplicate?nickname=${encodedNickname}`);
  return handleResponse(response);
};