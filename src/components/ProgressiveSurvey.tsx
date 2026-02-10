import React, { useState, useRef, useEffect } from 'react';

type Option = string;

export interface SurveyQuestion {
  id: number;
  question: string;
  options: Option[];
}

interface ProgressiveSurveyProps {
  questions: SurveyQuestion[];
  onComplete?: (answers: Record<number, number>) => void;
}

// 로딩중
const LoadingBubble = () => (
  <div className="mb-1">
    <div className="self-start bg-primary-400/30 px-[13px] py-[12px] rounded-[10px] rounded-tl-none inline-flex items-center gap-[8px] shadow-sm">
      <div className="w-[6px] h-[6px] bg-primary-600 rounded-full animate-[bounce_1.4s_infinite_0ms]" />
      <div className="w-[6px] h-[6px] bg-primary-600 rounded-full animate-[bounce_1.4s_infinite_200ms]" />
      <div className="w-[6px] h-[6px] bg-primary-600 rounded-full animate-[bounce_1.4s_infinite_400ms]" />
    </div>
  </div>
);

// 결과 화면: 구매 보류/추천
interface PurchaseResultProps {
  status: 'RECOMMEND' | 'HOLD';
  children: React.ReactNode;
}

const PurchaseResult = ({ status, children }: PurchaseResultProps) => {
  const isRecommend = status === 'RECOMMEND';

  const config = isRecommend
    ? {
        // 추천
        borderColor: 'border-[#7986CB]',
        headerBg: 'bg-[#5C6BC0]',
        title: '구매 추천',
      }
    : {
        // 보류
        borderColor: 'border-[#81C784]',
        headerBg: 'bg-[#66A478]',
        title: '구매 보류',
      };

  return (
    <div className="animate-fade-in-up ">
      <div className={`rounded-[10px] p-[12px] bg-secondary-100 overflow-hidden border-[2px] ${config.borderColor}`}>
        <div
          className={`${config.headerBg} py-[5px] px-[12px] mb-[10px] rounded-[10px] flex items-center justify-between text-white`}>
          <span className="text-[15px]">★</span>
          <span className="font-semibold text-[16px] tracking-wide">{config.title}</span>
          <span className="text-[15px]">★</span>
        </div>

        {/* 본문 */}
        <div className={`bg-secondary-100 `}>
          <div className="text-[14px] leading-[1.5] ">{children}</div>
        </div>
      </div>
    </div>
  );
};

// main
export default function ProgressiveSurvey({ questions, onComplete }: ProgressiveSurveyProps) {
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isTyping, setIsTyping] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTyping(false);
      setStep(0);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSelect = (questionIndex: number, optionIndex: number) => {
    const newAnswers = { ...answers, [questionIndex]: optionIndex };
    setAnswers(newAnswers);

    if (step === questionIndex && step < questions.length) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const nextStep = step + 1;
        setStep(nextStep);

        if (nextStep === questions.length && onComplete) {
          onComplete(newAnswers);
        }
      }, 1000);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [step, isTyping]);

  const renderResult = () => {
    // 일단 첫번째 선택하면 보류 (나중 API 연동시 수정)
    if (answers[0] === 0) {
      return (
        <PurchaseResult status="HOLD">
          현재 남은 예산이 1,000원인 상황에서 238,400원인 상품을 구매하기 위해서는 추가적인 예산이 필요하나, 예산
          갱신까지 10일의 기간이 남아 있어 즉시 구매하기에는 무리가 있으므로, 이를 감안할 때 구매를 당장 진행하기보다는
          예산이 갱신된 이후에 재검토하는 것이 바람직합니다.
        </PurchaseResult>
      );
    } else {
      return (
        <PurchaseResult status="RECOMMEND">
          사용자의 소비 패턴과 현재 옷장의 상태를 분석한 결과, 이 아이템은 활용도가 매우 높을 것으로 예상됩니다. 특히 주
          3회 이상 착용이 가능하여 '가성비' 측면에서 훌륭한 선택입니다. 이번 기회에 구매하시는 것을 강력 추천합니다!
        </PurchaseResult>
      );
    }
  };

  return (
    <div className="w-[267px] flex flex-col">
      {questions.map((q, index) => {
        if (index > step) return null;
        const isCurrent = index === step;

        return (
          <div
            key={q.id}
            className={`mb-[12px] transition-opacity duration-500 ease-in-out ${isCurrent && !isTyping ? 'opacity-100' : 'opacity-80 pointer-events-none'}`}>
            <div className="p-[12px] bg-secondary-100 rounded-[10px] shadow-sm border-[2px] border-primary-500">
              <div className="text-[14px] mb-[20px]">{q.question}</div>
              <div className="flex flex-col gap-[10px]">
                {q.options.map((option, optIdx) => {
                  const isSelected = answers[index] === optIdx;
                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelect(index, optIdx)}
                      disabled={!isCurrent || isTyping}
                      className={`w-full text-left px-[10px] py-[6px] border-[2px] 
                        rounded-full text-[12px] transition-all duration-200
                        ${isSelected ? 'bg-primary-500 text-white font-medium border-primary-300' : 'bg-white hover:bg-gray-50 border-gray-100'}`}>
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {isTyping && <LoadingBubble />}

      {!isTyping && step === questions.length && renderResult()}

      <div ref={bottomRef} className="h-[1px]" />
    </div>
  );
}
