import { useState, useMemo, useRef, useEffect } from 'react';
import CloseButton from '@/assets/close.svg?react';
import SunIcon from '@/assets/SunIcon.svg?react';
import MoonIcon from '@/assets/MoonIcon.svg?react';
import DawnMoonIcon from '@/assets/DawnMoonIcon.svg?react';
import ChecklistItem from './ChecklistItem';
import ProgressBar from './ProgressBar';
import TimeSlotButton from './TimeSlotButton';
import CalendarStrip from './CalendarStrip';

interface PurchaseReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const PurchaseReasonModal = ({ isOpen, onClose, onComplete }: PurchaseReasonModalProps) => {
  const [step, setStep] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Step 1 상태 ---
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState<string>("");
  const [isCustomSelected, setIsCustomSelected] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // --- Step 2 상태 ---
  const [viewDate, setViewDate] = useState(new Date()); 
  const [selectedFullDate, setSelectedFullDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const resetState = () => {
    setStep(1);
    setSelectedItems([]);
    setCustomInput("");
    setIsCustomSelected(false);
    setIsEditing(false);
    setViewDate(new Date());
    setSelectedFullDate(new Date());
    setSelectedTime(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };
  
  const handleComplete = () => {
    resetState();
    onComplete();
  };

  // 캘린더 관련 useMemo
  const { calendarDays, today } = useMemo(() => {
    const now = new Date();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];

    const days = Array.from({ length: lastDay }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return {
        dayLabel: d.toDateString() === now.toDateString() ? "오늘" : dayLabels[d.getDay()],
        dateNum: (i + 1).toString().padStart(2, '0'),
        fullDate: d,
        isFuture: d.setHours(0,0,0,0) > now.setHours(0,0,0,0),
        dayIndex: d.getDay()
      };
    });
    return { calendarDays: days, today: now };
  }, [viewDate]);

  const isCurrentMonth = viewDate.getMonth() === today.getMonth() && viewDate.getFullYear() === today.getFullYear();
  
  const changeMonth = (offset: number) => {
    const nextMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    if (offset === 1 && nextMonth > today) return;
    setViewDate(nextMonth);
  };

  useEffect(() => {
    if (step === 2 && scrollRef.current) {
      requestAnimationFrame(() => {
        const target = scrollRef.current?.querySelector('.is-selected') || scrollRef.current?.querySelector('.is-today');
        if (target) {
          target.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
        }
      });
    }
  }, [step, viewDate]);

  if (!isOpen) return null;

  const isStep1Active = selectedItems.length > 0 || (isCustomSelected && customInput.trim() !== "");
  const options = ["필요해서", "세일 중이라", "기분 전환", "보상으로", "품절될 것 같아서", "선물용으로"];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="구매 기록 모달"
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 font-sans text-black"
    >
      <div className="w-[335px] h-[600px] bg-white rounded-[20px] relative shadow-xl overflow-hidden">
        
        <ProgressBar step={step} />
        <button onClick={handleClose} aria-label="닫기" className="absolute right-[19px] top-[13px] cursor-pointer z-10">
          <CloseButton width={24} height={24} />
        </button>

        <div className="absolute left-0 top-[68px] w-full h-[498px] flex flex-col items-center">
          {step === 1 ? (
            <>
              <div className="flex flex-col items-center gap-[15px] mb-[12px] shrink-0 w-full px-[31px]">
                <h2 className="text-[18px] font-semibold text-black text-center whitespace-nowrap">
                  구매를 결정한 이유는 무엇인가요?
                </h2>
                <p className="text-[color:var(--color-gray-600)] text-[14px] text-center shrink-0">(복수 선택 가능)</p>
              </div>

              <div className="flex flex-col gap-[10px] w-full overflow-y-auto no-scrollbar pb-2 px-[31px] py-2">
                {options.map((option) => {
                  const isSelected = selectedItems.includes(option);
                  return (
                    <ChecklistItem
                      key={option}
                      text={option}
                      isSelected={isSelected}
                      onCheckClick={(e) => {
                        e.stopPropagation();
                        if (isSelected) {
                          setSelectedItems(selectedItems.filter(i => i !== option));
                        } else {
                          setSelectedItems([...selectedItems, option]);
                        }
                      }}
                      onTextClick={() => {
                        if (isSelected) {
                          setSelectedItems(selectedItems.filter(i => i !== option));
                        } else {
                          setSelectedItems([...selectedItems, option]);
                        }
                      }}
                    />
                  );
                })}

                <ChecklistItem
                  text="직접 입력(최대 10자)"
                  isCustom
                  isSelected={isCustomSelected}
                  isEditing={isEditing}
                  customInput={customInput}
                  onCheckClick={(e) => {
                    e.stopPropagation();
                    setIsCustomSelected(!isCustomSelected);
                  }}
                  onTextClick={() => setIsEditing(true)}
                  onInputChange={(e) => setCustomInput(e.target.value)}
                  onInputBlur={() => setIsEditing(false)}
                  onInputKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                />
              </div>

              <button 
                disabled={!isStep1Active} 
                onClick={() => setStep(2)} 
                className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-[68px] h-[40px] rounded-[100px] text-white text-[16px] font-medium transition-all
                  ${isStep1Active ? "bg-[color:var(--color-primary-brown-300)] cursor-pointer" : "bg-[#C6C6C6] cursor-not-allowed"}`}
              >
                다음
              </button>
            </>
          ) : (
            <>
              <h2 className="text-[18px] font-semibold text-black leading-[150%] text-center mb-[15px] shrink-0 whitespace-nowrap px-[31px]">
                구매 시각은 대략 언제인가요?
              </h2>
              
              <div className="flex gap-[8px] mb-[20px] shrink-0 w-full justify-start pl-[32px]">
                <button onClick={() => changeMonth(-1)} className="text-[color:var(--color-gray-600)] font-bold cursor-pointer">{"<"}</button>
                <span className="text-[16px] font-medium text-[color:var(--color-gray-600)]">{viewDate.getMonth() + 1}월</span>
                <button 
                  onClick={() => changeMonth(1)} 
                  className={`font-bold transition-colors ${isCurrentMonth ? "text-[color:var(--color-gray-100)] cursor-default" : "text-[color:var(--color-gray-600)]"}`}
                >
                  {">"}
                </button>
              </div>

              <CalendarStrip 
                scrollRef={scrollRef}
                calendarDays={calendarDays}
                selectedFullDate={selectedFullDate}
                onDateSelect={setSelectedFullDate}
                today={today}
              />

              <div className="flex flex-col gap-[10px] w-full items-center pb-4 shrink-0 overflow-y-auto no-scrollbar px-[31px]">
                {[
                  { id: 'day', label: '낮', range: '06:00~18:00', Icon: SunIcon },
                  { id: 'evening', label: '저녁', range: '18:00~24:00', Icon: MoonIcon },
                  { id: 'dawn', label: '새벽', range: '00:00~06:00', Icon: DawnMoonIcon }
                ].map((slot) => (
                  <TimeSlotButton 
                    key={slot.id}
                    label={slot.label}
                    range={slot.range}
                    Icon={slot.Icon}
                    isSelected={selectedTime === slot.id}
                    onClick={() => setSelectedTime(slot.id)}
                  />
                ))}
              </div>

              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-[10px] shrink-0">
                <button 
                  onClick={() => setStep(1)} 
                  className="w-[68px] h-[40px] rounded-full bg-[color:var(--color-primary-brown-300)] text-white text-[14px] font-medium cursor-pointer"
                >
                  이전
                </button>
                <button 
                  disabled={!selectedTime} 
                  onClick={handleComplete}
                  className={`w-[104px] h-[40px] rounded-full text-white text-[14px] font-medium transition-all 
                  ${selectedTime ? "bg-[color:var(--color-primary-brown-300)] shadow-md cursor-pointer" : "bg-[#C6C6C6] cursor-not-allowed"}`}
                >
                  기록 완료!
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseReasonModal;