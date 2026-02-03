import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import type { HeaderControlContext } from '@/layouts/ProtectedLayout';
import type { WithdrawalUiState } from '@/types/MyPage/withdrawal';

import { LOCAL_STORAGE_KEY } from '@/constants/key';
import { getAuthMe, verifyCurrentPassword, deleteAccount } from '@/apis/MyPage/auth';
import type { ApiResponse } from '@/apis/auth';

import EyeOpen from '@/assets/visible_eye.svg';
import EyeClosed from '@/assets/invisible_eye.svg';
import Seed from '@/assets/seed.svg';

function maskEmail(email: string): string {
  if (email.includes('*')) return email;

  const [name, domain] = email.split('@');
  if (!name || !domain) return email;

  const visible = name.slice(0, 4);
  const masked = `${visible}${'*'.repeat(Math.max(3, name.length - 4))}`;
  return `${masked}@${domain}`;
}

type WithdrawStep = 'idle' | 'verifying' | 'deleting';

function isFailed<T>(res: ApiResponse<T>): res is {
  resultType: 'FAILED';
  error: { errorCode: string; reason: string; message?: string; data: unknown | null };
  data: null;
} {
  return res.resultType === 'FAILED';
}

type ToastKind = 'wrong' | 'locked';

const TOAST_MESSAGE: Record<ToastKind, string> = {
  wrong: '비밀번호를 다시 확인해 주세요.',
  locked: '비밀번호 5회 오류로 인증이 30분간 제한됩니다.',
};

export default function WithdrawalPage() {
  const navigate = useNavigate();
  const { setTitle } = useOutletContext<HeaderControlContext>();

  const [email, setEmail] = useState<string>('');
  const [step, setStep] = useState<WithdrawStep>('idle');

  const [ui, setUi] = useState<WithdrawalUiState>({
    password: '',
    isPasswordVisible: false,
    isModalOpen: false,
  });

  const [toast, setToast] = useState<{ open: boolean; kind: ToastKind }>({ open: false, kind: 'wrong' });
  const toastTimerRef = useRef<number | null>(null);

  const isSubmitting = step !== 'idle';

  const showToast = useCallback((kind: ToastKind) => {
    setToast({ open: true, kind });

    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToast((prev) => ({ ...prev, open: false }));
    }, 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setTitle('회원탈퇴');
    return () => setTitle('');
  }, [setTitle]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const me = await getAuthMe();
        if (!mounted) return;

        if (isFailed(me)) {
          if (me.error.errorCode === 'A004') {
            localStorage.removeItem(LOCAL_STORAGE_KEY.accessToken);
            localStorage.removeItem(LOCAL_STORAGE_KEY.refreshToken);
            navigate('/login', { replace: true });
            return;
          }

          setEmail('');
          return;
        }

        setEmail(me.data.email);
      } catch {
        setEmail('');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  const maskedEmail = useMemo(() => (email ? maskEmail(email) : ''), [email]);

  const isConfirmEnabled = ui.password.trim().length > 0 && !isSubmitting;

  const openModal = () => {
    if (!isConfirmEnabled) return;
    setUi((prev) => ({ ...prev, isModalOpen: true }));
  };

  const closeModal = () => setUi((prev) => ({ ...prev, isModalOpen: false }));

  const togglePasswordVisible = () => setUi((prev) => ({ ...prev, isPasswordVisible: !prev.isPasswordVisible }));

  const onChangePassword = (value: string) => setUi((prev) => ({ ...prev, password: value }));

  const clearAuthAndGoLogin = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY.accessToken);
    localStorage.removeItem(LOCAL_STORAGE_KEY.refreshToken);
    navigate('/login', { replace: true });
  }, [navigate]);

  const pickToastKindFromError = useCallback((errorCode: string, reason?: string) => {
    const r = (reason ?? '').trim();

    const lockedHint = /5회|다섯|30분|삼십|제한|잠금|locked|limit/i.test(r);

    if (lockedHint) return 'locked';

    const wrongHint = /비밀번호|password|불일치|틀렸|다시\s*확인|오류/i.test(r);

    return wrongHint ? 'wrong' : 'wrong';
  }, []);

  const handleWithdraw = useCallback(async () => {
    const password = ui.password.trim();
    if (!password || isSubmitting) return;

    try {
      setStep('verifying');

      const verifyRes = await verifyCurrentPassword({ currentPassword: password });

      if (isFailed(verifyRes)) {
        if (verifyRes.error.errorCode === 'A004') {
          clearAuthAndGoLogin();
          return;
        }

        const kind = pickToastKindFromError(verifyRes.error.errorCode, verifyRes.error.reason);
        showToast(kind);
        return;
      }

      setStep('deleting');

      const delRes = await deleteAccount();

      if (isFailed(delRes)) {
        if (delRes.error.errorCode === 'A004') {
          clearAuthAndGoLogin();
          return;
        }

        if (delRes.error.errorCode === 'A105') {
          showToast('wrong');
          return;
        }

        if (delRes.error.errorCode === 'U001') {
          showToast('wrong');
          return;
        }

        showToast('wrong');
        return;
      }

      clearAuthAndGoLogin();
    } catch {
      alert('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setStep('idle');
    }
  }, [ui.password, isSubmitting, clearAuthAndGoLogin, pickToastKindFromError, showToast]);

  const handleGoogleVerify = async () => {
    alert('구글 재인증 플로우가 확정되면 연결할게요.');
  };

  return (
    <div className="w-full max-w-[375px] mx-auto min-h-[100dvh] bg-white relative">
      <main className="px-5 pt-4 pb-8">
        <div className="flex flex-col gap-[14px]">
          <div className="flex items-center gap-[10px]">
            <img src={Seed} alt="" className="w-[37px] h-12 object-contain shrink-0" />
            <p className="m-0 text-[16px] leading-[1.5] text-gray-600">
              개인정보를 안전하게 보호하기 위해
              <br />
              인증 절차가 필요합니다.
            </p>
          </div>

          <p className="m-0 text-[20px] font-semibold text-black">로그인 계정으로 재인증해 주세요.</p>
        </div>

        <div className="mt-[18px] flex flex-col gap-3">
          <input
            value={maskedEmail}
            readOnly
            disabled
            className="w-full h-12 rounded-[6px] border-2 px-[14px] text-[15px] outline-none text-black bg-white placeholder:text-gray-600 disabled:bg-white disabled:text-gray-600 border-primary-400"
          />

          <div className="relative">
            <input
              type={ui.isPasswordVisible ? 'text' : 'password'}
              value={ui.password}
              onChange={(e) => onChangePassword(e.target.value)}
              placeholder="비밀번호"
              autoComplete="current-password"
              inputMode="text"
              className={`w-full h-12 rounded-[6px] border-2 px-[14px] pr-[46px] text-[15px] outline-none text-black bg-white placeholder:text-gray-600 ${
                ui.password.trim().length > 0 ? 'border-primary-400' : 'border-gray-100'
              }`}
            />

            {ui.password.trim().length > 0 && (
              <button
                type="button"
                onClick={togglePasswordVisible}
                aria-label="비밀번호 표시 전환"
                className="absolute top-1/2 right-[10px] -translate-y-1/2 w-[34px] h-[34px] rounded-[10px] bg-transparent inline-flex items-center justify-center">
                <img src={ui.isPasswordVisible ? EyeOpen : EyeClosed} alt="" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={openModal}
            disabled={!isConfirmEnabled}
            className={`mt-[30px] w-full h-[52px] rounded-[5px] border-0 text-[16px] font-medium text-white ${
              isConfirmEnabled ? 'bg-primary-400 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'
            }`}>
            확인
          </button>

          <div className="my-[18px] grid grid-cols-[1fr_auto_1fr] items-center gap-[10px] text-[12px] text-primary-brown-300">
            <div className="h-px bg-primary-brown-300" />
            <div>다른 방법으로 인증</div>
            <div className="h-px bg-primary-brown-300" />
          </div>

          <button
            type="button"
            onClick={handleGoogleVerify}
            disabled={true}
            className="w-full h-[52px] rounded-[5px] border-0 bg-gray-400 text-white text-[16px] font-medium cursor-not-allowed">
            구글 계정으로 인증
          </button>
        </div>
      </main>

      {ui.isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="회원탈퇴 확인"
          className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(61,43,39,0.8)] px-5">
          <div className="flex h-[253px] w-full max-w-[335px] flex-col justify-end gap-[10px] rounded-[20px] bg-white py-[33px] px-8">
            <h2 className="m-0 text-[20px] font-semibold text-black text-center">정말 탈퇴하시겠습니까?</h2>
            <p className="mt-[10px] mb-[18px] text-[14px] leading-[1.5] text-gray-600 text-center">
              회원탈퇴 시 계정의 모든 정보가 삭제되며,
              <br />
              복구할 수 없습니다.
            </p>

            <div className="grid grid-cols-2 gap-[50px]">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className={`h-11 rounded-[100px] text-[16px] font-medium border-[1.6px] border-primary-brown-300 bg-white text-primary-brown-300 ${
                  isSubmitting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}>
                취소
              </button>
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={isSubmitting}
                className={`h-11 rounded-[100px] text-[16px] font-medium border-0 bg-primary-brown-300 text-white ${
                  isSubmitting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}>
                {step === 'deleting' ? '탈퇴 중…' : '탈퇴'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`pointer-events-none fixed left-1/2 z-[60] w-[calc(100%-40px)] max-w-[420px] -translate-x-1/2 transition-all duration-200 ${
          toast.open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
        style={{ bottom: '20px' }}
        aria-live="polite">
        <div
          className={[
            'mx-auto w-[335px] rounded-[100px] border-[1.5px] border-primary-brown-400 bg-white',
            'flex items-center px-[18px] py-[10px]',
            'text-[12px] font-normal text-black',
            'shadow-[0px_0px_4px_rgba(97,69,64,1)]',
          ].join(' ')}>
          {TOAST_MESSAGE[toast.kind]}
        </div>
      </div>
    </div>
  );
}
