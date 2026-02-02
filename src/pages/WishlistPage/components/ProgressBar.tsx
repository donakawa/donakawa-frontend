interface ProgressBarProps {
  step: number;
}

const ProgressBar = ({ step }: ProgressBarProps) => {
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-[21px] flex gap-[12px] w-[92px] h-[8px]">
      <div className="flex-1 bg-[color:var(--color-primary-brown-300)] rounded-full" />
      <div
        className={`flex-1 rounded-full transition-colors duration-300 ${
          step === 2 ? 'bg-[color:var(--color-primary-brown-300)]' : 'bg-[color:var(--color-gray-100)]'
        }`} 
      />
    </div>
  );
};

export default ProgressBar;