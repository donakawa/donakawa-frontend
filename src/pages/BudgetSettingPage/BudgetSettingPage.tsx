import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';

import { postBudget, type SetBudgetRequest } from '@/apis/BudgetPage/budget';

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

  const { setCustomBack, setRightAction, setTitle } = useOutletContext<HeaderControlContext>();

  const [budgetData, setBudgetData] = useState<Partial<SetBudgetRequest>>({});

  const updateData = (key: keyof SetBudgetRequest, value: number) => {
    setBudgetData((prev) => ({ ...prev, [key]: value }));
  };

  const { mutate: submitBudget } = useMutation({
    mutationFn: postBudget,
    onSuccess: () => {
      navigate('/budget/result');
    },
    onError: (error) => {
      console.error(error);
      alert('예산 설정 중 오류가 발생했습니다. (이미 등록된 예산인지 확인해주세요)');
    },
  });

  const prevStep = useCallback(() => {
    if (step === 1) {
      navigate(-1);
      return;
    }
    setDirection(-1);
    setStep((prev) => prev - 1);
  }, [step, navigate]);

  const nextStep = useCallback(() => {
    setDirection(1);
    setStep((prev) => prev + 1);
  }, [step, budgetData, submitBudget, navigate, TOTAL_STEPS]);

  useEffect(() => {
    setTitle('목표 예산 설정');

    setCustomBack(prevStep);

    if (step === 1 || step > 4) {
      setRightAction(null);
    } else {
      setRightAction({
        rightNode: '건너뛰기',
        onClick: nextStep,
      });
    }
  }, [step, setTitle, setCustomBack, setRightAction, prevStep, nextStep]);

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
            transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            className="absolute w-full h-full">
            {step === 1 && (
              <Step1
                onNext={(val) => {
                  updateData('monthlyIncome', val);
                  nextStep();
                }}
                defaultValue={budgetData.monthlyIncome}
              />
            )}

            {step === 2 && (
              <Step2
                onNext={(val) => {
                  updateData('incomeDate', val);
                  nextStep();
                }}
                defaultValue={budgetData.incomeDate}
              />
            )}

            {step === 3 && (
              <Step3
                onNext={(val) => {
                  updateData('fixedExpense', val);
                  nextStep();
                }}
                defaultValue={budgetData.fixedExpense}
              />
            )}

            {step === 4 && (
              <Step4
                onNext={(val) => {
                  updateData('monthlySaving', val);
                  nextStep();
                }}
                defaultValue={budgetData.monthlySaving}
              />
            )}
            {step === 5 && (
              <Step5
                onNext={(val) => {
                  updateData('spendStrategy', val);
                  nextStep();
                }}
                defaultValue={budgetData.spendStrategy}
              />
            )}
            {step === 6 && (
              <Step6
                onNext={(val) => {
                  updateData('shoppingBudget', val);

                  const finalData = {
                    ...budgetData,
                    shoppingBudget: val,
                  };

                  const cleanData = Object.fromEntries(
                    Object.entries(finalData).filter(
                      ([_, value]) => value !== 0 && value !== undefined && value !== null,
                    ),
                  );
                  submitBudget(cleanData as unknown as SetBudgetRequest);
                }}
                defaultValue={budgetData.shoppingBudget}
                prevData={budgetData}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
export default BudgetSettingPage;
