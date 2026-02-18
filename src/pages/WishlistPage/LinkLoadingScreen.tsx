import { useState, useEffect } from 'react';

export default function LinkLoadingScreen() {
  const [step, setStep] = useState(1);

  const getLoadingImage = (stepNum: number) => {
    return new URL(`../../assets/loading_${stepNum}.png`, import.meta.url).href;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev >= 5 ? 1 : prev + 1));
    }, 200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-[200] bg-white flex flex-col items-center justify-center">
      <div className="relative w-[240px] h-[240px] mb-8">
        <img 
          src={getLoadingImage(step)} 
          alt="loading animation" 
          className="w-full h-full object-contain"
        />
      </div>
      <p className="text-[16px] font-medium text-[color:var(--color-gray-900)] tracking-tight">
        위시템 정보를 가져오는 중입니다
      </p>
    </div>
  );
}