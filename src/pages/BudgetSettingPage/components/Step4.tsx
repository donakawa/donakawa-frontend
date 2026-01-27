import React, { useState } from 'react';
import StepLayout from './StepLayout';
import MoneyInputSection from './MoneyInputSection';

interface StepProps {
  onNext: (data: { savingCost: number }) => void;
}
const Step4 = ({ onNext }: StepProps) => {
  const [inputValue, setInputValue] = useState<string>('');
  // 콤마 뺀 진짜 숫자
  const numericValue = Number(inputValue.replace(/,/g, ''));

  return (
    <StepLayout
      stepText="STEP 4"
      title="매달 저축/ 투자액은 얼마인가요?"
      description="소득의 20%인 20만원이 가장 이상적이에요!"
      isNextDisabled={numericValue === 0}
      onNext={() => onNext({ savingCost: numericValue })}>
      <MoneyInputSection value={inputValue} onChange={setInputValue} />
    </StepLayout>
  );
};

export default Step4;
