import React, { useState } from 'react';
import StepLayout from './StepLayout';
//아이콘
import PigMoneyIcon from '@/assets/pig_money.svg?react';
import BalanceIcon from '@/assets/balance_two.svg?react';
import ShoppingIcon from '@/assets/shopping_basket.svg?react';

interface Strategy {
  id: string;
  title: string;
  description: string;
  value: number;
  icon: React.ReactNode;
}

const STRATEGIES: Strategy[] = [
  {
    id: 'save',
    title: '자산 형성',
    description: '수입의 10% 내외 알뜰한 쇼핑',
    value: 1,
    icon: <PigMoneyIcon />,
  },
  {
    id: 'balance',
    title: '균형 지출',
    description: '수입의 25% 내외 스마트한 쇼핑',
    value: 2,
    icon: <BalanceIcon />,
  },
  {
    id: 'free',
    title: '자유 지출',
    description: '수입의 50% 내외 넉넉한 쇼핑',
    value: 3,
    icon: <ShoppingIcon />,
  },
];

interface StepProps {
  onNext: (value: number) => void;
  defaultValue?: number;
}

const Step5 = ({ onNext, defaultValue }: StepProps) => {
  const initialId = defaultValue ? STRATEGIES.find((s) => s.value === defaultValue)?.id : null;

  const [selectedId, setSelectedId] = useState<string | null>(initialId || null);

  const handleNext = () => {
    if (!selectedId) return;

    const selectedStrategy = STRATEGIES.find((s) => s.id === selectedId);
    if (selectedStrategy) {
      onNext(selectedStrategy.value);
    }
  };

  return (
    <StepLayout
      stepText="STEP 5"
      title="어떤 소비 전략을 선택하시겠어요?"
      isNextDisabled={selectedId === null}
      onNext={handleNext}>
      <div className="flex flex-col gap-[20px] w-full">
        {STRATEGIES.map((item) => {
          const isSelected = selectedId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`flex items-center gap-[20px] p-[12px] border-[2px] rounded-[10px] transition-all text-left w-full
                ${
                  isSelected ? 'border-primary-500 bg-primary-100 shadow-primary-600' : 'border-gray-100'
                } active:scale-[0.98]`}>
              <div>{item.icon}</div>
              <div className="flex flex-col gap-[8px]">
                <span className={`text-[20px] font-semibold`}>{item.title}</span>
                <span className="text-[14px] text-gray-600">{item.description}</span>
              </div>
            </button>
          );
        })}
      </div>
    </StepLayout>
  );
};

export default Step5;
