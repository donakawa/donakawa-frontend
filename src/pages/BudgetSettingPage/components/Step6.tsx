import React, { useState, useEffect, useRef } from 'react';
import StepLayout from './StepLayout';

const Step6 = ({ onNext }: { onNext: (data: { budget: number }) => void }) => {
  const [budget, setBudget] = useState<string>('300,000');

  const inputRef = useRef<HTMLInputElement>(null);
  // 0.5초 뒤에 포커스
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);

    return () => clearTimeout(timer); // 클린업
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setBudget(val.replace(/\B(?=(\d{3})+(?!\d))/g, ','));
  };

  const numericBudget = Number(budget.replace(/,/g, ''));

  return (
    <StepLayout
      stepText="자산 형성 전략"
      title={
        <>
          0000000님에게 딱 맞는
          <br />
          온라인 쇼핑 목표액은
        </>
      }
      titleAlign="center"
      isNextDisabled={numericBudget === 0}
      onNext={() => onNext({ budget: numericBudget })}
      nextButtonText="완료">
      <div className="flex items-center gap-[18px] w-full">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={budget}
          onChange={handleChange}
          placeholder="0"
          className="w-full border border-gray-50 py-[18px] px-[33px] 
                  text-[16px] focus-within:border-primary-500 transition-colors 
                  rounded-[6px] outline-none placeholder:text-gray-200 
                  shadow-[0_0_3px_rgba(0,0,0,0.25)] focus-within:shadow-primary-500"
        />
        <span className="text-[24px] font-medium whitespace-nowrap">원 이하</span>
      </div>
    </StepLayout>
  );
};

export default Step6;
