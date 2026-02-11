import React, { useState, useEffect, useRef } from 'react';
import StepLayout from './StepLayout';
import { useQuery } from '@tanstack/react-query';

import { getRecommendBudget, type RecommendBudgetRequest } from '@/apis/BudgetPage/budget';
import { getMe } from '@/apis/auth';

interface StepProps {
  onNext: (value: number) => void;
  defaultValue?: number;
  prevData: RecommendBudgetRequest;
}

const Step6 = ({ onNext, defaultValue, prevData }: StepProps) => {
  const [budget, setBudget] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: userData } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: getMe,
    staleTime: 1000 * 60 * 5,
  });

  const { data: budgetData } = useQuery({
    queryKey: ['budget', 'recommend', prevData],
    queryFn: () => getRecommendBudget(prevData),
    enabled: !defaultValue,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (defaultValue) {
      setBudget(defaultValue.toLocaleString());
    } else if (budgetData) {
      setBudget(budgetData.shoppingBudget.toLocaleString());
    }
  }, [budgetData, defaultValue]);

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

  const nickname = userData?.nickname || '고객';

  return (
    <StepLayout
      stepText="자산 형성 전략"
      title={
        <div className="text-center leading-[1.6] whitespace-pre-wrap">
          <span className="text-primary-600">{nickname}</span>님에게 딱 맞는
          <br />
          온라인 쇼핑 목표액은
        </div>
      }
      titleAlign="center"
      isNextDisabled={numericBudget === 0}
      onNext={() => onNext(numericBudget)}
      nextButtonText="완료">
      <div className="flex items-center gap-[18px] w-full">
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={budget}
          onChange={handleChange}
          placeholder="0"
          className="w-full border-[2px] border-gray-100 py-[18px] px-[33px] 
                  text-[16px] focus-within:border-primary-500 transition-colors 
                  rounded-[6px] outline-none placeholder:text-gray-200"
        />
        <span className="text-[24px] font-medium whitespace-nowrap">원 이하</span>
      </div>
    </StepLayout>
  );
};

export default Step6;
