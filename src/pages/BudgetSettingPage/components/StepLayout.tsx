import React from 'react';

interface StepLayoutProps {
  stepText: string;
  title: string | React.ReactNode;
  isRequired?: boolean; // step 1&5 제목 옆에 * 표시
  titleAlign?: 'left' | 'center'; //step 6 제목 정렬
  description?: string; // 제목 아래 설명
  children: React.ReactNode;
  onNext: () => void; // 다음 버튼 클릭 시 실행할 함수
  isNextDisabled: boolean; // 버튼 활성화 여부
  nextButtonText?: string;
}

const StepLayout = ({
  stepText,
  title,
  isRequired = false,
  titleAlign = 'left',
  description,
  children,
  onNext,
  isNextDisabled,
  nextButtonText = '다음',
}: StepLayoutProps) => {
  return (
    <div className="flex flex-col h-full gap-[30px] px-[20px] pt-[58px] leading-none">
      {/* 공통 제목 영역 */}
      <div className="flex flex-col mb-[10px]">
        <span className="text-gray-600 text-[16px] ">{stepText}</span>
        <div
          className={`text-[24px] font-medium flex items-center whitespace-pre-wrap mt-[12px]
            ${titleAlign === 'center' ? 'justify-center text-center leading-[50px]' : 'text-left'} 
          `}>
          {title}
          {isRequired && <span className="text-error ml-[4px]">*</span>}
        </div>
        {description && <p className="text-gray-600 text-[16px] leading-none mt-[6px]">{description}</p>}
      </div>

      {/* 내용물*/}
      <div className="flex flex-col items-center mb-[6px]">{children}</div>

      {/* 다음 버튼 */}
      <div className="pb-[20px]">
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          className={`w-full py-[18px] rounded-[5px] text-[16px] font-medium transition-all ${
            !isNextDisabled ? 'bg-primary-500 text-white' : 'bg-gray-100 text-white cursor-not-allowed'
          }`}>
          {nextButtonText}
        </button>
      </div>
    </div>
  );
};

export default StepLayout;
