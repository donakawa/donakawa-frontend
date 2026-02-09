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
  const location = useLocation();

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

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // 검사 중일 때는 로딩 화면 (혹은 빈 화면) 보여주기
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="AppContainer relative flex min-h-screen flex-col">
      {!isMainTab && (
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

      <BottomNav />

      {layoutModal && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[rgba(61,43,39,0.8)]">
          {layoutModal}
        </div>
      )}
    </div>
  );
}
