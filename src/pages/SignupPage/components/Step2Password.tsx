import { useState, useEffect } from 'react';
import { IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';

interface Props {
  onNext: () => void;
}

const Step2Password = ({ onNext }: Props) => {
  // 입력값 상태
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 눈 모양 아이콘 상태 (비밀번호 보이기 여부)
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // 유효성 검사 상태
  const [isValidFormat, setIsValidFormat] = useState(false); // 형식 맞는지
  const [isMatch, setIsMatch] = useState(false); // 둘이 일치하는지

  // 1. 형식 검사 (영문+숫자 조합, 8~12자리)
  useEffect(() => {
    // 정규식: 영문(대소문자) 포함, 숫자 포함, 8~12자
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,12}$/;
    setIsValidFormat(regex.test(password));
  }, [password]);

  // 2. 일치 검사
  useEffect(() => {
    setIsMatch(password === confirmPassword && password !== '');
  }, [password, confirmPassword]);

  // 최종 버튼 활성화 조건
  const canGoNext = isValidFormat && isMatch;

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
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full rounded-xl border px-4 py-4 text-sm outline-none transition-all
              ${password 
                ? (isValidFormat ? 'border-primary-600 ring-1 ring-primary-600 bg-primary-50' : 'border-red-500 bg-red-50') // 입력했는데 틀리면 빨강, 맞으면 초록
                : 'border-gray-200 focus:border-primary-600' // 입력 안했으면 기본
              }`}
          />
          {/* 눈 아이콘 */}
          <button
            type="button"
            aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 표시'}
            aria-pressed={showPw}
            onClick={() => setShowPw(!showPw)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPw ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
          </button>
        </div>

        {/* 헬퍼 텍스트 (오른쪽 정렬) */}
        <div className="flex justify-end mb-4">
          <span className={`text-xs transition-colors ${isValidFormat ? 'text-primary-600' : 'text-gray-400'}`}>
            영문과 숫자 조합, 8~12자리
          </span>
        </div>

        {/* 2. 비밀번호 확인 입력 */}
        <div className="relative mt-4">
          <input
            type={showConfirmPw ? 'text' : 'password'}
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            // 비밀번호 형식이 맞을 때만 입력 가능하게 하거나, 항상 열어두거나 (여기선 항상 열어둠)
            className={`w-full rounded-xl border px-4 py-4 text-sm outline-none transition-all
              ${confirmPassword
                ? (isMatch ? 'border-primary-600 ring-1 ring-primary-600 bg-primary-50' : 'border-red-500 bg-red-50')
                : 'border-gray-200 focus:border-primary-600'
              }`}
          />
           <button
            type="button"
            aria-label={showConfirmPw ? '비밀번호 확인 숨기기' : '비밀번호 확인 표시'}
            aria-pressed={showConfirmPw}
            onClick={() => setShowConfirmPw(!showConfirmPw)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showConfirmPw ? <IoEyeOutline size={20} /> : <IoEyeOffOutline size={20} />}
          </button>
        </div>
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={onNext}
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