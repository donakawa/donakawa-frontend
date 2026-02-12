import { useState } from 'react';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';

interface Props {
  onNext: (password: string) => void;
}

const Step2Password = ({ onNext }: Props) => {
  // 입력값 상태
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 눈 모양 아이콘 상태
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // 1. 형식 검사 (영문+숫자 조합, 8~12자리) - 파생 상태
  const isValidFormat = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,12}$/.test(password);

  // 2. 일치 검사 - 파생 상태
  const isMatch = password === confirmPassword && password !== '';

  // 최종 버튼 활성화 조건
  const canGoNext = isValidFormat && isMatch;

  const handleNext = () => {
    onNext(password);
  };

  const getWrapperClass = (isValid: boolean, isError: boolean) => {
    const baseClass = "flex items-center w-full h-12 rounded-xl border px-4 bg-white transition-all";
    
    if (isError) return `${baseClass} border-red-500 bg-red-50`;
    if (isValid) return `${baseClass} border-primary-600 ring-1 ring-primary-600 bg-primary-50`;
    // focus-within으로 내부 input 클릭 시 테두리 강조
    return `${baseClass} border-gray-200 focus-within:border-primary-600`;
  };

  const inputInternalClass = "flex-1 w-full h-full bg-transparent outline-none text-sm placeholder:text-gray-400 appearance-none min-w-0";

  return (
    <div className="w-full max-w-sm animate-fade-in">
      {/* 타이틀 영역 */}
      <div className="mb-10">
        <span className="text-xs text-[#999999]">회원가입 STEP 2</span>
        <h2 className="mt-2 text-2xl font-bold text-gray-900 leading-tight">
          비밀번호를 설정해 주세요.
        </h2>
      </div>

      {/* 입력 폼 영역 */}
      <div className="space-y-2">

        {/* 1. 비밀번호 입력 */}
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
            aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 표시'}
            aria-pressed={showPw}
            onClick={() => setShowPw(!showPw)}
            className={`ml-2 flex-shrink-0 flex items-center justify-center transition-colors ${
              isValidFormat ? 'text-primary-600' : 'text-gray-400'
            }`}
          >
            {showPw ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
          </button>
        </div>

        {/* 헬퍼 텍스트 */}
        <div className="flex justify-end mb-4">
          <span className={`text-xs transition-colors ${isValidFormat ? 'text-primary-600' : 'text-gray-400'}`}>
            영문과 숫자 조합, 8~12자리
          </span>
        </div>

        {/* 2. 비밀번호 확인 입력 (조건부 렌더링) */}
        {isValidFormat && (
          <div className="relative w-full mt-4 animate-fade-in-up">
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
                aria-label={showConfirmPw ? '비밀번호 확인 숨기기' : '비밀번호 확인 표시'}
                aria-pressed={showConfirmPw}
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                className={`ml-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  isMatch ? 'text-primary-600' : 'text-gray-400'
                }`}
              >
                {showConfirmPw ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
              </button>
            </div>
            
            {/* 불일치 시 에러 메시지: 입력창 아래에 띄우기 위해 absolute 유지 */}
            {confirmPassword && !isMatch && (
               <div className="absolute right-0 top-full mt-1 text-right text-xs text-red-500">
                 비밀번호가 일치하지 않습니다.
               </div>
            )}
          </div>
        )}
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={handleNext}
        disabled={!canGoNext}
        className={`mt-10 w-full rounded-xl py-4 text-sm font-bold text-white transition-colors ${
          canGoNext ? 'bg-primary-600 hover:bg-primary-500' : 'bg-gray-200'
        }`}
      >
        다음
      </button>
    </div>
  );
};

export default Step2Password;