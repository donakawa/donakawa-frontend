// donaAIBanner.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DonaIcon from '@/assets/ai_dona.svg?react';
import CloseArrow from '@/assets/ai_close_arrow.svg?react';
import OpenArrow from '@/assets/ai_open_arrow.svg?react';

type Props = {
  /** 부모가 배너를 완전히 숨기고 싶을 때 호출 */
  onDismiss?: () => void;
};

const DonaAiBanner = React.forwardRef<HTMLDivElement, Props>(({ onDismiss }, ref) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();

  // 3초 후 배너 자동 접기(=접힌 상태로 남기기)
  useEffect(() => {
    const timer = window.setTimeout(() => setIsExpanded(false), 3000);
    return () => window.clearTimeout(timer);
  }, []);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  const handleChatStart = () => {
    // 클릭하면 다른 페이지로 가니까, 부모 배너도 숨겨주고 이동
    onDismiss?.();
    navigate('/home');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleChatStart();
    }
  };

  return (
    <div
      ref={ref}
      className={`
        absolute z-50 right-5 bottom-[88px]
        flex items-center cursor-pointer overflow-hidden
        transition-all duration-500 ease-in-out
        bg-[color:var(--color-banner)]
        h-[72px] rounded-[100px]
        shadow-[0_8px_18px_rgba(0,0,0,0.12)]
        ${isExpanded ? 'w-[254px]' : 'w-[102px]'}
      `}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="도나 AI 상담 시작"
      onClick={handleChatStart}
    >
      <button
        type="button"
        onClick={toggleExpand}
        className="absolute left-2 w-6 h-6 flex items-center justify-center z-20 cursor-pointer"
        aria-label={isExpanded ? '배너 접기' : '배너 펼치기'}
      >
        {isExpanded ? <CloseArrow /> : <OpenArrow />}
      </button>

      <div
        className={`
          flex flex-col ml-[36px] whitespace-nowrap transition-opacity duration-300
          text-[12px] font-bold tracking-tighter font-galmuri
          ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        <span>구매가 고민될 때,</span>
        <span>도나AI와 상담은 어때요?</span>
      </div>

      <div className="absolute right-0 w-[72px] h-[72px]">
        <DonaIcon />
      </div>
    </div>
  );
});

DonaAiBanner.displayName = 'DonaAiBanner';
export default DonaAiBanner;
