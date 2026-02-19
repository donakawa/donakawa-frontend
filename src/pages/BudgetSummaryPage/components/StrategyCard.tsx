import React, { useState, useEffect } from 'react';
import { type BudgetData } from '../hooks/useBudgetLogic';

interface StrategyCardProps {
  isEdit: boolean;
  data: BudgetData;
  onChange: (key: keyof BudgetData, value: string) => void;
}

const strategyNames: Record<number, string> = {
  1: '자산 형성',
  2: '균형 지출',
  3: '자유 지출',
};

const StrategyCard = ({ isEdit, data, onChange }: StrategyCardProps) => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (showWarning) {
      const timer = setTimeout(() => setShowWarning(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showWarning]);

  const inputStyle =
    'bg-white mr-[10px] border-[2px] text-black rounded-[5px] py-[4px] text-[18px] text-center font-semibold outline-none transition-colors';

  // 갱신일 핸들러
  const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onChange('renewalDay', '');
      return;
    }
    const num = Number(value);
    if (isNaN(num)) return;
    if (num >= 1 && num <= 31) {
      onChange('renewalDay', value);
    }
  };

  // 쇼핑 목표액 변경 핸들러
  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');

    if (rawValue === '') {
      onChange('shoppingTarget', '');
      setShowWarning(false);
      return;
    }

    const num = Number(rawValue);
    if (isNaN(num)) return;

    if (num <= 100000000) {
      onChange('shoppingTarget', rawValue);
      setShowWarning(false);
    } else {
      //1억 이상 불가능
      onChange('shoppingTarget', '100000000');
      setShowWarning(true);
    }
  };

  return (
    <div className="flex flex-col items-center w-full border-[1.5px] border-primary-500 rounded-[10px] px-[21px] pt-[10px] mb-[24px] bg-primary-100 shadow-[0_0_3px_rgba(0,0,0,0.25)] shadow-primary-500">
      <div className="flex px-[10px] py-[6px] rounded-full text-white text-[12px] bg-primary-600">
        {strategyNames[data.strategy] || '자산 형성'} 전략
      </div>
      <div className="flex flex-col w-full gap-[10px] my-[29px]">
        {/* 쇼핑 목표액 */}
        <div className="flex flex-col gap-[2px] relative">
          <span className="text-[12px]">온라인 쇼핑 목표액</span>

          <div className="text-[24px] font-bold text-primary-brown-400 flex items-center">
            {isEdit ? (
              <div className="relative">
                <input
                  type="text"
                  value={data.shoppingTarget ? Number(data.shoppingTarget).toLocaleString() : ''}
                  placeholder="0"
                  onChange={handleTargetChange}
                  style={{
                    width: `${Math.max(data.shoppingTarget ? Number(data.shoppingTarget).toLocaleString().length : 1, 1) + 2}ch`,
                    minWidth: '60px',
                  }}
                  className={`${inputStyle} w-auto ${showWarning ? 'border-red-500 shake-animation' : 'border-gray-600 focus:border-primary-brown-400'}`}
                />

                {showWarning && (
                  <span className="absolute -top-[25px] left-0 w-full text-center text-[11px] text-white bg-red-500 px-1 py-0.5 rounded shadow-sm animate-bounce">
                    1억 원 이상 불가능
                  </span>
                )}
              </div>
            ) : (
              <span className="mr-1">{Number(data.shoppingTarget).toLocaleString()}</span>
            )}
            <span className="text-[24px]">원 이하</span>
          </div>
        </div>

        {/* 갱신일 */}
        <div className="flex flex-col w-full gap-[2px]">
          <span className="text-[12px]">갱신일</span>
          <div className="text-[24px] font-bold text-primary-brown-400 flex items-center">
            <span className="mr-[10px]">매달</span>
            {isEdit ? (
              <input
                type="text"
                value={data.renewalDay || ''}
                onChange={handleDayChange}
                placeholder="1"
                className={`${inputStyle} w-[60px] border-gray-600 focus:border-primary-brown-400`}
              />
            ) : (
              <span>{data.renewalDay || '0'}</span>
            )}
            <span>일</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategyCard;
