import React from 'react';

interface InfoItemProps {
  label: string;
  value: number;
  isEdit: boolean;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

const InfoItem = ({ label, value, isEdit, onChange, icon }: InfoItemProps) => {
  const safeValue = Number(value) || 0;
  const isZero = safeValue === 0;

  return (
    <div className="w-full">
      {isEdit ? (
        <div className="flex flex-col gap-[6px]">
          <span className="text-[14px] text-gray-600">{label}</span>
          <input
            type="text"
            inputMode="numeric"
            value={safeValue.toLocaleString()}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-[18px] py-[12px] rounded-[6px] text-[14px] border-[2px] 
            border-gray-100 focus:border-primary-500 outline-none transition-colors bg-white"
          />
        </div>
      ) : (
        <div className="flex items-center w-full gap-[16px] ">
          {icon && <div>{icon}</div>}
          <div className="flex flex-col gap-[2px]">
            <span className="text-[14px] text-gray-600">{label}</span>
            <span className={`text-[20px] font-semibold ${isZero ? 'text-primary-brown-400' : 'text-primary-600'}`}>
              {!isZero && '+ '}
              {safeValue.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
export default InfoItem;
