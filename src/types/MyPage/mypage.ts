export type Profile = {
  nickname: string;
  email: string;
  giveupCount: number;
  giveupPrice: number;
};

export type Goal = string;

export type Provider = 'email' | 'google' | 'none';

export type NicknameViewState = 'idle' | 'ok' | 'over' | 'done';

export type PasswordStep = 'email' | 'code' | 'currentPassword' | 'newPassword';

export type VerifySendResult = { ok: true } | { ok: false; message: string };

export type VerifyCheckResult = { ok: true; token: string } | { ok: false; message: string };

export type PasswordChangeResult = { ok: true } | { ok: false; message: string };

export type AimKeyword = {
  id: string;
  label: string;
};
