import React, { useState, useRef, useEffect } from 'react';
import { IoCheckmark } from 'react-icons/io5';

interface Props {
  onNext: () => void;
}

const Step1Email = ({ onNext }: Props) => {
  const [view, setView] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [authCode, setAuthCode] = useState(['', '', '', '', '']); 
  const [showModal, setShowModal] = useState(false);
  
  // ⏱️ 타이머 상태
  const [timeLeft, setTimeLeft] = useState(299); 

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ⏱️ 타이머 로직
  useEffect(() => {
    if (view !== 'code') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0; // 0초가 되면 멈춤
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [view, timeLeft]); // timeLeft 의존성 추가하여 0일 때 확실히 멈추게 함

  // ⏱️ 시간 포맷 (MM:SS)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const isEmailValid = email.includes('@');

  const handleSendCode = () => {
    if(!isEmailValid) return;
    setTimeLeft(299); 
    setView('code');
  };

  // 🔄 재전송 핸들러 추가
  const handleResend = () => {
    // 1. 타이머 리셋
    setTimeLeft(299);
    // 2. 입력값 리셋
    setAuthCode(['', '', '', '', '']);
    // 3. 첫 번째 칸으로 포커스
    inputRefs.current[0]?.focus();
    // 4. (실제 개발 시) API 재요청 로직 추가
    console.log('인증번호 재전송 요청');
  };

  const handleCodeChange = (index: number, value: string) => {
    const sanitizedValue = value.replace(/[^0-9]/g, '');
    if (sanitizedValue.length > 1) return;

    const newCode = [...authCode];
    newCode[index] = sanitizedValue;
    setAuthCode(newCode);

    // 2️⃣ 5자리니까 index < 4 일 때 다음 칸으로 이동
    if (sanitizedValue !== '' && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && authCode[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isCodeValid = authCode.every((num) => num !== '');

  const handleVerify = () => {
    if (timeLeft === 0) {
      alert('인증 시간이 만료되었습니다. 재전송 버튼을 눌러주세요.');
      return;
    }
    setShowModal(true);
  };

  const handleModalConfirm = () => {
    setShowModal(false);
    onNext();
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-xl border px-4 py-4 text-sm outline-none transition-all
                ${isEmailValid 
                  ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' 
                  : 'border-gray-200 focus:border-primary-600'
                }`}
            />
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
            {/* 3️⃣ 구조 변경: 입력칸들과 타이머를 세로로 배치 */}
            <div>
              {/* 입력 박스 5개 컨테이너 */}
              <div className="flex justify-between gap-2 mb-2">
                {authCode.map((num, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {inputRefs.current[idx] = el}}
                    type="text" 
                    inputMode="numeric"
                    maxLength={1}
                    value={num}
                    onChange={(e) => handleCodeChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    disabled={timeLeft === 0} // 시간 만료되면 입력 불가 처리
                    className={`h-14 w-12 rounded-lg border text-center text-xl font-bold outline-none transition-all shadow-sm
                      ${timeLeft === 0 
                        ? 'bg-gray-100 border-gray-200 text-gray-400' // 만료 시 스타일
                        : num 
                          ? 'border-primary-brown-300 bg-primary-brown-300 text-white' 
                          : 'border-gray-200 bg-gray-50 focus:border-primary-brown-300 focus:bg-white text-gray-900'
                      }`}
                  />
                ))}
              </div>

              {/* 4️⃣ 타이머: 입력칸 그룹 아래 오른쪽 정렬 */}
              <div className="text-right">
                <span className={`text-sm font-medium ${timeLeft <= 10 ? 'text-error' : 'text-primary-brown-300'}`}>
                  {timeLeft > 0 ? formatTime(timeLeft) : '시간 만료'}
                </span>
              </div>
            </div>

            {/* 5️⃣ 버튼 변경 로직: 시간 남으면 [확인], 시간 없으면 [재전송] */}
            {timeLeft > 0 ? (
              <button
                onClick={handleVerify}
                disabled={!isCodeValid}
                className={`mt-6 w-full rounded-xl py-4 text-sm font-bold text-white transition-colors ${
                  isCodeValid ? 'bg-primary-600 hover:bg-primary-500' : 'bg-gray-200'
                }`}
              >
                확인
              </button>
            ) : (
              <button
                onClick={handleResend}
                className="mt-6 w-full rounded-xl py-4 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 transition-colors"
              >
                인증번호 재전송
              </button>
            )}
          </>
        )}
      </div>

      {/* 3. 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="flex w-full max-w-[300px] flex-col items-center rounded-2xl bg-white p-8 text-center shadow-2xl animate-pop-up">
            <div className="mb-4 text-5xl text-primary-brown-300">
              <IoCheckmark />
            </div>
            <h3 className="mb-8 text-lg font-bold text-gray-900">
              인증이 완료되었습니다.
            </h3>
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