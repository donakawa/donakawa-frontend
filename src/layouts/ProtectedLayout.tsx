import { useState, useEffect, useCallback, useMemo } from 'react';
import { Navigate, Outlet, useLocation, useNavigate} from 'react-router-dom';
import Header from '@/components/Header';
import { getMe } from '@/apis/auth';
import BottomNav from '@/components/BottomNav';

export interface HeaderControlContext {
  setTitle: (title: string) => void;
  setCustomBack: (fn: (() => void) | null) => void;
  setRightAction: (action: { rightNode: React.ReactNode; onClick: () => void; ariaLabel?: string } | null) => void;
  setLayoutModal: (node: React.ReactNode | null) => void;
}

export default function ProtectedLayout() {
  const location = useLocation();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [title, setTitle] = useState('');
  const [customBack, setCustomBack] = useState<(() => void) | null>(null);
  const [rightAction, setRightAction] = useState<{
    rightNode: React.ReactNode;
    onClick: () => void;
    ariaLabel?: string;
  } | null>(null);
  const [layoutModal, setLayoutModal] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        await getMe();
        if (isMounted) setIsAuthenticated(true);
      } catch (error) {
        console.error('인증 실패:', error);
        if (isMounted) {
          setIsAuthenticated(false);
          alert('로그인이 필요한 서비스입니다.');
        }
      }
    };

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const shouldHideHeader = useMemo(() => {
    const HIDE_LIST = ['/home', '/wishlist', '/report', '/mypage'];
    return HIDE_LIST.includes(location.pathname);
  }, [location.pathname]);

  const shouldShowBottomNav = useMemo(() => {
    const SHOW_LIST = ['/home', '/wishlist', '/report', '/mypage', '/consumption/regret', '/consumption/satisfaction'];
    return SHOW_LIST.includes(location.pathname);
  }, [location.pathname]);

  const handleSetTitle = useCallback((t: string) => setTitle(t), []);
  const handleSetCustomBack = useCallback((fn: (() => void) | null) => setCustomBack(() => fn), []);
  const handleSetRightAction = useCallback(
    (action: { rightNode: React.ReactNode; onClick: () => void; ariaLabel?: string } | null) => setRightAction(action),
    [],
  );
  const handleSetLayoutModal = useCallback((node: React.ReactNode | null) => setLayoutModal(node), []);

  const outletContext = useMemo<HeaderControlContext>(
    () => ({
      setTitle: handleSetTitle,
      setCustomBack: handleSetCustomBack,
      setRightAction: handleSetRightAction,
      setLayoutModal: handleSetLayoutModal,
    }),
    [handleSetTitle, handleSetCustomBack, handleSetRightAction, handleSetLayoutModal],
  );

  if (isAuthenticated === null) return <div>로딩 중...</div>;
  if (isAuthenticated === false) return <Navigate to="/login" replace />;

  return (
    <div className="AppContainer relative flex min-h-screen flex-col">
      {!shouldHideHeader && (
        <Header
          title={title}
          onBackClick={customBack || undefined}
          rightContent={rightAction?.rightNode}
          onRightClick={rightAction?.onClick}
        />
      )}

      <main className="flex-1 overflow-y-auto">
        <Outlet context={outletContext} />
      </main>

      {shouldShowBottomNav && <BottomNav />}

      {layoutModal && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[rgba(61,43,39,0.8)]">
          {layoutModal}
        </div>
      )}
    </div>
  );
}
