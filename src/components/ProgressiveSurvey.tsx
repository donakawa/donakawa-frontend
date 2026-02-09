// import React, { useState, useRef, useEffect } from 'react';

// type Option = string;

// export interface SurveyQuestion {
//   id: number;
//   question: string;
//   options: Option[];
// }

// interface ProgressiveSurveyProps {
//   questions: SurveyQuestion[];
//   onComplete?: (answers: Record<number, number>) => void;
// }

// // 로딩중
// const LoadingBubble = () => (
//   <div className="mb-1">
//     <div className="self-start bg-primary-400/30 px-[13px] py-[12px] rounded-[10px] rounded-tl-none inline-flex items-center gap-[8px] shadow-sm">
//       <div className="w-[6px] h-[6px] bg-primary-600 rounded-full animate-[bounce_1.4s_infinite_0ms]" />
//       <div className="w-[6px] h-[6px] bg-primary-600 rounded-full animate-[bounce_1.4s_infinite_200ms]" />
//       <div className="w-[6px] h-[6px] bg-primary-600 rounded-full animate-[bounce_1.4s_infinite_400ms]" />
//     </div>
//   </div>
// );

// // 결과 화면: 구매 보류/추천
// interface PurchaseResultProps {
//   status: 'RECOMMEND' | 'HOLD';
//   children: React.ReactNode;
// }

// const PurchaseResult = ({ status, children }: PurchaseResultProps) => {
//   const isRecommend = status === 'RECOMMEND';

//   const config = isRecommend
//     ? {
//         // 추천
//         borderColor: 'border-[#7986CB]',
//         headerBg: 'bg-[#5C6BC0]',
//         title: '구매 추천',
//       }
//     : {
//         // 보류
//         borderColor: 'border-[#81C784]',
//         headerBg: 'bg-[#66A478]',
//         title: '구매 보류',
//       };

//   return (
//     <div className="animate-fade-in-up ">
//       <div className={`rounded-[10px] p-[12px] bg-secondary-100 overflow-hidden border-[2px] ${config.borderColor}`}>
//         <div
//           className={`${config.headerBg} py-[5px] px-[12px] mb-[10px] rounded-[10px] flex items-center justify-between text-white`}>
//           <span className="text-[15px]">★</span>
//           <span className="font-semibold text-[16px] tracking-wide">{config.title}</span>
//           <span className="text-[15px]">★</span>
//         </div>

//         {/* 본문 */}
//         <div className={`bg-secondary-100 `}>
//           <div className="text-[14px] leading-[1.5] ">{children}</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // main
// export default function ProgressiveSurvey({ questions, onComplete }: ProgressiveSurveyProps) {
//   const [step, setStep] = useState(-1);
//   const [answers, setAnswers] = useState<Record<number, number>>({});
//   const [isTyping, setIsTyping] = useState(true);

//   const bottomRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsTyping(false);
//       setStep(0);
//     }, 1000);
//     return () => clearTimeout(timer);
//   }, []);

//   const handleSelect = (questionIndex: number, optionIndex: number) => {
//     const newAnswers = { ...answers, [questionIndex]: optionIndex };
//     setAnswers(newAnswers);

//     if (step === questionIndex && step < questions.length) {
//       setIsTyping(true);
//       setTimeout(() => {
//         setIsTyping(false);
//         const nextStep = step + 1;
//         setStep(nextStep);

//         if (nextStep === questions.length && onComplete) {
//           onComplete(newAnswers);
//         }
//       }, 1000);
//     }
//   };

//   useEffect(() => {
//     bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
//   }, [step, isTyping]);

//   const renderResult = () => {
//     // 일단 첫번째 선택하면 보류 (나중 API 연동시 수정)
//     if (answers[0] === 0) {
//       return (
//         <PurchaseResult status="HOLD">
//           현재 남은 예산이 1,000원인 상황에서 238,400원인 상품을 구매하기 위해서는 추가적인 예산이 필요하나, 예산
//           갱신까지 10일의 기간이 남아 있어 즉시 구매하기에는 무리가 있으므로, 이를 감안할 때 구매를 당장 진행하기보다는
//           예산이 갱신된 이후에 재검토하는 것이 바람직합니다.
//         </PurchaseResult>
//       );
//     } else {
//       return (
//         <PurchaseResult status="RECOMMEND">
//           사용자의 소비 패턴과 현재 옷장의 상태를 분석한 결과, 이 아이템은 활용도가 매우 높을 것으로 예상됩니다. 특히 주
//           3회 이상 착용이 가능하여 '가성비' 측면에서 훌륭한 선택입니다. 이번 기회에 구매하시는 것을 강력 추천합니다!
//         </PurchaseResult>
//       );
//     }
//   };

//   return (
//     <div className="w-[267px] flex flex-col">
//       {questions.map((q, index) => {
//         if (index > step) return null;
//         const isCurrent = index === step;

//         return (
//           <div
//             key={q.id}
//             className={`mb-[12px] transition-opacity duration-500 ease-in-out ${isCurrent && !isTyping ? 'opacity-100' : 'opacity-80 pointer-events-none'}`}>
//             <div className="p-[12px] bg-secondary-100 rounded-[10px] shadow-sm border-[2px] border-primary-500">
//               <div className="text-[14px] mb-[20px]">{q.question}</div>
//               <div className="flex flex-col gap-[10px]">
//                 {q.options.map((option, optIdx) => {
//                   const isSelected = answers[index] === optIdx;
//                   return (
//                     <button
//                       key={optIdx}
//                       onClick={() => handleSelect(index, optIdx)}
//                       disabled={!isCurrent || isTyping}
//                       className={`w-full text-left px-[10px] py-[6px] border-[2px]
//                         rounded-full text-[12px] transition-all duration-200
//                         ${isSelected ? 'bg-primary-500 text-white font-medium border-primary-300' : 'bg-white hover:bg-gray-50 border-gray-100'}`}>
//                       {option}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//           </div>
//         );
//       })}

//       {isTyping && <LoadingBubble />}

//       {!isTyping && step === questions.length && renderResult()}

//       <div ref={bottomRef} className="h-[1px]" />
//     </div>
//   );
// }

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  getChatQuestion,
  getChatResult,
  postChatSelect,
  type ChatQuestionInProgress,
  type ChatQuestionOption,
  type ChatQuestionResponse,
  type ChatResult,
} from '@/apis/HomePage/aichat';

type ChatQuestionShown = {
  step: number;
  question: string;
  options: ChatQuestionOption[];
};

type LoadState = 'idle' | 'loading' | 'success' | 'error';

type Props = {
  chatId: number;
};

function isInProgress(q: ChatQuestionResponse): q is ChatQuestionInProgress {
  return (q as ChatQuestionInProgress).step !== undefined && Array.isArray((q as ChatQuestionInProgress).options);
}

type ResultState = { kind: 'none' } | { kind: 'success'; data: ChatResult } | { kind: 'error'; message: string };

export const LoadingBubble = () => (
  <div className="mb-1">
    <div className="self-start inline-flex items-center gap-[8px] rounded-[10px] rounded-tl-none bg-primary-400/30 px-[13px] py-[12px] shadow-sm">
      <div className="h-[6px] w-[6px] animate-[bounce_1.4s_infinite_0ms] rounded-full bg-primary-600" />
      <div className="h-[6px] w-[6px] animate-[bounce_1.4s_infinite_200ms] rounded-full bg-primary-600" />
      <div className="h-[6px] w-[6px] animate-[bounce_1.4s_infinite_400ms] rounded-full bg-primary-600" />
    </div>
  </div>
);

function decisionToUi(decision: string): { title: string; border: string; header: string } {
  if (decision.includes('추천')) {
    return { title: '구매 추천', border: 'border-[#7986CB]', header: 'bg-[#5C6BC0]' };
  }
  return { title: '구매 보류', border: 'border-[#81C784]', header: 'bg-[#66A478]' };
}

export default function ProgressiveSurvey({ chatId }: Props) {
  const [loadState, setLoadState] = useState<LoadState>('idle');

  const [shown, setShown] = useState<ChatQuestionShown[]>([]);
  const [current, setCurrent] = useState<ChatQuestionShown | null>(null);
  const [selectedByStep, setSelectedByStep] = useState<Record<number, number>>({});

  const [isTyping, setIsTyping] = useState<boolean>(true);
  const [isDone, setIsDone] = useState<boolean>(false);

  const [resultState, setResultState] = useState<ResultState>({ kind: 'none' });

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, []);

  const fetchResult = useCallback(async (): Promise<void> => {
    try {
      const r = await getChatResult(chatId);
      setResultState({ kind: 'success', data: r });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '최종 판단을 불러오지 못했어요.';
      setResultState({ kind: 'error', message: msg });
    }
  }, [chatId]);

  const fetchQuestion = useCallback(async (): Promise<void> => {
    setLoadState('loading');
    setIsTyping(true);

    try {
      const q = await getChatQuestion(chatId);

      if (!isInProgress(q)) {
        setCurrent(null);
        setIsDone(true);

        window.setTimeout(() => {
          setIsTyping(false);
          void fetchResult();
        }, 500);

        setLoadState('success');
        return;
      }

      const next: ChatQuestionShown = { step: q.step, question: q.question, options: q.options };
      setCurrent(next);

      setShown((prev) => (prev.some((p) => p.step === next.step) ? prev : [...prev, next]));

      window.setTimeout(() => setIsTyping(false), 700);
      setLoadState('success');
    } catch (e: unknown) {
      setIsTyping(false);
      setLoadState('error');
      setResultState({ kind: 'error', message: e instanceof Error ? e.message : '질문을 불러오지 못했어요.' });
    }
  }, [chatId, fetchResult]);

  useEffect(() => {
    void fetchQuestion();
  }, [fetchQuestion]);

  useEffect(() => {
    scrollToBottom();
  }, [shown.length, current?.step, isTyping, isDone, resultState.kind, scrollToBottom]);

  const allCards = useMemo(() => {
    const map = new Map<number, ChatQuestionShown>();
    for (const s of shown) map.set(s.step, s);
    if (current) map.set(current.step, current);
    return Array.from(map.values()).sort((a, b) => a.step - b.step);
  }, [shown, current]);

  const pickedCurrent = useMemo(() => {
    if (!current) return false;
    return selectedByStep[current.step] !== undefined;
  }, [current, selectedByStep]);

  const isAwaitingPick = Boolean(current) && !isDone && !pickedCurrent;

  const handlePick = useCallback(
    async (q: ChatQuestionShown, option: ChatQuestionOption) => {
      if (selectedByStep[q.step] === option.id) return;

      setSelectedByStep((prev) => ({ ...prev, [q.step]: option.id }));

      try {
        setIsTyping(true);
        await postChatSelect(chatId, { step: q.step, selectedOptionId: option.id });
        await fetchQuestion();
      } catch (e: unknown) {
        setIsTyping(false);
        setLoadState('error');
        setResultState({ kind: 'error', message: e instanceof Error ? e.message : '선택 저장에 실패했어요.' });
      }
    },
    [chatId, fetchQuestion, selectedByStep],
  );

  return (
    <div className="flex w-[267px] flex-col">
      {allCards.map((q) => {
        const isCurrent = current?.step === q.step && !isDone;

        return (
          <div key={q.step} className="mb-[12px] transition-opacity duration-300 ease-in-out">
            <div className="rounded-[10px] border-[2px] border-primary-500 bg-secondary-100 p-[12px] shadow-sm">
              <div className="mb-[20px] text-[14px]">{q.question}</div>

              <div className="flex flex-col gap-[10px]">
                {q.options.map((opt) => {
                  const picked = selectedByStep[q.step] === opt.id;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => void handlePick(q, opt)}
                      disabled={!isCurrent || isTyping || isDone}
                      className={[
                        'w-full rounded-full border-[2px] px-[10px] py-[6px] text-left text-[12px] transition-all duration-200',
                        picked
                          ? 'border-primary-300 bg-primary-500 font-medium text-white'
                          : 'border-gray-100 bg-white hover:bg-gray-50',
                        !isCurrent || isTyping || isDone ? 'opacity-80' : 'opacity-100',
                      ].join(' ')}>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {!isDone && (isTyping || isAwaitingPick) && <LoadingBubble />}

      {isDone && (
        <div className="mt-1">
          {resultState.kind === 'none' && <LoadingBubble />}

          {resultState.kind === 'success' &&
            (() => {
              const ui = decisionToUi(resultState.data.decision);
              return (
                <div className="animate-fade-in-up">
                  <div className={`overflow-hidden rounded-[10px] border-[2px] bg-secondary-100 p-[12px] ${ui.border}`}>
                    <div
                      className={`${ui.header} mb-[10px] flex items-center justify-between rounded-[10px] px-[12px] py-[5px] text-white`}>
                      <span className="text-[15px]">★</span>
                      <span className="text-[16px] font-semibold tracking-wide">{ui.title}</span>
                      <span className="text-[15px]">★</span>
                    </div>

                    <div className="text-[14px] leading-[1.5]">{resultState.data.message}</div>
                  </div>
                </div>
              );
            })()}

          {resultState.kind === 'error' && (
            <div className="rounded-[10px] border border-red-200 bg-white p-3 text-[12px] text-red-600">
              <div className="font-semibold">최종 판단을 불러오지 못했어요.</div>
              <div className="mt-1 opacity-90">{resultState.message}</div>

              <button
                type="button"
                onClick={() => void fetchResult()}
                className="mt-3 rounded-full border border-red-200 bg-white px-3 py-1 text-[12px] font-medium text-red-600">
                다시 시도
              </button>
            </div>
          )}
        </div>
      )}

      <div ref={bottomRef} className="h-[1px]" />
    </div>
  );
}
