import type { Provider } from '@/types/MyPage/mypage';

export type ResultType = 'SUCCESS' | 'FAILED';

export type ApiErrorPayload = {
  errorCode: string;
  reason: string;
  message?: string;
  data: unknown | null;
};

export type ApiResponse<T> =
  | {
      resultType: 'SUCCESS';
      error: null;
      data: T;
    }
  | {
      resultType: 'FAILED';
      error: ApiErrorPayload;
      data: null;
    };

export type MeData = {
  id: string;
  email: string;
  nickname: string;
  goal: string;
  hasPassword: boolean;
  provider: Provider;
};

export type NicknamePatchData = {
  id: string;
  nickname: string;
  updatedAt: string;
};

export type NicknameUiState = 'idle' | 'ok' | 'over' | 'same' | 'dup' | 'auth' | 'server' | 'done';
