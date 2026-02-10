import { useBudgetLogic } from './hooks/useBudgetLogic';
import StrategyCard from './components/StrategyCard';
import InfoItem from './components/InfoItem';

import IncomeIcon from '@/assets/income.svg?react';
import FixedIcon from '@/assets/fixedCost.svg?react';
import SavingIcon from '@/assets/savingCost.svg?react';

const BudgetSummaryPage = () => {
  const { isEdit, data, handleChange, handleSave } = useBudgetLogic();

  return (
    <div className="flex flex-col px-[20px] pt-[31px] h-full pb-[20px]">
      {/* 상단 전략 카드 */}
      <StrategyCard isEdit={isEdit} data={data} onChange={handleChange} />

      {/* 하단 정보 리스트 */}
      <div className="flex flex-col gap-[20px] flex-1">
        <InfoItem
          label="월 수입"
          value={data.income}
          isEdit={isEdit}
          onChange={(val) => handleChange('income', val)}
          icon={<IncomeIcon className="w-[40px] h-[40px]" />}
        />
        <InfoItem
          label="월 고정 생활비"
          value={data.fixedCost}
          isEdit={isEdit}
          onChange={(val) => handleChange('fixedCost', val)}
          icon={<FixedIcon className="w-[40px] h-[40px]" />}
        />
        <InfoItem
          label="저축 / 투자액"
          value={data.savingCost}
          isEdit={isEdit}
          onChange={(val) => handleChange('savingCost', val)}
          icon={<SavingIcon className="w-[40px] h-[40px]" />}
        />
      </div>

      {/* 완료 버튼 */}
      {isEdit && (
        <button
          onClick={handleSave}
          className="w-full mt-[36px] py-[14px] rounded-[5px] text-[16px] font-medium bg-primary-500 text-white transition-colors hover:bg-primary-600">
          완료
        </button>
      )}
    </div>
  );
};

export default BudgetSummaryPage;
