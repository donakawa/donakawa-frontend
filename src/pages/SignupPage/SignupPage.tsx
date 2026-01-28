import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack } from 'react-icons/io5';
import Step1Email from './components/Step1Email';
import Step2Password from './components/Step2Password';
import Step3Nickname from './components/Step3Nickname';
import Step4Goal from './components/Step4Goal';

const SignupPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handleBack = () => {
    if (step === 1) {
      navigate(-1);
    } else {
      setStep(step - 1);
    }
  };

  return (
    // 전체 컨테이너
    <div className="flex min-h-screen flex-col items-center bg-white px-6 pt-4">
      
      {/* 1. 상단 네비게이션 (높이와 너비 고정) */}
      <div className="relative mb-8 flex w-full max-w-sm items-center justify-center py-4 ">
        {/* 뒤로가기 버튼: absolute로 왼쪽 끝에 고정 */}
        <button 
          onClick={handleBack} 
          className="absolute left-0 p-2 text-2xl text-gray-800"
        >
          <IoChevronBack />
        </button>

        {/* 진행 상태 바: 중앙 정렬 */}
        <div className="flex gap-1.5">
          {[1, 2, 3].map((num) => (
            <div 
              key={num}
              className={`h-1.5 w-10 rounded-full transition-colors ${
                step >= num ? 'bg-primary-brown-300' : 'bg-gray-200'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* 2. 단계별 컴포넌트 */}
      {step === 1 && <Step1Email onNext={() => setStep(2)} />}
      {step === 2 && <Step2Password onNext={() => setStep(3)} />}
      {step === 3 && <Step3Nickname onNext={() => setStep(4)} />}
      {step === 4 && <Step4Goal />}
      
    </div>
  );
};

export default SignupPage;