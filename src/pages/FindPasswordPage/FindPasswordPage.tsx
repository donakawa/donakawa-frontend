import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoCheckmark, IoEyeOutline, IoEyeOffOutline, IoChevronBack } from 'react-icons/io5';
import { sendAuthCode, verifyAuthCode, resetPassword } from '@/apis/auth';
import type { AxiosError } from 'axios';

// 백엔드 에러 타입
interface ErrorResponse {
  error: {
    errorCode: string;
    reason: string;
  };
}

const FindPasswordPage = () => {
  const navigate = useNavigate();

  // --- 공통 상태 ---
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // --- Step 1 & 2 상태 (이메일 & 인증코드) ---
  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState(['', '', '', '', '', '']);
  
  // 타이머 상태 분리 (입력 유효시간 5분 / 재전송 쿨타임 30초)
  const [inputTimeLeft, setInputTimeLeft] = useState(300); // 5분
  const [resendCooldown, setResendCooldown] = useState(30); // 30초
  
  const [timerTrigger, setTimerTrigger] = useState(0);
  const [showModal, setShowModal] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- Step 3 상태 (비밀번호) ---
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  //  타이머 로직 변경 
  useEffect(() => {
    if (step !== 2) return;
    
    const timer = setInterval(() => {
      // 1. 입력 유효 시간 감소
      setInputTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      // 2. 재전송 쿨타임 감소
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timerTrigger]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  // --- [Step 1] 인증코드 발송 ---
  const handleSendCode = async () => {
    setEmailError('');
    if (!email.includes('@')) return;

    setLoading(true);
    try {
      await sendAuthCode(email, 'RESET_PASSWORD');
      alert('인증번호가 발송되었습니다.');
      
      //  타이머 초기화 (5분 / 30초)
      setInputTimeLeft(300);
      setResendCooldown(30);
      setTimerTrigger((prev) => prev + 1);
      
      setStep(2);
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      const errorCode = err.response?.data?.error?.errorCode;
      const errorReason = err.response?.data?.error?.reason;

      if (errorCode === 'U001') {
        setEmailError('가입되지 않은 이메일입니다.');
      } else {
        alert(errorReason || '인증번호 발송에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- [Step 2] 재전송 ---
  const handleResend = async () => {
    setCodeError('');
    try {
      await sendAuthCode(email, 'RESET_PASSWORD');
      alert('인증번호가 재전송되었습니다.');
      
      //  재전송 시 타이머 리셋 (5분 / 30초)
      setInputTimeLeft(300);
      setResendCooldown(30);
      
      setAuthCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setTimerTrigger((prev) => prev + 1);
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      alert(err.response?.data?.error?.reason || '재전송 실패');
    }
  };

  // --- [Step 2] 코드 입력 ---
  const handleCodeChange = (index: number, value: string) => {
    setCodeError('');
    //  시간 만료 시 입력 불가
    if (inputTimeLeft === 0) return;

    const sanitizedValue = value.replace(/[^0-9]/g, '');
    if (sanitizedValue.length > 1) return;

    const newCode = [...authCode];
    newCode[index] = sanitizedValue;
    setAuthCode(newCode);

    if (sanitizedValue !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && authCode[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // --- [Step 2] 인증 확인 ---
  const handleVerify = async () => {
    setCodeError('');
    //  시간 만료 체크
    if (inputTimeLeft === 0) {
        alert('입력 시간이 만료되었습니다. 재전송 버튼을 눌러주세요.');
        return;
    }

    setLoading(true);
    try {
      const codeString = authCode.join('');
      await verifyAuthCode(email, codeString, 'RESET_PASSWORD');
      setShowModal(true);
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      const errorCode = err.response?.data?.error?.errorCode;
      if (errorCode === 'A002') {
        setCodeError('인증번호가 올바르지 않습니다.');
      } else {
        alert('인증에 실패했습니다. 다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    setStep(3);
  };

  // --- [Step 3] 비밀번호 변경 ---
  const isValidFormat = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,12}$/.test(password);
  const isMatch = password === confirmPassword && password !== '';
  const canSubmitPassword = isValidFormat && isMatch;

  const handleResetPassword = async () => {
    if (!canSubmitPassword) return;
    setLoading(true);
    try {
      await resetPassword({ email, newPassword: password });
      alert('비밀번호가 성공적으로 변경되었습니다.\n로그인 페이지로 이동합니다.');
      navigate('/login', { replace: true });
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      const errorCode = err.response?.data?.error?.errorCode;
      const errorReason = err.response?.data?.error?.reason;

      if (errorCode === 'U007') {
        alert('소셜 로그인 계정은 비밀번호를 재설정할 수 없습니다.');
      } else {
        alert(errorReason || '비밀번호 변경에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 뒤로가기 핸들러
  const handleBack = () => {
    if (step === 1) {
      navigate('/login');
    } else {
      setStep((prev) => (prev - 1) as 1 | 2);
    }
  };

  // 🔥 [수정] 기존 getInputClass 제거하고 Wrapper/Input 분리
  const getWrapperClass = (isValid: boolean, isError: boolean) => {
    const baseClass = "flex items-center w-full h-12 rounded-xl border px-4 bg-white transition-all";
    
    if (isError) return `${baseClass} border-red-500 bg-red-50 focus-within:border-red-500`;
    if (isValid) return `${baseClass} border-primary-600 ring-1 ring-primary-600`;
    return `${baseClass} border-gray-200 focus-within:border-primary-600`;
  };

  // 🔥 [수정] text-gray-900 강제 적용, 투명 배경
  const inputInternalClass = "flex-1 w-full h-full bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400 p-0 m-0 min-w-0 appearance-none";

  // --- 렌더링 ---
  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-6 pt-4">
      <div className="w-full max-w-sm">
        {/* 1. 상단 뒤로가기 버튼 */}
        <div className="mb-6 flex items-center justify-start h-12">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 text-gray-900 transition-colors hover:text-gray-600"
            aria-label="뒤로가기">
            <IoChevronBack size={24} />
          </button>
        </div>

        {/* 2. 단계별 프로그래스 바 */}
        <div className="mb-8 flex w-full gap-2">
          <div className={`h-[4px] flex-1 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-primary-600' : 'bg-gray-200'}`} />
          <div className={`h-[4px] flex-1 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
          <div className={`h-[4px] flex-1 rounded-full transition-colors duration-300 ${step >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`} />
        </div>

        {/* 3. STEP 텍스트 & 타이틀 */}
        <div className="mb-10 animate-fade-in">
          <span className="text-xs text-[#999999]">비밀번호 재설정 STEP {step}</span>
          <h2 className="mt-2 text-2xl font-bold text-gray-900 leading-tight whitespace-pre-wrap">
            {step === 1 && '가입한 이메일을 입력해 주세요.'}
            {step === 2 && '인증번호를 입력해 주세요.'}
            {step === 3 && '새로운 비밀번호를 설정해 주세요.'}
          </h2>
        </div>

        {/* --- [화면 1] 이메일 입력 --- */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              {/* Wrapper 적용 */}
              <div className={getWrapperClass(email.includes('@'), !!emailError)}>
                <input
                  type="email"
                  placeholder="이메일 아이디"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  className={inputInternalClass}
                />
              </div>
              {emailError && <p className="mt-1 ml-1 text-xs text-red-500 animate-fade-in">{emailError}</p>}
            </div>

            <button
              onClick={handleSendCode}
              disabled={!email.includes('@') || loading}
              className={`w-full rounded-xl py-4 text-sm font-bold text-white transition-colors ${
                email.includes('@') ? 'bg-primary-600 hover:bg-primary-500' : 'bg-gray-200'
              }`}>
              {loading ? '전송 중...' : '인증번호 발송'}
            </button>
          </div>
        )}

        {/* --- [화면 2] 인증번호 입력 --- */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <div className="flex justify-between gap-2 mb-2">
                {authCode.map((num, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`인증번호 ${idx + 1}자리`}
                    value={num}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    disabled={inputTimeLeft === 0}
                    className={`h-14 w-12 rounded-lg border text-center text-xl font-bold outline-none appearance-none transition-all shadow-sm
                      ${inputTimeLeft === 0
                        ? 'bg-gray-100 border-gray-200 text-gray-400'
                        : codeError
                          ? 'border-red-500 bg-red-50 focus:border-red-500 text-red-500'
                          : num
                            ? 'border-primary-brown-300 bg-primary-brown-300 text-white'
                            : 'border-gray-200 bg-gray-50 focus:border-primary-brown-300 focus:bg-white text-gray-900'
                      }`}
                  />
                ))}
              </div>

              <div className="text-right">
                <span className={`text-sm font-medium ${inputTimeLeft <= 60 ? 'text-red-500' : 'text-primary-brown-300'}`}>
                  {inputTimeLeft > 0 ? formatTime(inputTimeLeft) : '00:00'}
                </span>
              </div>

              {codeError && <p className="mb-2 text-center text-xs text-red-500 animate-fade-in">{codeError}</p>}
            </div>

            <div className="text-center py-4">
              {resendCooldown > 0 ? (
                <p className="text-sm text-gray-500 font-medium">
                  {resendCooldown}초 후 재전송 가능
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-sm text-blue-500 font-bold underline underline-offset-4 hover:text-blue-600 transition-colors">
                  인증번호 재전송
                </button>
              )}
            </div>

            <button
              onClick={handleVerify}
              disabled={inputTimeLeft === 0 || authCode.some(c => c === '') || loading}
              className={`w-full rounded-xl py-4 text-sm font-bold text-white transition-colors ${
                (inputTimeLeft > 0 && !authCode.some(c => c === ''))
                  ? 'bg-primary-600 hover:bg-primary-500'
                  : 'bg-gray-200 cursor-not-allowed'
              }`}>
              {loading ? '확인 중...' : '확인'}
            </button>
          </div>
        )}

        {/* --- [화면 3] 새 비밀번호 입력 --- */}
        {step === 3 && (
          <div className="space-y-2 animate-fade-in">
            {/* 비밀번호 입력 Wrapper */}
            <div className={getWrapperClass(isValidFormat, false)}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputInternalClass}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 표시'}
                aria-pressed={showPw}
                // absolute 제거, 옆에 배치
                className={`ml-2 flex-shrink-0 flex items-center justify-center w-6 h-6 transition-colors ${
                  isValidFormat ? 'text-primary-600' : 'text-gray-400'
                }`}>
                {showPw ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
              </button>
            </div>

            <div className="flex justify-end mb-4">
              <span className={`text-xs transition-colors ${isValidFormat ? 'text-primary-600' : 'text-gray-400'}`}>
                영문과 숫자 조합, 8~12자리
              </span>
            </div>

            {isValidFormat && (
              <div className="relative w-full mt-4 animate-fade-in-up">
                {/* 비밀번호 확인 Wrapper */}
                <div className={getWrapperClass(isMatch, confirmPassword !== '' && !isMatch)}>
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    placeholder="비밀번호 확인"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={inputInternalClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    aria-label={showConfirmPw ? '비밀번호 확인 숨기기' : '비밀번호 확인 표시'}
                    aria-pressed={showConfirmPw}
                    // absolute 제거, 옆에 배치
                    className={`ml-2 flex-shrink-0 flex items-center justify-center w-6 h-6 transition-colors ${
                      isMatch ? 'text-primary-600' : 'text-gray-400'
                    }`}>
                    {showConfirmPw ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
                  </button>
                </div>

                {confirmPassword && !isMatch && (
                  <div className="absolute right-0 top-full mt-1 text-right text-xs text-red-500">비밀번호가 일치하지 않습니다.</div>
                )}
              </div>
            )}

            <button
              onClick={handleResetPassword}
              disabled={!canSubmitPassword || loading}
              className={`mt-10 w-full rounded-xl py-4 text-sm font-bold text-white transition-colors ${
                canSubmitPassword ? 'bg-primary-600 hover:bg-primary-500' : 'bg-gray-200'
              }`}>
              {loading ? '변경 중...' : '비밀번호 변경하기'}
            </button>
          </div>
        )}
      </div>

      {/* --- 인증 완료 모달 --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="flex w-full max-w-[300px] flex-col items-center rounded-2xl bg-white p-8 text-center shadow-2xl animate-pop-up">
            <div className="mb-4 text-5xl text-primary-brown-300">
              <IoCheckmark />
            </div>
            <h3 className="mb-8 text-lg font-bold text-gray-900">인증이 완료되었습니다.</h3>
            <button
              onClick={handleModalConfirm}
              className="w-24 rounded-full bg-primary-brown-300 py-2.5 text-sm font-bold text-white hover:bg-primary-brown-400 transition-colors">
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindPasswordPage;