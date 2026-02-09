import React, { useState } from 'react';
import { IoCheckmark } from 'react-icons/io5';
import { checkNicknameDuplicate } from '../../../api/auth';
import { AxiosError } from 'axios';

// 백엔드 에러 타입
interface ErrorResponse {
  error: {
    errorCode: string;
    reason: string;
  };
}

// 닉네임 중복 검사 응답 타입
interface NicknameResponse {
  isAvailable: boolean;
}

interface Props {
  onNext: (nickname: string) => void;
}

const Step3Nickname = ({ onNext }: Props) => {
  const [nickname, setNickname] = useState('');
  
  // 에러 메시지 상태
  const [errorMessage, setErrorMessage] = useState('');

  const currentLength = nickname.length;
  const maxLength = 10;

  // 유효성 검사 (길이 1~10)
  const isValidLength = currentLength > 0 && currentLength <= maxLength;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 입력 시 에러 초기화
    setErrorMessage('');
    
    const value = e.target.value;
    // 특수문자 제거 (영문, 한글, 숫자만 허용)
    const sanitizedValue = value.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]/g, ''); 
    setNickname(sanitizedValue);
  };

  const handleNext = async () => {
    if (!isValidLength) return;

    try {
      // 1. 닉네임 중복 확인 API 호출
      // (auth.ts에서 response.data.data를 반환하므로 바로 사용 가능)
      const data = await checkNicknameDuplicate(nickname) as NicknameResponse;

      // 2. 사용 가능 여부 확인
      if (data.isAvailable) {
        // 성공: 다음 단계로 이동
        onNext(nickname);
      } else {
        // 실패: 이미 사용 중 (isAvailable: false)
        setErrorMessage('이미 사용 중인 닉네임입니다.');
      }

    } catch (error) {
      const err = error as AxiosError<ErrorResponse>; // 제네릭 추가
      console.error('닉네임 중복 확인 실패:', err);
      
      const errorCode = err.response?.data?.error?.errorCode;

      //  에러 코드별 메시지 처리
      if (errorCode === 'U009') { // 명세서엔 없지만 혹시 모를 코드
         setErrorMessage('이미 사용 중인 닉네임입니다.');
      } else if (errorCode === 'V001') {
         setErrorMessage('닉네임은 10자 이하이어야 합니다.');
      } else {
         // 그 외 에러 (서버 오류 등)
         // auth.ts에서 throw한 에러를 잡는 경우
         setErrorMessage('중복 확인 중 오류가 발생했습니다.');
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
            maxLength={10} // HTML 레벨에서도 길이 제한
            className={`w-full rounded-xl border px-4 py-4 text-sm outline-none transition-all
              ${errorMessage 
                ? 'border-red-500 bg-red-50 focus:border-red-500' // 에러 상태 (빨강)
                : isValidLength 
                  ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' // 유효 상태 (초록)
                  : 'border-gray-200 focus:border-primary-600' // 기본 상태
              }`}
          />
        </div>

        {/* 하단 정보 영역: 에러 메시지 + 글자수 */}
        <div className="flex justify-between items-start h-5"> {/* 높이 고정으로 레이아웃 흔들림 방지 */}
          
          {/* 좌측: 에러 메시지 */}
          <div className="flex-1">
            {errorMessage && (
              <p className="ml-1 text-xs text-red-500 animate-fade-in">
                {errorMessage}
              </p>
            )}
          </div>

          {/* 우측: 글자 수 카운터 */}
          <div className="flex items-center gap-1 text-xs shrink-0 ml-2">
            {isValidLength && !errorMessage && (
               <IoCheckmark className="text-primary-600" />
            )}
            <span 
              className={`font-medium transition-colors 
                ${errorMessage ? 'text-red-500' : isValidLength ? 'text-primary-600' : 'text-gray-400'}
              `}
            >
              {currentLength}/{maxLength}
            </span>
          </div>
        </div>
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={handleNext}
        disabled={!isValidLength}
        className={`mt-10 w-full rounded-xl py-4 text-sm font-bold text-white transition-colors ${
          isValidLength ? 'bg-primary-600 hover:bg-primary-500' : 'bg-gray-200'
        }`}
      >
        다음
      </button>
    </div>
  );
};

export default Step3Nickname;