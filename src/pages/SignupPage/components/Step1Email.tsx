import React, { useState, useRef, useEffect } from 'react';
import { IoCheckmark } from 'react-icons/io5';
import { sendAuthCode, verifyAuthCode } from '../../../apis/auth';
import { AxiosError } from 'axios';

// 백엔드 에러 타입 정의
interface ErrorResponse {
  error: {
    errorCode: string;
    reason: string;
  };
}

interface Props {
  onNext: (email: string) => void;
}

const Step1Email = ({ onNext }: Props) => {
  const [view, setView] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState(['', '', '', '', '', '']);
  const [showModal, setShowModal] = useState(false);

  // 타이머 상태 분리 (입력 유효시간 5분 / 재전송 쿨타임 30초)
  const [inputTimeLeft, setInputTimeLeft] = useState(300); // 5분 (300초)
  const [resendCooldown, setResendCooldown] = useState(30); // 30초
  
  const [timerTrigger, setTimerTrigger] = useState(0);

  // 에러 메시지 상태
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  //  타이머 로직 변경 (두 개의 타이머가 각각 줄어듦)
  useEffect(() => {
    if (view !== 'code') return;

    const timer = setInterval(() => {
      // 1. 입력 유효 시간 감소 (0이 되면 멈춤)
      setInputTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));

      // 2. 재전송 쿨타임 감소 (0이 되면 멈춤)
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [view, timerTrigger]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const isEmailValid = email.includes('@');

  // 1. 인증번호 발송 API 호출
  const handleSendCode = async () => {
    // 에러 초기화
    setEmailError('');
    if (!isEmailValid) return;

    setLoading(true); // 로딩 시작 (버튼 비활성화)
    try {
      // API 호출
      await sendAuthCode(email);
      alert('인증번호가 발송되었습니다.');
      
      //  타이머 초기화 (입력 5분, 재전송 30초)
      setInputTimeLeft(300);
      setResendCooldown(30);
      setTimerTrigger(prev => prev + 1);
      setView('code');
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      console.error('메일 발송 실패:', err);

      const errorCode = err.response?.data?.error?.errorCode;
      const errorReason = err.response?.data?.error?.reason;

      //  에러 코드 분기 처리
      if (errorCode === 'U003') {
        // 이미 가입된 계정 -> 입력창 아래 에러 표시
        setEmailError('이미 가입된 이메일입니다. 로그인을 진행해주세요.');
      } else if (errorCode === 'A010') {
        // 횟수 초과 -> 알림창
        alert('인증 요청 횟수를 초과했습니다. 30분 후 다시 시도해주세요.');
      } else {
        alert(errorReason || '인증번호 발송에 실패했습니다.');
      }
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  // 2. 재전송 핸들러
  const handleResend = async () => {
    // 에러 초기화
    setCodeError('');
    setLoading(true); // 재전송 중 로딩 처리
    try {
      await sendAuthCode(email);
      alert('인증번호가 재전송되었습니다.');
      
      //  재전송 시 타이머 리셋 (입력 5분, 재전송 30초)
      setInputTimeLeft(300);
      setResendCooldown(30);
      
      setAuthCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setTimerTrigger((prev) => prev + 1);
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      console.error('재전송 실패:', err);

      const errorCode = err.response?.data?.error?.errorCode;
      if (errorCode === 'A010') {
         alert('인증 요청 횟수를 초과했습니다. 30분 후 다시 시도해주세요.');
      } else {
        alert('인증번호 재전송에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    setCodeError(''); 
    //  시간이 만료되면 입력 불가 처리
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

  const isCodeValid = authCode.every((num) => num !== '');

  // 3. 인증번호 확인 API 호출
  const handleVerify = async () => {
    setCodeError(''); 
    //  입력 시간(5분) 만료 체크
    if (inputTimeLeft === 0) {
        alert('입력 시간이 만료되었습니다. 재전송 버튼을 눌러주세요.');
        return;
    }

    setLoading(true); // 확인 중 로딩 처리
    try {
      const codeString = authCode.join('');
      await verifyAuthCode(email, codeString);
      setShowModal(true);
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      console.error('인증 실패:', err);

      const errorCode = err.response?.data?.error?.errorCode;

      //  인증 실패 에러 처리
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
    onNext(email);
  };

  return (
    <div className="w-full max-w-sm animate-fade-in">
      {/* 1. 타이틀 영역 */}
      <div className="mb-10">
        <span className="text-xs text-[#999999]">회원가입 STEP 1</span>
        <h2 className="mt-2 text-2xl font-bold text-gray-900 leading-tight whitespace-pre-wrap">
          {view === 'email' ? '이메일 아이디를 입력해주세요.' : '인증번호를 입력해 주세요.'}
        </h2>
      </div>

      {/* 2. 입력 폼 영역 */}
      <div className="space-y-4">
        {view === 'email' ? (
          /* --- 이메일 입력 화면 --- */
          <>
            <div>
              <input
                type="email"
                placeholder="이메일 아이디"
                aria-label="이메일"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                className={`w-full rounded-xl border px-4 py-4 text-sm outline-none transition-all
                  ${emailError 
                    ? 'border-red-500 bg-red-50 focus:border-red-500' 
                    : isEmailValid 
                      ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' 
                      : 'border-gray-200 focus:border-primary-600'
                  }`}
              />
              {emailError && (
                <p className="mt-1 ml-1 text-xs text-red-500 animate-fade-in">
                  {emailError}
                </p>
              )}
            </div>

            <button
              onClick={handleSendCode}
              disabled={!isEmailValid || loading} // loading 상태일 때 비활성화
              className={`w-full rounded-xl py-4 text-sm font-bold text-white transition-colors ${
                isEmailValid && !loading ? 'bg-primary-600 hover:bg-primary-500' : 'bg-gray-200'
              }`}>
              {loading ? '인증번호 전송 중...' : '인증번호 발송'}
            </button>
          </>
        ) : (
          /* --- 인증번호 입력 화면 --- */
          <>
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
                    // 입력 시간(5분)이 끝나면 비활성화
                    disabled={inputTimeLeft === 0}
                    className={`h-14 w-12 rounded-lg border text-center text-xl font-bold outline-none transition-all shadow-sm
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

              {/* 우측 하단 타이머 표시 (입력 유효 시간 5분 표시) */}
              <div className="text-right">
                <span className={`text-sm font-medium ${inputTimeLeft <= 60 ? 'text-red-500' : 'text-primary-brown-300'}`}>
                  {/*  inputTimeLeft를 표시 */}
                  {inputTimeLeft > 0 ? formatTime(inputTimeLeft) : '00:00'}
                </span>
              </div>
              
              {codeError && (
                 <p className="mb-2 text-center text-xs text-red-500 animate-fade-in">
                   {codeError}
                 </p>
              )}
            </div>

            {/* 가운데 안내 텍스트 영역 (재전송 관련) */}
            <div className="text-center py-4">
                {/* 재전송 쿨타임(30초)에 따른 분기 처리 */}
                {resendCooldown > 0 ? (
                    <p className="text-sm text-gray-500 font-medium">
                        {/* 쿨타임 중일 때 */}
                        {resendCooldown}초 후 재전송 가능
                    </p>
                ) : (
                    <button 
                        onClick={handleResend}
                        disabled={loading}
                        className="text-sm text-blue-500 font-bold underline underline-offset-4 hover:text-blue-600 transition-colors disabled:text-gray-400"
                    >
                        {loading ? '인증번호 재전송 중...' : '인증번호 재전송'}
                    </button>
                )}
            </div>

            <button
              onClick={handleVerify}
              //  입력 시간이 만료되면 버튼 비활성화
              disabled={inputTimeLeft === 0 || !isCodeValid}
              className={`w-full rounded-xl py-4 text-sm font-bold text-white transition-colors ${
                (inputTimeLeft > 0 && isCodeValid && !loading)
                  ? 'bg-primary-600 hover:bg-primary-500'
                  : 'bg-gray-200 cursor-not-allowed'
              }`}
            >
              {loading ? '확인 중...' : '확인'}
            </button>
          </>
        )}
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="flex w-full max-w-[300px] flex-col items-center rounded-2xl bg-white p-8 text-center shadow-2xl animate-pop-up">
            <div className="mb-4 text-5xl text-primary-brown-300">
              <IoCheckmark />
            </div>
            <h3 className="mb-8 text-lg font-bold text-gray-900">
              인증이 완료되었습니다.
            </h3>
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

export default Step1Email;