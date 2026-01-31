import CheckOnIcon from '@/assets/check_on.svg?react';
import CheckOffIcon from '@/assets/check_off.svg?react';

interface ChecklistItemProps {
  text: string;
  isSelected: boolean;
  onCheckClick: (e: React.MouseEvent) => void;
  onTextClick?: () => void;
  isCustom?: boolean;
  isEditing?: boolean;
  customInput?: string;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputBlur?: () => void;
  onInputKeyDown?: (e: React.KeyboardEvent) => void;
}

const ChecklistItem = ({
  text,
  isSelected,
  onCheckClick,
  onTextClick,
  isCustom,
  isEditing,
  customInput,
  onInputChange,
  onInputBlur,
  onInputKeyDown
}: ChecklistItemProps) => {
  return (
    <div 
      className={`flex flex-row justify-center items-center p-[10px_18px] gap-[10px] w-[273px] h-[41px] bg-white rounded-[6px] transition-all border shrink-0
        ${isSelected 
          ? 'border-[color:var(--color-primary-600)] shadow-[0_0_4px_rgba(104,171,110,0.25)]' 
          : 'border-transparent shadow-[0_0_4px_rgba(0,0,0,0.25)]'}`}
    >
      <div className="flex flex-row items-center gap-[8px] w-[247px] h-[21px]">
        {/* Checkbox 영역 */}
        <div onClick={onCheckClick} className="shrink-0 cursor-pointer flex items-center justify-center w-[18px] h-[18px]">
          {isSelected ? <CheckOnIcon width={18} height={18} /> : <CheckOffIcon width={18} height={18} />}
        </div>

        {/* 텍스트 영역*/}
        <div onClick={onTextClick} className="flex-1 flex items-center h-full cursor-pointer overflow-hidden">
          {isCustom && isEditing ? (
            <input
              type="text"
              maxLength={10}
              value={customInput}
              onChange={onInputChange}
              onBlur={onInputBlur}
              onKeyDown={onInputKeyDown}
              className="w-full bg-transparent text-[14px] leading-[150%] text-black outline-none border-none p-0"
              autoFocus
            />
          ) : (
            <span className={`text-[14px] leading-[150%] truncate ${isSelected || (isCustom && customInput) ? 'text-black font-medium' : isCustom ? 'text-[color:var(--color-gray-600)]' : 'text-black'}`}>
              {isCustom ? (customInput || text) : text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChecklistItem;