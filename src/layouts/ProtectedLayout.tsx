import { useState, useEffect, useCallback } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { getMe } from '@/api/auth';

import House from '@/assets/house.svg?react';
import Cart from '@/assets/cart.svg?react';
import Chart from '@/assets/chart.svg?react';
import User from '@/assets/user.svg?react';

export interface HeaderControlContext {
  setCustomBack: (fn: (() => void) | null) => void;
  setRightAction: (action: { label: string; onClick: () => void } | null) => void;
}

export default function ProtectedLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const [isLoading, setIsLoading] = useState(true);

  // 뒤로가기 함수 & 오른쪽 버튼 액션 관리 상태
  const [customBack, setCustomBack] = useState<(() => void) | null>(null);
  const [rightAction, setRightAction] = useState<{ label: string; onClick: () => void } | null>(null);

  //  페이지 진입 시 로그인 검사 (안전장치 추가)
  useEffect(() => {
    let isMounted = true; // 1. 컴포넌트가 살아있는지 확인하는 플래그

    const checkAuth = async () => {
      try {
        // 쿠키 들고 백엔드에 확인
        await getMe();
        
        // (성공 시 별도 처리 없음, finally에서 로딩 끔)
      } catch (error) {
        // 2. 실패 시 로그인 페이지로 이동
        console.error('인증 실패:', error);
        alert('로그인이 필요한 서비스입니다.');
        
        // 컴포넌트가 살아있을 때만 페이지 이동 시도
        if (isMounted) {
          navigate('/login', { replace: true });
        }
      } finally {
        // 3. 성공하든 실패하든, 컴포넌트가 살아있다면 로딩 상태 끄기
        // (봇이 지적한 "무한 로딩" 방지)
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    // 4. 클린업 함수: 페이지를 나가면 isMounted를 false로 변경
    return () => {
      isMounted = false;
    };
  }, [navigate]);

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

  // 네비바 아이콘 색상 결정
  const getNavColor = (targetPath: string) => {
    if (targetPath === '/home') {
      // '/home' 이거나 '/consumption' 이면 활성화
      const isActive = location.pathname.startsWith('/home') || location.pathname.startsWith('/consumption');
      return isActive ? 'text-primary-600' : 'text-gray-600';
    }

    return location.pathname.startsWith(targetPath) ? 'text-primary-600' : 'text-gray-600';
  };

  // 검사 중일 때는 로딩 화면 (혹은 빈 화면) 보여주기
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

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
