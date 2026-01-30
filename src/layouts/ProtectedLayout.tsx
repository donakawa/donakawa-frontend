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
  const path = location.pathname;

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

  // 헤더 타이틀 결정
  const getTitle = (path: string) => {
    if (path.startsWith('/budget/setting')) return '목표 예산 설정';
    if (path.startsWith('/budget/result')) return '목표 예산 설정';
    if (path.startsWith('/consumption/satisfaction')) return '만족 소비';
    if (path.startsWith('/consumption/regret')) return '후회 소비';
    return '';
  };

  // 네비바가 나와야 하는 곳
  const showNav = ['/home', '/wishlist', '/report', '/mypage', '/consumption'].some((p) => path.startsWith(p));

  // 헤더가 숨겨져야 하는 곳
  const hideHeader = ['/home', '/wishlist', '/report', '/mypage'].some((p) => path === p);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const getNavColor = (path: string) => {
    return location.pathname.startsWith(path) ? 'text-primary-600' : 'text-gray-600';
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 헤더 */}
      {!hideHeader && (
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
      {showNav && (
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
