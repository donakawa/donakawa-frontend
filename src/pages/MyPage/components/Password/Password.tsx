import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import type { HeaderControlContext } from '@/layouts/ProtectedLayout';
import type { PasswordStep } from '@/types/MyPage/mypage';

import VerifiedIcon from '@/assets/verify_check.svg';
import EyeOpen from '@/assets/visible_eye.svg';
import EyeClosed from '@/assets/invisible_eye.svg';

import StepEmail from '@/pages/MyPage/components/Password/steps/StepEmail';
import StepCode from '@/pages/MyPage/components/Password/steps/StepCode';
import StepCurrentPassword from '@/pages/MyPage/components/Password/steps/StepCurrentPassword';
import StepNewPassword from '@/pages/MyPage/components/Password/steps/StepNewPassword';

import { getAuthMe, sendEmailCode, verifyEmailCode, verifyCurrentPassword, patchPassword } from '@/apis/MyPage/auth';

const CODE_LEN = 6;
const TOTAL_SECONDS = 5 * 60;

const EMAIL_CODE_TYPE = 'RESET_PASSWORD' as const;

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

function getErrorMessage(errorCode: string, fallback: string) {
  switch (errorCode) {
    case 'A004':
      return '인증 정보가 없습니다. 다시 로그인해 주세요.';
    case 'A015':
      return '현재 비밀번호 확인이 필요합니다.';
    case 'U001':
      return '존재하지 않는 계정입니다.';
    case 'U012':
      return '현재 비밀번호와 동일한 비밀번호로 변경할 수 없습니다.';
    case 'A008':
      return '비밀번호는 8자 이상, 12자 이하이어야 합니다.';
    case 'A009':
      return '비밀번호는 영문과 숫자를 포함해야 합니다.';
    case 'A010':
      return '인증 요청 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.';
    default:
      return fallback;
  }
}

function getUnknownErrorMessage(e: unknown, fallback: string) {
  if (e instanceof Error) return e.message || fallback;
  return fallback;
}

export default function PasswordFlowPage() {
  const { setTitle, setCustomBack, setLayoutModal } = useOutletContext<HeaderControlContext>();
  const navigate = useNavigate();

  const [step, setStep] = useState<PasswordStep>('email');

  const [email, setEmail] = useState<string>('');
  const [code, setCode] = useState<string>('');

  const [hasPassword, setHasPassword] = useState<boolean>(true);

  const [currentPw, setCurrentPw] = useState<string>('');
  const [showCurrentPw, setShowCurrentPw] = useState<boolean>(false);

  const [pw, setPw] = useState<string>('');
  const [pw2, setPw2] = useState<string>('');
  const [showPw, setShowPw] = useState<boolean>(false);
  const [showPw2, setShowPw2] = useState<boolean>(false);

  const [secondsLeft, setSecondsLeft] = useState<number>(TOTAL_SECONDS);
  const timerRef = useRef<number | null>(null);

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [checkingCurrent, setCheckingCurrent] = useState(false);
  const [changing, setChanging] = useState(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const startTimer = useCallback(() => {
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
  }, [clearTimer]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  const timerText = formatMMSS(secondsLeft);
  const canResend = step === 'code' && secondsLeft === 0;

  const trimmedEmail = email.trim();
  const normalizedCode = code.replace(/\D/g, '').slice(0, CODE_LEN);

  const canSend = trimmedEmail.length > 0 && !sending;
  const canVerify = trimmedEmail.length > 0 && normalizedCode.length === CODE_LEN && !verifying;

  const canSubmitCurrentPw = currentPw.trim().length > 0 && !checkingCurrent;
  const canSubmitPw = isValidPassword(pw) && pw === pw2 && !changing;

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await getAuthMe();
        if (!alive) return;

        if (res.resultType === 'SUCCESS') {
          setHasPassword(res.data.hasPassword);
          setEmail((prev) => (prev.trim().length > 0 ? prev : res.data.email));
        } else {
          const msg = getErrorMessage(res.error.errorCode, res.error.reason || '요청에 실패했습니다.');
          alert(msg);
        }
      } catch (e) {
        if (!alive) return;
        alert(getUnknownErrorMessage(e, '네트워크 오류가 발생했습니다.'));
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const handleStepBack = useCallback(() => {
    if (step === 'code') {
      setStep('email');
      clearTimer();
      setCode('');
      setLayoutModal(null);
      return;
    }
    if (step === 'currentPassword') {
      setStep('code');
      return;
    }
    if (step === 'newPassword') {
      setStep(hasPassword ? 'currentPassword' : 'code');
      return;
    }
    navigate(-1);
  }, [step, hasPassword, clearTimer, navigate, setLayoutModal]);

  useEffect(() => {
    setTitle('비밀번호 변경');

    setCustomBack(() => {
      handleStepBack();
    });

    return () => {
      setTitle('');
      setCustomBack(null);
    };
  }, [setTitle, setCustomBack, handleStepBack]);

  const onSend = useCallback(async () => {
    if (!canSend) return;

    try {
      setSending(true);

      const res = await sendEmailCode({ email: trimmedEmail, type: EMAIL_CODE_TYPE });

      if (res.resultType === 'FAILED') {
        const msg = getErrorMessage(res.error.errorCode, res.error.reason || '인증번호 발송에 실패했습니다.');
        alert(msg);
        return;
      }

      setStep('code');
      setCode('');
      startTimer();
    } catch (e) {
      alert(getUnknownErrorMessage(e, '네트워크 오류로 인증번호 발송에 실패했습니다.'));
    } finally {
      setSending(false);
    }
  }, [canSend, trimmedEmail, startTimer]);

  const onResend = useCallback(async () => {
    if (!canResend || sending) return;

    try {
      setSending(true);

      const res = await sendEmailCode({ email: trimmedEmail, type: EMAIL_CODE_TYPE });

      if (res.resultType === 'FAILED') {
        const msg = getErrorMessage(res.error.errorCode, res.error.reason || '인증번호 재발송에 실패했습니다.');
        alert(msg);
        return;
      }

      setCode('');
      startTimer();
    } catch (e) {
      alert(getUnknownErrorMessage(e, '네트워크 오류로 인증번호 재발송에 실패했습니다.'));
    } finally {
      setSending(false);
    }
  }, [canResend, sending, trimmedEmail, startTimer]);

  const onVerifiedConfirm = useCallback(() => {
    setLayoutModal(null);
    setCurrentPw('');
    setShowCurrentPw(false);

    // 일반이면 currentPassword, 구글이면 newPassword로 바로
    setStep(hasPassword ? 'currentPassword' : 'newPassword');
  }, [hasPassword, setLayoutModal]);

  const onVerify = useCallback(async () => {
    if (!canVerify) return;

    try {
      setVerifying(true);

      const res = await verifyEmailCode({
        email: trimmedEmail,
        code: normalizedCode,
        type: EMAIL_CODE_TYPE,
      });

      if (res.resultType === 'FAILED') {
        const msg = getErrorMessage(res.error.errorCode, res.error.reason || '인증번호 확인에 실패했습니다.');
        alert(msg);
        return;
      }

      setLayoutModal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label="인증 완료"
          onClick={onVerifiedConfirm}
          className="w-full h-full flex items-center justify-center">
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
        </div>,
      );
    } catch (e) {
      alert(getUnknownErrorMessage(e, '네트워크 오류로 인증번호 확인에 실패했습니다.'));
    } finally {
      setVerifying(false);
    }
  }, [canVerify, trimmedEmail, normalizedCode, onVerifiedConfirm, setLayoutModal]);

  const onSubmitCurrentPw = useCallback(async () => {
    if (!canSubmitCurrentPw) return;

    if (!hasPassword) {
      setStep('newPassword');
      return;
    }

    try {
      setCheckingCurrent(true);

      const res = await verifyCurrentPassword({ currentPassword: currentPw });

      if (res.resultType === 'FAILED') {
        const msg = getErrorMessage(res.error.errorCode, res.error.reason || '현재 비밀번호 확인에 실패했습니다.');
        alert(msg);
        return;
      }

      setStep('newPassword');
    } catch (e) {
      alert(getUnknownErrorMessage(e, '네트워크 오류로 현재 비밀번호 확인에 실패했습니다.'));
    } finally {
      setCheckingCurrent(false);
    }
  }, [canSubmitCurrentPw, hasPassword, currentPw]);

  const onSubmitPw = useCallback(async () => {
    if (!canSubmitPw) return;

    try {
      setChanging(true);

      const res = await patchPassword({ newPassword: pw });

      if (res.resultType === 'FAILED') {
        const msg = getErrorMessage(res.error.errorCode, res.error.reason || '비밀번호 변경에 실패했습니다.');
        alert(msg);
        return;
      }

      navigate(-1);
    } catch (e) {
      alert(getUnknownErrorMessage(e, '네트워크 오류로 비밀번호 변경에 실패했습니다.'));
    } finally {
      setChanging(false);
    }
  }, [canSubmitPw, pw, navigate]);

  return (
    <div className="w-full min-h-screen bg-white text-black">
      <main className="pt-[84px] px-4 pb-6 flex flex-col items-center gap-[18px]">
        {step === 'email' && <StepEmail email={email} onChangeEmail={setEmail} onSend={onSend} canSend={canSend} />}

        {step === 'code' && (
          <StepCode
            code={code}
            setCode={(v) => setCode(v.replace(/\D/g, '').slice(0, CODE_LEN))}
            timerText={timerText}
            canResend={canResend && !sending}
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
    </div>
  );
}
