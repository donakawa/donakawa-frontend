import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import House from '@/assets/house.svg?react';
import Cart from '@/assets/cart.svg?react';
import Chart from '@/assets/chart.svg?react';
import User from '@/assets/user.svg?react';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isMainTab = useMemo(() => {
    const mainTabs = ['/home', '/wishlist', '/report', '/mypage'];
    return mainTabs.includes(location.pathname);
  }, [location.pathname]);

  const getNavColor = (path: string) => {
    return location.pathname.startsWith(path) ? 'text-primary-600' : 'text-gray-600';
  };

  if (!isMainTab) return null;

  return (
    <nav className="sticky bottom-0 z-50 bg-white rounded-t-[10px] shadow-[0_0_3px_rgba(0,0,0,0.25)]">
      <div className="flex justify-around items-center h-full px-2 pt-[23px] pb-[10px]">
        <button type="button" onClick={() => navigate('/home')} aria-label="홈">
          <House className={getNavColor('/home')} />
        </button>
        <button type="button" onClick={() => navigate('/wishlist')} aria-label="위시리스트">
          <Cart className={getNavColor('/wishlist')} />
        </button>
        <button type="button" onClick={() => navigate('/report')} aria-label="리포트">
          <Chart className={getNavColor('/report')} />
        </button>
        <button type="button" onClick={() => navigate('/mypage')} aria-label="마이페이지">
          <User className={getNavColor('/mypage')} />
        </button>
      </div>
    </nav>
  );
}
