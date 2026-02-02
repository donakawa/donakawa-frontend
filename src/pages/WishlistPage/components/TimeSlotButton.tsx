interface TimeSlotButtonProps {
  label: string;
  range: string;
  Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  isSelected: boolean;
  onClick: () => void;
}

const TimeSlotButton = ({ label, range, Icon, isSelected, onClick }: TimeSlotButtonProps) => {
  return (
    <button 
      key={label}
      onClick={onClick} 
      style={isSelected ? { boxShadow: '0 0 3.61px #68AB6E' } : {}} 
      className={`w-[273px] h-[90px] px-[14px] py-[8px] rounded-[9.03px] border-[1.5px] flex items-center justify-between transition-all shrink-0 
      ${isSelected ? "border-[color:var(--color-primary-500)] bg-[color:var(--color-primary-100)]" : "border-[color:var(--color-gray-100)] bg-white shadow-sm"}`}
    >
      <div className="flex items-center gap-[20px] text-left">
        <span className="text-[20px] font-semibold text-black">{label}</span>
        <span className="text-[12px] text-[#999999]">{range}</span>
      </div>
      <Icon width={60} height={60} />
    </button>
  );
};

export default TimeSlotButton;