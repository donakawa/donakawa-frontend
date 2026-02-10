import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useOutletContext } from 'react-router-dom';

import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import Step4 from './components/Step4';
import Step5 from './components/Step5';
import Step6 from './components/Step6';
import ProgressBar from './components/ProgressBar';

import { type HeaderControlContext } from '@/layouts/ProtectedLayout';

const BudgetSettingPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 6;
  const [direction, setDirection] = useState(0);

  const { setCustomBack, setRightAction } = useOutletContext<HeaderControlContext>();

  useEffect(() => {
    setCustomBack(prevStep);

    if (1 === step || step > 4) {
      setRightAction(null);
    } else if (step) {
      setRightAction({
        label: '건너뛰기',
        onClick: nextStep,
      });
    }
  }, [step]);

  const nextStep = () => {
    if (step === TOTAL_STEPS) {
      navigate('/budget/result');
      return;
    }
    setDirection(1);
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (step === 1) {
      navigate(-1);
      return;
    }
    setDirection(-1);
    setStep((prev) => prev - 1);
  };

  // 애니메이션 설정값
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 500 : -500,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 500 : -500,
      opacity: 0,
    }),
  };

  return (
    <div className="h-screen flex flex-col">
      <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
      <div className="flex-1 relative">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute w-full h-full">
            {step === 1 && <Step1 onNext={nextStep} />}
            {step === 2 && <Step2 onNext={nextStep} />}
            {step === 3 && <Step3 onNext={nextStep} />}
            {step === 4 && <Step4 onNext={nextStep} />}
            {step === 5 && <Step5 onNext={nextStep} />}
            {step === 6 && <Step6 onNext={nextStep} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
export default BudgetSettingPage;
