import React, { useState } from 'react';
import StepLayout from './StepLayout';

interface StepProps {
  // 다음으로 넘길 때 날짜 정보 전달
  onNext: (data: { payDay: number }) => void;
}

const Step2 = ({ onNext }: StepProps) => {
  const [day, setDay] = useState<string>('');

  // 날짜 입력 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');

    // 31일 제한
    if (Number(val) > 31) val = '31';

    setDay(val);
  };

  const numericDay = Number(day);

  return (
    <StepLayout
      stepText="STEP 2"
      title="언제 수입이 들어오나요?"
      isNextDisabled={numericDay === 0 || numericDay > 31}
      onNext={() => onNext({ payDay: numericDay })}>
      <div className="flex items-center gap-[18px]">
        <span className="text-[24px] font-medium">매달</span>
        {/* 날짜 입력칸 */}
        <input
          type="text"
          inputMode="numeric"
          value={day}
          onChange={handleChange}
          placeholder="1"
          maxLength={2}
          className="w-[60px] border border-gray-50 py-[18px] px-[21px] text-center
                  rounded-[6px] outline-none placeholder:text-gray-200 focus-within:border-primary-500 transition-colors 
                  shadow-[0_0_3px_rgba(0,0,0,0.25)] focus-within:shadow-primary-500"
        />
        <span className="text-[24px] font-medium">일</span>
      </div>
    </StepLayout>
  );
};

export default Step2;
