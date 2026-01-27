import { useState, useEffect, useCallback } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';

import House from '@/assets/house.svg?react';
import Cart from '@/assets/cart.svg?react';
import Chart from '@/assets/chart.svg?react';
import User from '@/assets/user.svg?react';

export interface HeaderControlContext {
  setCustomBack: (fn: (() => void) | null) => void;
  setRightAction: (action: { label: string; onClick: () => void } | null) => void;
}

export default function ProtectedLayout() {
  const isAuthenticated = true;
  const location = useLocation();
  const navigate = useNavigate();

  // 뒤로가기 함수 & 오른쪽 버튼 액션 관리 상태
  const [customBack, setCustomBack] = useState<(() => void) | null>(null);
  const [rightAction, setRightAction] = useState<{ label: string; onClick: () => void } | null>(null);

  // 페이지 이동 시 상태 초기화
  const handleSetCustomBack = useCallback((fn: (() => void) | null) => {
    setCustomBack(() => fn);
  }, []);

  const handleSetRightAction = useCallback((action: { label: string; onClick: () => void } | null) => {
    setRightAction(action);
  }, []);
  // 제목 결정
  const getTitle = (path: string) => {
    if (path.startsWith('/budget/setting')) return '목표 예산 설정';
    if (path.startsWith('/budget/result')) return '목표 예산 설정';
    return '';
  };

  const isMainTab = ['/home', '/wishlist', '/report', '/mypage'].includes(location.pathname);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // nav 바 아이콘 색상 결정 로직
  // path가 현재 주소를 포함하면 primary, 아니면 gray 반환
  const getNavColor = (path: string) => {
    return location.pathname.startsWith(path) ? 'text-primary-600' : 'text-gray-600';
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 헤더 */}
      {!isMainTab && (
        <Header
          title={getTitle(location.pathname)}
          onBackClick={customBack || undefined}
          rightContent={rightAction?.label}
          onRightClick={rightAction?.onClick}
        />
      )}

      <main className="flex-1">
        {/* 자식에게 'setRightAction' 전달 */}
        <Outlet
          context={
            {
              setCustomBack: handleSetCustomBack,
              setRightAction: handleSetRightAction,
            } satisfies HeaderControlContext
          }
        />
      </main>

      {/* 네비바 */}
      {isMainTab && (
        <nav className="sticky bottom-0 z-50 bg-white rounded-t-[10px] shadow-[0_0_3px_rgba(0,0,0,0.25)]">
          <div className="flex justify-around items-center h-full px-2 pt-[23px] pb-[10px]">
            <button onClick={() => navigate('/home')}>
              <House className={`${getNavColor('/home')}`} />
            </button>
            <button onClick={() => navigate('/wishlist')}>
              <Cart className={`${getNavColor('/wishlist')}`} />
            </button>
            <button onClick={() => navigate('/report')}>
              <Chart className={`${getNavColor('/report')}`} />
            </button>
            <button onClick={() => navigate('/mypage')}>
              <User className={`${getNavColor('/mypage')}`} />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
