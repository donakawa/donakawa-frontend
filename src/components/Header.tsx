import React from 'react';
import { useNavigate } from 'react-router-dom';
import Arrow from '@/assets/arrow.svg?react';

interface HeaderProps {
  title: string; // 제목
  onBackClick?: () => void; // 뒤로가기 커스텀 함수
  rightContent?: React.ReactNode; // 오른쪽에 표시할 내용
  onRightClick?: () => void; // 오른쪽 버튼 클릭 시 실행할 함수
}

const Header = ({ title, onBackClick, rightContent, onRightClick }: HeaderProps) => {
  const navigate = useNavigate();

  // 뒤로가기 핸들러
  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="w-full flex items-center justify-between px-[20px]">
      {/* 뒤로가기 */}
      <div className="flex items-center justify-center min-w-[40px]">
        <button onClick={handleBack} className="py-[9px] px-[4px] -ml-[4px]">
          <Arrow className="w-[12px] h-[22px] rotate-180" />
        </button>
      </div>

      {/* 제목 */}
      <div className="absolute left-1/2 transform -translate-x-1/2">
        <h1 className="text-[20px] font-semibold whitespace-nowrap">{title}</h1>
      </div>

      {/* 건너뛰기 버튼 */}
      <div className="flex items-center justify-end min-w-[40px]">
        {rightContent && (
          <button
            onClick={onRightClick}
            className="text-[14px] text-gray-500 active:text-gray-700 transition-colors whitespace-nowrap">
            {rightContent}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
