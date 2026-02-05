import React, { useState, useRef, useEffect } from 'react';
import { IoCheckmark } from 'react-icons/io5';
import { sendAuthCode, verifyAuthCode } from '../../../api/auth';
import { AxiosError } from 'axios';

interface Props {
  onNext: (email: string) => void;
}

const Step1Email = ({ onNext }: Props) => {
  const [view, setView] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState(['', '', '', '', '', '']); 
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(299); 
  
  // 타이머를 재시작하기 위한 스위치 (Trigger)
  const [timerTrigger, setTimerTrigger] = useState(0);
  
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
    
    // 'view'가 바뀌거나 'timerTrigger'가 바뀔 때만 타이머를 새로 만듦
    // (timeLeft는 뺐으므로 1초마다 재실행되지 않음!)
  }, [view, timerTrigger]); 

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const isEmailValid = email.includes('@');

  // 1. 인증번호 발송 API 호출
  const handleSendCode = async () => {
    if(!isEmailValid) return;

    try {
      // API 호출
      await sendAuthCode(email);
      alert('인증번호가 발송되었습니다.');
      
      setTimeLeft(299);
      setTimerTrigger(prev => prev + 1);
      setView('code');

    } catch (error) {
      console.error('메일 발송 실패:', error);
      alert('인증번호 발송에 실패했습니다. 이메일을 확인해주세요.');
    }
  };

  // 2. 재전송 핸들러 (API 호출 추가)
  const handleResend = async () => {
    try {
      // API 호출
      await sendAuthCode(email);
      alert('인증번호가 재전송되었습니다.');
      
      setTimeLeft(299);
      setAuthCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();

      setTimerTrigger(prev => prev + 1);

    } catch (error) {
      console.error('재전송 실패:', error);
      alert('인증번호 재전송에 실패했습니다.');
    }
  };

  const handleCodeChange = (index: number, value: string) => {
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
    // 시간이 0이면 동작 안 함 (버튼도 비활성화되지만 방어 코드 추가)
    if (timeLeft === 0) return;

    try {
      const codeString = authCode.join('');
      
      // API 호출
      await verifyAuthCode(email, codeString);
      setShowModal(true);
    } catch (error) {
      const err = error as AxiosError;
      console.error('인증 실패:', err);
      alert('인증번호가 일치하지 않습니다.');
    }
  };

  // 4. 모달 확인 클릭 시 부모에게 이메일 전달
  const handleModalConfirm = () => {
    setShowModal(false);
    // 부모 컴포넌트로 이메일 전달!
    onNext(email);
  };

  return (
    <div className="w-full max-w-sm animate-fade-in">
      
      {/* 1. 타이틀 영역 */}
      <div className="mb-10">
        <span className="text-xs text-[#999999]">회원가입 STEP 1</span>
        <h2 className="mt-2 text-2xl font-bold text-gray-900 leading-tight whitespace-pre-wrap">
          {view === 'email' 
            ? '이메일 아이디를 입력해주세요.' 
            : '인증번호를 입력해 주세요.'}
        </h2>
      </div>

      {/* 2. 입력 폼 영역 */}
      <div className="space-y-4">
        {view === 'email' ? (
          /* --- 이메일 입력 화면 --- */
          <>
            <input
              type="email"
              placeholder="이메일 아이디"
              aria-label="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-xl border px-4 py-4 text-sm outline-none transition-all
                ${isEmailValid 
                  ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' 
                  : 'border-gray-200 focus:border-primary-600'
                }`}
            />
            {/* handleSendCode 연결 */}
            <button
              onClick={handleSendCode}
              disabled={!isEmailValid}
              className={`w-full rounded-xl py-4 text-sm font-bold text-white transition-colors ${
                isEmailValid ? 'bg-primary-600 hover:bg-primary-500' : 'bg-gray-200'
              }`}
            >
              인증번호 발송
            </button>
          </>
        ) : (
          <>
            {/* 인증번호 입력 화면 */}
            <div>
              <div className="flex justify-between gap-2 mb-2">
                {authCode.map((num, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {inputRefs.current[idx] = el}}
                    type="text" 
                    inputMode="numeric"
                    maxLength={1}
                    aria-label={`인증번호 ${idx + 1}자리`}
                    value={num}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    disabled={timeLeft === 0}
                    className={`h-14 w-12 rounded-lg border text-center text-xl font-bold outline-none transition-all shadow-sm
                      ${timeLeft === 0 
                        ? 'bg-gray-100 border-gray-200 text-gray-400' 
                        : num 
                          ? 'border-primary-brown-300 bg-primary-brown-300 text-white' 
                          : 'border-gray-200 bg-gray-50 focus:border-primary-brown-300 focus:bg-white text-gray-900'
                      }`}
                  />
                ))}
              </div>

              {/* 타이머 */}
              <div className="text-right">
                <span className={`text-sm font-medium ${timeLeft <= 10 ? 'text-error' : 'text-primary-brown-300'}`}>
                  {timeLeft > 0 ? formatTime(timeLeft) : '00:00'}
                </span>
              </div>
            </div>

            {/* 가운데 안내 텍스트 영역 */}
            <div className="text-center py-4">
                {timeLeft > 0 ? (
                    // 시간이 남았을 때: 텍스트 표시
                    <p className="text-sm text-black font-medium">
                        {formatTime(timeLeft)} 후 재전송 가능
                    </p>
                ) : (
                    // 시간이 끝났을 때: 재전송 버튼(링크 스타일) 표시
                    <button 
                        onClick={handleResend}
                        className="text-sm text-blue-500 font-bold underline underline-offset-4 hover:text-blue-600 transition-colors"
                    >
                        인증번호 재전송
                    </button>
                )}
            </div>

            {/* 시간 끝나면 비활성화 */}
            <button
              onClick={handleVerify}
              disabled={timeLeft === 0 || !isCodeValid}
              className={`w-full rounded-xl py-4 text-sm font-bold text-white transition-colors ${
                (timeLeft > 0 && isCodeValid)
                  ? 'bg-primary-600 hover:bg-primary-500' // 활성 상태
                  : 'bg-gray-200 cursor-not-allowed'      // 비활성 상태
              }`}
            >
              확인
            </button>
          </>
        )}
      </div>

      {/* 3. 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="flex w-full max-w-[300px] flex-col items-center rounded-2xl bg-white p-8 text-center shadow-2xl animate-pop-up">
            <div className="mb-4 text-5xl text-primary-brown-300">
              <IoCheckmark />
            </div>
            <h3 className="mb-8 text-lg font-bold text-gray-900">
              인증이 완료되었습니다.
            </h3>
            {/* 부모에게 데이터 전달 */}
            <button
              onClick={handleModalConfirm} 
              className="w-24 rounded-full bg-primary-brown-300 py-2.5 text-sm font-bold text-white hover:bg-primary-brown-400 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Step1Email;