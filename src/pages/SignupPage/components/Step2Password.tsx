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

  // 1. 형식 검사 (영문+숫자 필수, 특수문자 허용, 8~12자리)
  const isValidFormat = /^(?=.*[A-Za-z])(?=.*\d)[^\s]{8,12}$/.test(password);

  // 2. 일치 검사
  const isMatch = password === confirmPassword && password !== '';

  // 최종 버튼 활성화 조건
  const canGoNext = isValidFormat && isMatch;

  // 에러 메시지 생성 함수
  const getErrorMessage = (pw: string) => {
    if (!pw) return ''; // 입력 전이면 에러 없음
    
    if (/\s/.test(pw)) return '공백은 사용할 수 없습니다.';
    if (pw.length < 8 || pw.length > 12) return '8~12자 이내로 입력해주세요.';
    if (!/(?=.*[A-Za-z])/.test(pw)) return '영문을 하나 이상 포함해야 합니다.';
    if (!/(?=.*\d)/.test(pw)) return '숫자를 하나 이상 포함해야 합니다.';
    
    return ''; // 모든 조건 통과
  };

  const errorMessage = getErrorMessage(password);

  const handleNext = () => {
    onNext(password);
  };

  // Wrapper 스타일 (테두리 및 배경)
  const getWrapperStyle = (isValid: boolean, isError: boolean) => {
    const baseClass = "flex items-center w-full h-12 rounded-xl border px-4 bg-white transition-all";
    
    if (isError) return `${baseClass} border-red-500 bg-red-50 focus-within:border-red-500`;
    if (isValid) return `${baseClass} border-primary-600 ring-1 ring-primary-600 bg-primary-50`;
    return `${baseClass} border-gray-200 focus-within:border-primary-600`;
  };

  // 내부 input 스타일
  const inputInternalStyle = "flex-1 w-full h-full bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400 p-0 m-0 min-w-0 appearance-none";

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
        <div className={getWrapperStyle(isValidFormat, !!errorMessage && password.length > 0)}>
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="비밀번호"
            aria-label="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputInternalStyle}
          />
          <button
            type="button"
            aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 표시'}
            aria-pressed={showPw}
            onClick={() => setShowPw(!showPw)}
            className={`ml-2 flex-shrink-0 flex items-center justify-center w-6 h-6 transition-colors ${
              isValidFormat ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {showPw ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
          </button>
        </div>

        {/* 헬퍼 텍스트 or 에러 메시지 */}
        <div className="flex justify-end mb-4">
          {errorMessage ? (
             <span className="text-xs text-red-500 transition-colors animate-fade-in">
               {errorMessage}
             </span>
          ) : (
             <span className={`text-xs transition-colors ${isValidFormat ? 'text-primary-600' : 'text-gray-400'}`}>
            영문과 숫자 조합, 8~12자리
             </span>
          )}
        </div>

        {/* 2. 비밀번호 확인 입력 (조건부 렌더링) */}
        {isValidFormat && (
          <div className="relative w-full mt-4 animate-fade-in-up">
            <div className={getWrapperStyle(isMatch, confirmPassword !== '' && !isMatch)}>
              <input
                type={showConfirmPw ? 'text' : 'password'}
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputInternalStyle}
              />
              <button
                type="button"
                aria-label={showConfirmPw ? '비밀번호 확인 숨기기' : '비밀번호 확인 표시'}
                aria-pressed={showConfirmPw}
                onClick={() => setShowConfirmPw(!showConfirmPw)}
                className={`ml-2 flex-shrink-0 flex items-center justify-center w-6 h-6 transition-colors ${
                  isMatch ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {showConfirmPw ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
              </button>
            </div>
            
            {/* 불일치 에러 메시지 */}
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