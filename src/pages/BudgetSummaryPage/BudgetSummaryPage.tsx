import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { type HeaderControlContext } from '@/layouts/ProtectedLayout';

import InfoItem from './components/InfoItem';

import IncomeIcon from '@/assets/income.svg?react';
import FixedIcon from '@/assets/fixedCost.svg?react';
import SavingIcon from '@/assets/savingCost.svg?react';

interface BudgetData {
  income: number;
  fixedCost: number;
  savingCost: number;
  strategy: 'save' | 'balance' | 'free';
  shoppingTarget: number;
  renewalDay: number;
}

const MOCK_DATA: BudgetData = {
  income: 1000000,
  fixedCost: 400000,
  savingCost: 0,
  strategy: 'save',
  shoppingTarget: 250000,
  renewalDay: 20, // 기본값
};

const BudgetSummaryPage = () => {
  // 헤더 컨트롤 가져오기
  const { setRightAction } = useOutletContext<HeaderControlContext>();

  // 상태 관리
  const [isEdit, setIsEdit] = useState(false);
  const [data, setData] = useState<BudgetData>(MOCK_DATA);

  // 헤더 버튼 제어
  useEffect(() => {
    if (isEdit) {
      setRightAction(null);
    } else {
      setRightAction({
        label: '수정하기',
        onClick: () => setIsEdit(true),
      });
    }
  }, [isEdit, setRightAction]);

  const formatNumber = (num: number) => num.toLocaleString();

  const handleDataChange = (key: keyof BudgetData, value: string) => {
    const numValue = Number(value.replace(/,/g, ''));
    if (!isNaN(numValue)) {
      setData((prev) => ({ ...prev, [key]: numValue }));
    }
  };

  return (
    <div className="flex flex-col px-[20px] pt-[31px] h-full pb-[20px]">
      <div
        className="flex flex-col items-center w-full border-[1.5px] border-primary-500 
                  rounded-[10px] px-[21px] pt-[10px] mb-[24px] bg-primary-100
                  shadow-[0_0_3px_rgba(0,0,0,0.25)] shadow-primary-500">
        <div className={`flex px-[10px] py-[6px] rounded-full text-white text-[12px] bg-primary-600`}>
          자산 형성 전략
        </div>
        {/* 내용 */}
        <div className="flex flex-col w-full gap-[10px] my-[29px]">
          <div className="flex flex-col gap-[2px]">
            <span className="text-[12px] ">온라인 쇼핑 목표액</span>
            <div className="text-[24px] font-bold text-primary-brown-400 flex items-center ">
              {isEdit ? (
                <input
                  type="text"
                  value={data.shoppingTarget.toLocaleString()}
                  onChange={(e) => handleDataChange('shoppingTarget', e.target.value)}
                  className="bg-white mr-[10px] border-[2px] border-gray-600 text-black rounded-[5px] 
                  px-[16px] py-[4px] w-[110px] text-[18px] text-center font-semibold
                  outline-none focus:border-primary-brown-400 transition-colors"
                />
              ) : (
                <span>{formatNumber(data.shoppingTarget)}</span>
              )}
              <span className="text-[24px]">원 이하</span>
            </div>
          </div>

          <div className="flex flex-col w-full gap-[2px]">
            <span className="text-[12px]">갱신일</span>
            <div className="text-[24px] font-bold text-primary-brown-400 flex items-center ">
              <span className="mr-[10px]">매달</span>
              {isEdit ? (
                <input
                  type="text"
                  value={data.renewalDay}
                  onChange={(e) => handleDataChange('renewalDay', e.target.value)}
                  className="bg-white mr-[10px] border-[2px] border-gray-600 text-black rounded-[5px] 
                  px-[16px] py-[4px] w-[60px] text-[18px] text-center font-semibold 
                  outline-none focus:border-primary-brown-400 transition-colors"
                />
              ) : (
                <span>{data.renewalDay}</span>
              )}
              <span>일</span>
            </div>
          </div>
        </div>
      </div>
      {/* 정보들 리스트 */}
      <div className="flex flex-col gap-[20px] flex-1">
        <InfoItem
          label="월 수입"
          value={data.income}
          isEdit={isEdit}
          onChange={(val) => handleDataChange('income', val)}
          icon={<IncomeIcon className="w-[40px] h-[40px]" />}
        />
        <InfoItem
          label="월 고정 생활비"
          value={data.fixedCost}
          isEdit={isEdit}
          onChange={(val) => handleDataChange('fixedCost', val)}
          icon={<FixedIcon className="w-[40px] h-[40px]" />}
        />
        <InfoItem
          label="저축 / 투자액"
          value={data.savingCost}
          isEdit={isEdit}
          onChange={(val) => handleDataChange('savingCost', val)}
          icon={<SavingIcon className="w-[40px] h-[40px]" />}
        />
      </div>
      {/* 수정 완료 버튼 */}
      {isEdit && (
        <button
          onClick={() => {
            setIsEdit(false);
          }}
          className="w-full mt-[36px] py-[14px] rounded-[5px] text-[16px] font-medium bg-primary-500 text-white">
          완료
        </button>
      )}
    </div>
  );
};

export default BudgetSummaryPage;
