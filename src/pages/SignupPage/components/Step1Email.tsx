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
  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState(['', '', '', '', '', '']);
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(299);
  const [timerTrigger, setTimerTrigger] = useState(0);

  // 에러 메시지 상태
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 타이머 로직
  useEffect(() => {
    if (view !== 'code') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
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

    try {
      // API 호출
      await sendAuthCode(email);
      alert('인증번호가 발송되었습니다.');

      setTimeLeft(299);
      setTimerTrigger((prev) => prev + 1);
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
        alert('인증 요청 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.');
      } else {
        alert(errorReason || '인증번호 발송에 실패했습니다.');
      }
    }
  };

  // 2. 재전송 핸들러
  const handleResend = async () => {
    // 에러 초기화
    setCodeError('');

    try {
      await sendAuthCode(email);
      alert('인증번호가 재전송되었습니다.');

      setTimeLeft(299);
      setAuthCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setTimerTrigger((prev) => prev + 1);
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      console.error('재전송 실패:', err);

      const errorCode = err.response?.data?.error?.errorCode;
      if (errorCode === 'A010') {
        alert('인증 요청 횟수를 초과했습니다. 1시간 후 다시 시도해주세요.');
      } else {
        alert('인증번호 재전송에 실패했습니다.');
      }
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    setCodeError(''); //  입력 시 에러 메시지 초기화
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
    setCodeError(''); // 에러 초기화
    if (timeLeft === 0) return;

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
                //  에러 있으면 빨간 테두리
                className={`w-full rounded-xl border px-4 py-4 text-sm outline-none transition-all
                  ${
                    emailError
                      ? 'border-red-500 bg-red-50 focus:border-red-500' // 에러 상태
                      : isEmailValid
                        ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600'
                        : 'border-gray-200 focus:border-primary-600'
                  }`}
              />
              {/*  이메일 에러 메시지 */}
              {emailError && <p className="mt-1 ml-1 text-xs text-red-500 animate-fade-in">{emailError}</p>}
            </div>

            <button
              onClick={handleSendCode}
              disabled={!isEmailValid}
              className={`w-full rounded-xl py-4 text-sm font-bold text-white transition-colors ${
                isEmailValid ? 'bg-primary-600 hover:bg-primary-500' : 'bg-gray-200'
              }`}>
              인증번호 발송
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
                    disabled={timeLeft === 0}
                    //  에러 있으면 빨간 테두리
                    className={`h-14 w-12 rounded-lg border text-center text-xl font-bold outline-none transition-all shadow-sm
                      ${
                        timeLeft === 0
                          ? 'bg-gray-100 border-gray-200 text-gray-400'
                          : codeError
                            ? 'border-red-500 bg-red-50 focus:border-red-500 text-red-500' // 에러 상태
                            : num
                              ? 'border-primary-brown-300 bg-primary-brown-300 text-white'
                              : 'border-gray-200 bg-gray-50 focus:border-primary-brown-300 focus:bg-white text-gray-900'
                      }`}
                  />
                ))}
              </div>

              {/* 우측 하단 타이머 표시 */}
              <div className="text-right">
                <span className={`text-sm font-medium ${timeLeft <= 10 ? 'text-error' : 'text-primary-brown-300'}`}>
                  {timeLeft > 0 ? formatTime(timeLeft) : '00:00'}
                </span>
              </div>

              {/*  인증번호 에러 메시지 (타이머 아래, 안내문구 위에 배치) */}
              {codeError && <p className="mb-2 text-center text-xs text-red-500 animate-fade-in">{codeError}</p>}
            </div>

            {/* 가운데 안내 텍스트 영역 */}
            <div className="text-center py-4">
              {timeLeft > 0 ? (
                <p className="text-sm text-black font-medium">{formatTime(timeLeft)} 후 재전송 가능</p>
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
              disabled={timeLeft === 0 || !isCodeValid}
              className={`w-full rounded-xl py-4 text-sm font-bold text-white transition-colors ${
                timeLeft > 0 && isCodeValid ? 'bg-primary-600 hover:bg-primary-500' : 'bg-gray-200 cursor-not-allowed'
              }`}>
              확인
            </button>
          </>
        )}
      </div>

      {/*  모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="flex w-full max-w-[300px] flex-col items-center rounded-2xl bg-white p-8 text-center shadow-2xl animate-pop-up">
            <div className="mb-4 text-5xl text-primary-brown-300">
              <IoCheckmark />
            </div>
            <h3 className="mb-8 text-lg font-bold text-gray-900">인증이 완료되었습니다.</h3>
            {/* 부모에게 데이터 전달 */}
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
