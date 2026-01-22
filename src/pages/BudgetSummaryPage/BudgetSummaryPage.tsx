import React from 'react';

interface BudgetData {
  // 예시 데이터 타입
  income: number;
  fixedCost: number;
  savingCost: number;
  strategy: 'save' | 'balance' | 'free';
  shoppingTarget: number;
}

const MOCK_DATA: BudgetData = {
  income: 1000000,
  fixedCost: 400000,
  savingCost: 200000,
  strategy: 'save',
  shoppingTarget: 250000,
};

const BudgetSummaryPage = () => {
  const { income, fixedCost, savingCost, strategy, shoppingTarget } = MOCK_DATA;

  // 숫자 포맷팅 (1000 -> 1,000)
  const formatNumber = (num: number) => num.toLocaleString();

  return (
    <div className="flex flex-col px-[20px] pt-[31px] leading-none">
      {/* 전략 박스 */}
      <div
        className="flex flex-col items-center w-full border-[1.5px] border-primary-500 
                  rounded-[10px] px-[21px] py-[10px] mb-[24px] bg-primary-100
                  shadow-[0_0_3px_rgba(0,0,0,0.25)] shadow-primary-500">
        <div className={`flex px-[10px] py-[6px] rounded-full text-white text-[12px] bg-primary-600`}>
          자산 형성 전략
        </div>

        {/* 내용 */}
        <div className="flex flex-col w-full gap-[20px] mt-[33px] mb-[39px]">
          <div className="flex flex-col gap-[10px]">
            <span className="text-[12px] ">온라인 쇼핑 목표액</span>
            <div className="text-[24px] font-bold text-primary-brown-400">
              {formatNumber(shoppingTarget)}원 <span className="text-[24px]">이하</span>
            </div>
          </div>
          <div className="flex flex-col w-full gap-[10px]">
            <span className="text-[12px]">갱신일</span>
            <span className="text-[24px] font-bold text-primary-brown-400">매달 20일</span>
          </div>
        </div>
      </div>

      {/* 정보들 */}
      <div className="flex flex-col gap-[20px] ">
        <InfoItem label="월 수입" value={income} />
        <InfoItem label="월 고정 생활비" value={fixedCost} />
        <InfoItem label="저축 / 투자액" value={savingCost} />
      </div>
    </div>
  );
};

// 재사용
const InfoItem = ({ label, value }: { label: string; value: number }) => {
  return (
    <div className="flex flex-col gap-[8px]">
      <span className="text-[14px] text-gray-600">{label}</span>
      <div className="w-full p-[18px] rounded-[6px] text-[14px] shadow-[0_0_3px_rgba(0,0,0,0.25)]">
        {value.toLocaleString()}
      </div>
    </div>
  );
};

export default BudgetSummaryPage;
