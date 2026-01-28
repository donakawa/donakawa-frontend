import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { PasswordStep, VerifyCheckResult, VerifySendResult, PasswordChangeResult } from '@/types/MyPage/mypage';

import LeftArrow from '@/assets/arrow_left(gray).svg';

import VerifiedIcon from '@/assets/verify_check.svg';
import EyeOpen from '@/assets/visible_eye.svg';
import EyeClosed from '@/assets/invisible_eye.svg';

import StepEmail from '@/pages/MyPage/components/Password/steps/StepEmail';
import StepCode from '@/pages/MyPage/components/Password/steps/StepCode';
import StepCurrentPassword from '@/pages/MyPage/components/Password/steps/StepCurrentPassword';
import StepNewPassword from '@/pages/MyPage/components/Password/steps/StepNewPassword';

const CODE_LEN = 5;
const TOTAL_SECONDS = 5 * 60;

function pad2(n: number) {
  return String(n).padStart(2, '0');
}

function formatMMSS(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${pad2(m)}:${pad2(s)}`;
}

function isValidPassword(pw: string): boolean {
  if (pw.length < 8 || pw.length > 12) return false;
  const hasLetter = /[a-zA-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  return hasLetter && hasNumber;
}

export default function PasswordFlowPage() {
  const navigate = useNavigate();

  const initialEmail = useMemo(() => '', []);

  const [step, setStep] = useState<PasswordStep>('email');
  const [isVerifiedOpen, setIsVerifiedOpen] = useState<boolean>(false);

  const [email, setEmail] = useState<string>(initialEmail);
  const [code, setCode] = useState<string>('');

  const [secondsLeft, setSecondsLeft] = useState<number>(TOTAL_SECONDS);

  const [verifyToken, setVerifyToken] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  const [pw2, setPw2] = useState<string>('');

  const [currentPw, setCurrentPw] = useState<string>('');
  const [showCurrentPw, setShowCurrentPw] = useState<boolean>(false);

  const [showPw, setShowPw] = useState<boolean>(false);
  const [showPw2, setShowPw2] = useState<boolean>(false);

  const timerRef = useRef<number | null>(null);

  const clearTimer = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const startTimer = () => {
    clearTimer();
    setSecondsLeft(TOTAL_SECONDS);
    timerRef.current = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const timerText = formatMMSS(secondsLeft);
  const canResend = step === 'code' && secondsLeft === 0;

  const trimmedEmail = email.trim();
  const canSend = trimmedEmail.length > 0;

  const codeDigitsCount = code.replace(/\D/g, '').slice(0, CODE_LEN).length;
  const canVerify = codeDigitsCount === CODE_LEN;

  const canSubmitPw = isValidPassword(pw) && pw === pw2;
  const canSubmitCurrentPw = currentPw.trim().length > 0;

  const apiSendCode = async (): Promise<VerifySendResult> => {
    return new Promise((resolve) => {
      window.setTimeout(() => resolve({ ok: true }), 400);
    });
  };

  const apiVerifyCode = async (): Promise<VerifyCheckResult> => {
    return new Promise((resolve) => {
      window.setTimeout(() => resolve({ ok: true, token: 'mock-verify-token' }), 450);
    });
  };

  const apiChangePassword = async (): Promise<PasswordChangeResult> => {
    return new Promise((resolve) => {
      window.setTimeout(() => resolve({ ok: true }), 450);
    });
  };

  const onBack = () => {
    if (isVerifiedOpen) {
      setIsVerifiedOpen(false);
      return;
    }

    if (step === 'code') {
      setStep('email');
      clearTimer();
      setCode('');
      return;
    }

    if (step === 'currentPassword') {
      setStep('code');
      return;
    }

    if (step === 'newPassword') {
      setStep('currentPassword');
      return;
    }

    navigate(-1);
  };

  const onSend = async () => {
    if (!canSend) return;
    const res = await apiSendCode();
    if (!res.ok) return;

    setStep('code');
    setCode('');
    startTimer();
  };

  const onResend = async () => {
    if (!canResend) return;
    const res = await apiSendCode();
    if (!res.ok) return;

    setCode('');
    startTimer();
  };

  const onVerify = async () => {
    if (!canVerify) return;

    const res = await apiVerifyCode();
    if (!res.ok) return;

    setVerifyToken(res.token);
    setIsVerifiedOpen(true);
  };

  const onVerifiedConfirm = () => {
    setIsVerifiedOpen(false);

    setCurrentPw('');
    setShowCurrentPw(false);
    setStep('currentPassword');
  };

  const onSubmitCurrentPw = async () => {
    if (!canSubmitCurrentPw) return;
    if (!verifyToken) return;

    setStep('newPassword');
  };

  const onSubmitPw = async () => {
    if (!canSubmitPw) return;
    if (!verifyToken) return;

    const res = await apiChangePassword();
    if (!res.ok) return;

    navigate(-1);
  };

  return (
    <div className="w-full min-h-screen bg-white text-black relative">
      <header className="h-[64px] px-4 pt-[10px] grid grid-cols-[40px_1fr_40px] items-center">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={onBack}
          className="w-10 h-10 grid place-items-center border-0 bg-transparent p-0 cursor-pointer">
          <img src={LeftArrow} alt="" className="w-3 h-[22px] block" />
        </button>

        <h1 className="m-0 text-center text-[20px] font-[600]">비밀번호 변경</h1>

        <div aria-hidden className="w-10 h-10" />
      </header>

      <main className="pt-[84px] px-4 pb-6 flex flex-col items-center gap-[18px]">
        {step === 'email' && <StepEmail email={email} onChangeEmail={setEmail} onSend={onSend} canSend={canSend} />}

        {step === 'code' && (
          <StepCode
            code={code}
            setCode={(v) => setCode(v.replace(/\D/g, '').slice(0, CODE_LEN))}
            timerText={timerText}
            canResend={canResend}
            onResend={onResend}
            onVerify={onVerify}
          />
        )}

        {step === 'currentPassword' && (
          <StepCurrentPassword
            currentPw={currentPw}
            setCurrentPw={setCurrentPw}
            showPw={showCurrentPw}
            toggleShowPw={() => setShowCurrentPw((p) => !p)}
            canSubmit={canSubmitCurrentPw}
            onSubmit={onSubmitCurrentPw}
          />
        )}

        {step === 'newPassword' && (
          <StepNewPassword
            pw={pw}
            pw2={pw2}
            setPw={setPw}
            setPw2={setPw2}
            showPw={showPw}
            showPw2={showPw2}
            toggleShowPw={() => setShowPw((p) => !p)}
            toggleShowPw2={() => setShowPw2((p) => !p)}
            eyeOpenSrc={EyeOpen}
            eyeClosedSrc={EyeClosed}
            canSubmit={canSubmitPw}
            onSubmit={onSubmitPw}
          />
        )}
      </main>

      {isVerifiedOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="인증 완료"
          onClick={onVerifiedConfirm}
          className="absolute inset-0 bg-[rgba(61,43,39,0.8)] z-50 flex items-center justify-center">
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-[335px] bg-white rounded-[20px] px-5 pt-7 pb-6 flex flex-col items-center gap-[18px]">
            <div className="grid place-items-center">
              <img src={VerifiedIcon} alt="" aria-hidden className="w-[98px]" />
            </div>

            <div className="text-center text-[20px] font-[600] mb-[14px]">인증이 완료되었습니다.</div>

            <button
              type="button"
              onClick={onVerifiedConfirm}
              className="px-5 py-2 rounded-[100px] bg-primary-brown-300 text-white text-[16px] font-[500] cursor-pointer border-0">
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
