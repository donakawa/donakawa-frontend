export interface CalendarDay {
  dayLabel: string;
  dateNum: string;
  fullDate: Date;
  isFuture: boolean;
  dayIndex: number;
}

interface CalendarStripProps {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  calendarDays: CalendarDay[];
  selectedFullDate: Date;
  onDateSelect: (date: Date) => void;
  today: Date;
}

const CalendarStrip = ({ 
  scrollRef, 
  calendarDays, 
  selectedFullDate, 
  onDateSelect, 
  today 
}: CalendarStripProps) => {
  return (
    <div 
      ref={scrollRef} 
      className="flex gap-[8px] w-full overflow-x-auto no-scrollbar whitespace-nowrap pb-4 shrink-0 px-[32px]"
    >
      {calendarDays.map((item, idx) => {
        const isSelected = selectedFullDate.toDateString() === item.fullDate.toDateString();
        const isToday = item.fullDate.toDateString() === today.toDateString();
        const isSunOrSat = item.dayIndex === 0 || item.dayIndex === 6;

        return (
          <button
            type="button"
            key={idx}
            onClick={() => {
              if (!item.isFuture) onDateSelect(item.fullDate);
            }}
            disabled={item.isFuture}
            aria-disabled={item.isFuture}
            className={`flex flex-col items-center gap-[4px] min-w-[30px] ${
              item.isFuture ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
            } ${isSelected ? 'is-selected' : ''} ${isToday ? 'is-today' : ''}`}
          >
            <span className={`text-[14px] ${isSunOrSat ? 'text-[color:var(--color-error)]' : 'text-black'}`}>
              {item.dayLabel}
            </span>
            <div className={`w-[29px] h-[29px] rounded-full flex items-center justify-center text-[16px] transition-colors
              ${isSelected ? "bg-[color:var(--color-primary-600)] text-white" : "text-black hover:bg-gray-100"}`}>
              {item.dateNum}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default CalendarStrip;