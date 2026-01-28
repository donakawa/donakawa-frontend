import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DonaIcon from '@/assets/ai_dona.svg?react';
import CloseArrow from '@/assets/ai_close_arrow.svg?react';
import OpenArrow from '@/assets/ai_open_arrow.svg?react';

const DonaAiBanner = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const navigate = useNavigate();

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  //우선 home
  const handleChatStart = () => {
    navigate('/home');
  };

  return (
    //배너
    <div 
      className={`
        relative top-[450px] flex items-center cursor-pointer overflow-hidden
        transition-all duration-500 ease-in-out bg-[color:var(--color-banner)] h-[72px] rounded-[100px]
        ${isExpanded ? 'left-[100px] w-[254px]' : 'left-[252px] w-[102px]'}
      `}
      onClick={handleChatStart}
    >
      {/* 화살표 버튼 */}
      <button 
        onClick={toggleExpand}
        className="absolute left-2 w-6 h-6 flex items-center justify-center z-20 cursor-pointer"
      >
        {isExpanded ? <CloseArrow /> : <OpenArrow />}
      </button>

      {/* 텍스트 */}
      <div className={`
        flex flex-col ml-[36px] whitespace-nowrap transition-opacity duration-300
        text-[12px] font-bold tracking-tighter font-galmuri
        ${isExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}>
        <span>
          구매가 고민될 때,
        </span>
        <span>
          도나AI와 상담은 어때요?
        </span>
      </div>

      <div className="absolute right-0 w-[72px] h-[72px]">
        <DonaIcon />
      </div>
    </div>
  );
};

export default DonaAiBanner;