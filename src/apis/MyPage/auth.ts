import { axiosInstance } from '@/apis/axios';
import type { ApiResponse, MeData } from '@/apis/auth';

export type EmailCodeType = 'REGISTER' | 'RESET_PASSWORD';

// 내 정보 조회
export async function getAuthMe(): Promise<ApiResponse<MeData>> {
  const { data } = await axiosInstance.get<ApiResponse<MeData>>('/auth/me');
  return data;
}

// 인증번호 발송
export async function sendEmailCode(body: { email: string; type?: EmailCodeType }): Promise<ApiResponse<null>> {
  const payload: { email: string; type: EmailCodeType } = {
    email: body.email,
    type: body.type ?? 'RESET_PASSWORD',
  };

  const { data } = await axiosInstance.post<ApiResponse<null>>('/auth/email/send-code', payload);
  return data;
}

// 인증번호 확인
export async function verifyEmailCode(body: {
  email: string;
  code: string;
  type?: EmailCodeType;
}): Promise<ApiResponse<{ token?: string }>> {
  const payload: { email: string; code: string; type: EmailCodeType } = {
    email: body.email,
    code: body.code,
    type: body.type ?? 'RESET_PASSWORD',
  };

  const { data } = await axiosInstance.post<ApiResponse<{ token?: string }>>('/auth/email/verify-code', payload);
  return data;
}

// 현재 비밀번호 확인
export async function verifyCurrentPassword(body: { currentPassword: string }): Promise<ApiResponse<null>> {
  const { data } = await axiosInstance.post<ApiResponse<null>>('/auth/verify-password', body);
  return data;
}

// 비밀번호 변경
export async function patchPassword(body: { newPassword: string }): Promise<ApiResponse<null>> {
  const { data } = await axiosInstance.patch<ApiResponse<null>>('/auth/password', body);
  return data;
}

// 회원 탈퇴
export async function deleteAccount(): Promise<ApiResponse<null>> {
  const { data } = await axiosInstance.delete<ApiResponse<null>>('/auth/account');
  return data;
}
