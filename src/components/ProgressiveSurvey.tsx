import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  getChatQuestion,
  getChatResult,
  postChatSelect,
  type ChatQuestionInProgress,
  type ChatQuestionOption,
  type ChatQuestionResponse,
  type ChatResult,
} from '@/apis/AIChatPage/aichat';

type ChatQuestionShown = {
  step: number;
  question: string;
  options: ChatQuestionOption[];
};

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
    return {
      title: '구매 추천',
      border: 'border-[rgba(104,171,110,1)]',
      header: 'bg-[rgba(104,171,110,1)]',
    };
  }
  return {
    title: '구매 보류',
    border: 'border-[rgba(255,86,82,1)]',
    header: 'bg-[rgba(255,86,82,1)]',
  };
}

export default function ProgressiveSurvey({ chatId }: Props) {
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

  const timerRefs = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timerRefs.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const fetchQuestion = useCallback(async (): Promise<void> => {
    setIsTyping(true);

    try {
      const q = await getChatQuestion(chatId);

      if (!isInProgress(q)) {
        setCurrent(null);
        setIsDone(true);

        const t1 = window.setTimeout(() => {
          setIsTyping(false);
          void fetchResult();
        }, 500);
        timerRefs.current.push(t1);

        return;
      }

      const next: ChatQuestionShown = { step: q.step, question: q.question, options: q.options };
      setCurrent(next);

      setShown((prev) => (prev.some((p) => p.step === next.step) ? prev : [...prev, next]));

      const t2 = window.setTimeout(() => setIsTyping(false), 700);
      timerRefs.current.push(t2);
    } catch (e: unknown) {
      setIsTyping(false);
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
