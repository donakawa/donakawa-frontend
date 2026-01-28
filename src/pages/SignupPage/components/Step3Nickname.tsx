import { useState } from 'react';
import { IoCheckmark } from 'react-icons/io5'; // 체크 아이콘 (유효할 때 사용)

interface Props {
  onNext: () => void;
}

const Step3Nickname = ({ onNext }: Props) => {
  const [nickname, setNickname] = useState('');

  // 글자 수 계산
  const currentLength = nickname.length;
  const maxLength = 10;

  // 유효성 검사 (1글자 이상 ~ 10글자 이하)
  const isValid = currentLength > 0 && currentLength <= maxLength;
  
  // 에러 상태 (10글자 초과)
  const isError = currentLength > maxLength;

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
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            // 에러면 빨간 테두리, 유효하면 초록 테두리, 아니면 기본
            className={`w-full rounded-xl border px-4 py-4 text-sm outline-none transition-all
              ${isError 
                ? 'border-red-500 bg-red-50 text-red-900 focus:border-red-500' 
                : isValid 
                  ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' 
                  : 'border-gray-200 focus:border-primary-600'
              }`}
          />
        </div>

        {/* 글자 수 카운터 및 상태 메시지 (우측 정렬) */}
        <div className="flex justify-end items-center gap-1 text-xs">
          {isValid && !isError && (
             <IoCheckmark className="text-primary-600" />
          )}
          <span 
            className={`font-medium transition-colors 
              ${isError ? 'text-red-500' : isValid ? 'text-primary-600' : 'text-gray-400'}
            `}
          >
            {/* 글자가 없으면 '최대 10자', 있으면 '현재/최대' 표시 */}
            {currentLength === 0 ? `최대 ${maxLength}자` : `${currentLength}/${maxLength}`}
          </span>
        </div>
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={onNext}
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