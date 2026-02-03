import React, { useCallback, useMemo, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export interface HeaderControlContext {
  setTitle: (title: string) => void;
  setCustomBack: (fn: (() => void) | null) => void;
  setRightAction: (action: { rightNode: React.ReactNode; onClick: () => void; ariaLabel?: string } | null) => void;
  setLayoutModal: (node: React.ReactNode | null) => void;
}

export default function ProtectedLayout() {
  const isAuthenticated = true;
  const location = useLocation();
<<<<<<< HEAD
  const navigate = useNavigate();
  const path = location.pathname;
=======
>>>>>>> a7bcfd1 (✨ Feat: 마이페이지 퍼블리싱)

  const [title, setTitle] = useState('');
  const [customBack, setCustomBack] = useState<(() => void) | null>(null);

  const [rightAction, setRightAction] = useState<{
    rightNode: React.ReactNode;
    onClick: () => void;
    ariaLabel?: string;
  } | null>(null);

  const [layoutModal, setLayoutModal] = useState<React.ReactNode | null>(null);

  const isMainTab = useMemo(
    () => ['/home', '/wishlist', '/report', '/mypage'].includes(location.pathname),
    [location.pathname],
  );

  const handleSetTitle = useCallback((t: string) => setTitle(t), []);
  const handleSetCustomBack = useCallback((fn: (() => void) | null) => setCustomBack(() => fn), []);

  const handleSetRightAction = useCallback(
    (action: { rightNode: React.ReactNode; onClick: () => void; ariaLabel?: string } | null) => setRightAction(action),
    [],
  );

  const handleSetLayoutModal = useCallback((node: React.ReactNode | null) => {
    setLayoutModal(node);
  }, []);

<<<<<<< HEAD
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

  // 네비바 아이콘 색상 결정
  const getNavColor = (targetPath: string) => {
    if (targetPath === '/home') {
      // '/home' 이거나 '/consumption' 이면 활성화
      const isActive = location.pathname.startsWith('/home') || location.pathname.startsWith('/consumption');
      return isActive ? 'text-primary-600' : 'text-gray-600';
    }

    return location.pathname.startsWith(targetPath) ? 'text-primary-600' : 'text-gray-600';
  };

  return (
    <div className="flex flex-col h-screen">
      {/* 헤더 */}
      {!hideHeader && (
=======
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="AppContainer relative flex min-h-screen flex-col">
      {!isMainTab && (
>>>>>>> a7bcfd1 (✨ Feat: 마이페이지 퍼블리싱)
        <Header
          title={title}
          onBackClick={customBack || undefined}
          rightContent={rightAction?.rightNode}
          onRightClick={rightAction?.onClick}
        />
      )}

      <main className="flex-1 overflow-y-auto">
        <Outlet
          context={
            {
              setTitle: handleSetTitle,
              setCustomBack: handleSetCustomBack,
              setRightAction: handleSetRightAction,
              setLayoutModal: handleSetLayoutModal,
            } satisfies HeaderControlContext
          }
        />
      </main>

<<<<<<< HEAD
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
=======
      <BottomNav />

      {layoutModal && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[rgba(61,43,39,0.8)]">
          {layoutModal}
        </div>
>>>>>>> a7bcfd1 (✨ Feat: 마이페이지 퍼블리싱)
      )}
    </div>
  );
}
