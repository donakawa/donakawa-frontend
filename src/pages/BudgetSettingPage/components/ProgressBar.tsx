interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar = ({ currentStep, totalSteps }: ProgressBarProps) => {
  return (
    <div className="flex gap-[12px] px-[37px] pt-[20px] justify-center">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isFilled = index + 1 <= currentStep;

        return (
          <div
            key={index}
            className={`h-[8px] flex-1 rounded-full transition-all duration-500 ease-out ${
              isFilled ? 'bg-primary-brown-300' : 'bg-gray-100'
            }`}
          />
        );
      })}
    </div>
  );
};

export default ProgressBar;
