import React, { useState } from 'react';
import StepLayout from './StepLayout';

interface StepProps {
  onNext: (value: number) => void;
  defaultValue?: number;
}

const Step2 = ({ onNext, defaultValue }: StepProps) => {
  const [day, setDay] = useState<string>(defaultValue ? String(defaultValue) : '');

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
      onNext={() => onNext(numericDay)}>
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
          className="w-[60px] border-[2px] border-gray-100 py-[14px] text-center
                  rounded-[6px] outline-none placeholder:text-gray-200 focus-within:border-primary-500 transition-colors"
        />
        <span className="text-[24px] font-medium">일</span>
      </div>
    </StepLayout>
  );
};

export default Step2;
