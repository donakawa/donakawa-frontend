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

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: '',
    goal: '',
  });

  const handleBack = () => {
    if (step === 1) {
      navigate(-1);
    } else {
      setStep(step - 1);
    }
  };

  // 다음 단계로 넘어가면서 데이터를 저장하는 함수
  const handleNext = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data })); // 기존 데이터에 새 데이터 합치기
    setStep((prev) => prev + 1);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-6 pt-4">
      {/* 상단 네비게이션 */}
      <div className="relative mb-8 flex w-full max-w-sm items-center justify-center py-4 ">
        <button 
          onClick={handleBack} 
          className="absolute left-0 p-2 text-2xl text-gray-800"
        >
          <IoChevronBack />
        </button>

        {/* 진행 상태 바 (Step 4에서는 숨김) */}
        {step < 4 && (
          <div className="flex gap-1.5">
            {[1, 2, 3].map((num) => (
              <div 
                key={num}
                className={`h-1.5 w-10 rounded-full transition-colors ${
                  step === num ? 'bg-primary-brown-300' : 'bg-gray-200'
                }`} 
              />
            ))}
          </div>
        )}
      </div>

      {/* 단계별 컴포넌트: onNext 할 때 데이터를 넘겨받음 */}
      {step === 1 && (
        <Step1Email onNext={(email) => handleNext({ email })} />
      )}
      {step === 2 && (
        <Step2Password onNext={(password) => handleNext({ password })} />
      )}
      {step === 3 && (
        <Step3Nickname onNext={(nickname) => handleNext({ nickname })} />
      )}
      {/* Step 4는 저장된 모든 데이터(formData)가 필요함 */}
      {step === 4 && (
        <Step4Goal formData={formData} />
      )}
    </div>
  );
};

export default SignupPage;