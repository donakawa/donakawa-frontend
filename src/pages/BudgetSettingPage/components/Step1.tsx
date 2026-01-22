// pages/BudgetSetting/components/Step1.tsx
import React, { useState } from 'react';
import StepLayout from './StepLayout';
import MoneyInputSection from './MoneyInputSection';

interface StepProps {
  onNext: (data: { income: number }) => void;
}

const Step1 = ({ onNext }: StepProps) => {
  const [inputValue, setInputValue] = useState<string>('');

  // 콤마 뺀 진짜 숫자
  const numericValue = Number(inputValue.replace(/,/g, ''));

  return (
    <StepLayout
      stepText="STEP 1"
      title="월 수입은 얼마인가요?"
      isRequired={true}
      isNextDisabled={numericValue === 0}
      onNext={() => onNext({ income: numericValue })}>
      <MoneyInputSection value={inputValue} onChange={setInputValue} />
    </StepLayout>
  );
};

export default Step1;
