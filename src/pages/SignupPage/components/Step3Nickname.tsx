import { useState } from 'react';
import { IoCheckmark } from 'react-icons/io5';
import { checkNicknameDuplicate } from '../../../api/auth';
import { AxiosError } from 'axios';

interface Props {
  onNext: (nickname: string) => void;
}

const Step3Nickname = ({ onNext }: Props) => {
  const [nickname, setNickname] = useState('');

  const currentLength = nickname.length;
  const maxLength = 10;

  const isValid = currentLength > 0 && currentLength <= maxLength;
  
  const isError = currentLength > maxLength;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const sanitizedValue = value.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/g, ''); 
    setNickname(sanitizedValue);
  };

  const handleNext = async () => {
    if (!isValid) return;

    try {
      // 1. 닉네임 중복 확인 API 호출
      await checkNicknameDuplicate(nickname);

      // 2. 성공하면(중복 아니면) 부모에게 닉네임 전달하며 다음 단계로 이동
      onNext(nickname);

    } catch (error) {
      const err = error as AxiosError;
      console.error('닉네임 중복 확인 실패:', err);
      
      // 백엔드 에러 메시지에 따라 다를 수 있지만 일단 알림창 띄우기
      if (err.response?.status === 409 || err.response?.status === 400) {
          alert('이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해 주세요.');
      } else {
          alert('중복 확인 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div className="w-full max-w-sm animate-fade-in">
      {/* 타이틀 영역 */}
      <div className="mb-10">
        <span className="text-xs text-[#999999]">회원가입 STEP 3</span>
        <h2 className="mt-2 text-2xl font-bold text-gray-900 leading-tight">
          닉네임을 입력해 주세요.
        </h2>
      </div>

      {/* 입력 폼 영역 */}
      <div className="space-y-2">
        <div className="relative">
          <input
            type="text"
            placeholder="10자 이내의 영문/한글/숫자 입력 가능"
            aria-label="닉네임"
            value={nickname}
            onChange={handleChange}
            className={`w-full rounded-xl border px-4 py-4 text-sm outline-none transition-all
              ${isError 
                ? 'border-red-500 bg-red-50 text-red-900 focus:border-red-500' 
                : isValid 
                  ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' 
                  : 'border-gray-200 focus:border-primary-600'
              }`}
          />
        </div>

        {/* 글자 수 카운터 및 상태 메시지 */}
        <div className="flex justify-end items-center gap-1 text-xs">
          {isValid && !isError && (
             <IoCheckmark className="text-primary-600" />
          )}
          <span 
            className={`font-medium transition-colors 
              ${isError ? 'text-red-500' : isValid ? 'text-primary-600' : 'text-gray-400'}
            `}
          >
            {/* 0글자일 때도 0/10으로 나오도록 통일 */}
            {currentLength}/{maxLength}
          </span>
        </div>
      </div>

      {/* 다음 버튼 */}
      {/* onClick에 handleNext 연결 */}
      <button
        onClick={handleNext}
        disabled={!isValid}
        className={`mt-10 w-full rounded-xl py-4 text-sm font-bold text-white transition-colors ${
          isValid ? 'bg-primary-600 hover:bg-primary-500' : 'bg-gray-200'
        }`}
      >
        다음
      </button>
    </div>
  );
};

export default Step3Nickname;