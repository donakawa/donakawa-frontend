import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import type { HeaderControlContext } from '@/layouts/ProtectedLayout';
import type { PasswordStep } from '@/types/MyPage/mypage';

import EyeOpen from '@/assets/visible_eye.svg';
import EyeClosed from '@/assets/invisible_eye.svg';

import StepCurrentPassword from '@/pages/MyPage/components/Password/steps/StepCurrentPassword';
import StepNewPassword from '@/pages/MyPage/components/Password/steps/StepNewPassword';

import { getAuthMe, patchPassword, verifyCurrentPassword } from '@/apis/MyPage/auth';

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
    default:
      return fallback;
  }
}

function getUnknownErrorMessage(e: unknown, fallback: string) {
  if (e instanceof Error) return e.message || fallback;
  return fallback;
}

export default function Password() {
  const { setTitle, setCustomBack } = useOutletContext<HeaderControlContext>();
  const navigate = useNavigate();

  const [step, setStep] = useState<PasswordStep>('currentPassword');
  const [hasPassword, setHasPassword] = useState(true);

  const [currentPw, setCurrentPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);

  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const [checkingCurrent, setCheckingCurrent] = useState(false);
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await getAuthMe();
        if (!alive) return;

        if (res.resultType === 'SUCCESS') {
          setHasPassword(res.data.hasPassword);
          setStep(res.data.hasPassword ? 'currentPassword' : 'newPassword');
        } else {
          alert(getErrorMessage(res.error.errorCode, res.error.reason || '요청에 실패했습니다.'));
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

  const handleBack = useCallback(() => {
    if (step === 'newPassword' && hasPassword) {
      setStep('currentPassword');
      return;
    }
    navigate(-1);
  }, [step, hasPassword, navigate]);

  useEffect(() => {
    setTitle(hasPassword ? '비밀번호 변경' : '비밀번호 설정');
    setCustomBack(() => handleBack);

    return () => {
      setTitle('');
      setCustomBack(null);
    };
  }, [setTitle, setCustomBack, handleBack, hasPassword]);

  const canSubmitCurrentPw = currentPw.trim().length > 0 && !checkingCurrent;

  const onSubmitCurrentPw = useCallback(async () => {
    if (!canSubmitCurrentPw) return;

    try {
      setCheckingCurrent(true);
      const res = await verifyCurrentPassword({
        password: currentPw,
        type: 'CHANGE_PASSWORD',
      });

      if (res.resultType === 'FAILED') {
        alert(getErrorMessage(res.error.errorCode, res.error.reason || '현재 비밀번호 확인에 실패했습니다.'));
        return;
      }

      setStep('newPassword');
    } catch (e) {
      alert(getUnknownErrorMessage(e, '네트워크 오류로 현재 비밀번호 확인에 실패했습니다.'));
    } finally {
      setCheckingCurrent(false);
    }
  }, [canSubmitCurrentPw, currentPw]);

  const canSubmitPw = isValidPassword(pw) && pw === pw2 && !changing;

  const onSubmitPw = useCallback(async () => {
    if (!canSubmitPw) return;

    try {
      setChanging(true);

      const res = await patchPassword({ newPassword: pw });

      if (res.resultType === 'FAILED') {
        alert(getErrorMessage(res.error.errorCode, res.error.reason || '비밀번호 변경에 실패했습니다.'));
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
