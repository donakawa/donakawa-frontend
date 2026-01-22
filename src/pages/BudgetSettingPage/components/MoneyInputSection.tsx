import React from 'react';

interface MoneyInputSectionProps {
  value: string;
  onChange: (val: string) => void;
}

const AMOUNTS = [1000000, 500000, 100000, 50000, 10000];

const MoneyInputSection = ({ value, onChange }: MoneyInputSectionProps) => {
  // 1. 입력창 변경 시 (숫자만 남기고 콤마 찍기)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    onChange(formatted);
  };

  // 2. 버튼 눌렀을 때 (현재 값 + 버튼 값 계산해서 콤마 찍기)
  const handleQuickAdd = (amount: number) => {
    const current = Number(value.replace(/,/g, '')) || 0;
    const sum = current + amount;
    onChange(String(sum).replace(/\B(?=(\d{3})+(?!\d))/g, ','));
  };

  return (
    <div className="flex flex-col gap-[30px]">
      {/* 입력창 */}
      <div className="flex items-center gap-[18px]">
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleInputChange}
          placeholder="0"
          className="w-full border border-gray-50 py-[18px] px-[33px] 
                  text-[16px] focus-within:border-primary-500 transition-colors 
                  rounded-[6px] outline-none placeholder:text-gray-200 
                  shadow-[0_0_3px_rgba(0,0,0,0.25)] focus-within:shadow-primary-500"
        />
        <span className="text-[24px] font-medium whitespace-nowrap">원 이하</span>
      </div>

      {/* 퀵 버튼들 */}
      <div className="flex flex-wrap gap-[14px]">
        {AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => handleQuickAdd(amount)}
            className="px-[8px] py-[6px] rounded-full border border-primary-300 
                    text-[14px] hover:bg-primary-300 active:scale-95 transition-all">
            + {amount >= 10000 ? `${amount / 10000}만` : `${amount / 1000}천`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MoneyInputSection;
