import { useState } from 'react';
import StepLayout from './StepLayout';
import MoneyInputSection from './MoneyInputSection';

interface StepProps {
  onNext: (value: number) => void;
  defaultValue?: number;
}

const Step3 = ({ onNext, defaultValue }: StepProps) => {
  const [inputValue, setInputValue] = useState<string>(defaultValue ? defaultValue.toLocaleString() : '');

  // 콤마 뺀 진짜 숫자
  const numericValue = Number(inputValue.replace(/,/g, ''));

  return (
    <StepLayout
      stepText="STEP 3"
      title="월 고정 생활비가 얼마인가요?"
      description="월세, 교통비, 식비 등을 합산한 금액을 입력해주세요."
      isNextDisabled={numericValue === 0}
      onNext={() => onNext(numericValue)}>
      <MoneyInputSection value={inputValue} onChange={setInputValue} />
    </StepLayout>
  );
};

export default Step3;
