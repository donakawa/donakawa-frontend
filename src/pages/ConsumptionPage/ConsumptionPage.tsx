import { useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';

import WishlistGrid from '../../pages/WishlistPage/components/wishlistGrid';
import WishlistPanel from '../../pages/WishlistPage/components/wishlistPanel';
import { useConsumptionQuery } from './hooks/useConsumptionQuery';

import { type HeaderControlContext } from '@/layouts/ProtectedLayout';

const PAGE_CONFIG = {
  satisfaction: { title: '만족 소비', desc: '만족 소비' },
  regret: { title: '후회 소비', desc: '후회 소비' },
} as const;

const ConsumptionPage = () => {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();

  const { setTitle, setRightAction } = useOutletContext<HeaderControlContext>();

  const currentType = type === 'regret' ? 'regret' : 'satisfaction';
  const config = PAGE_CONFIG[currentType];

  const { ref, inView } = useInView();
  const { products, stats, fetchNextPage, hasNextPage, isFetchingNextPage } = useConsumptionQuery(currentType);

  const handleItemClick = (historyId: string) => {
    navigate(`/report/review/write?historyId=${encodeURIComponent(historyId)}`);
  };

  useEffect(() => {
    setTitle(config.title);

    return () => {
      setTitle('');
      setRightAction(null);
    };
  }, [config.title, setTitle, setRightAction]);

  //무한 스크롤
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="flex flex-col h-screen">
      {/* 헤더 */}
      <header className="px-5 pt-11 pb-6">
        <h2 className="text-lg font-semibold mb-3">평균 구매 결정 시간: {stats.avgDays}일</h2>
        <p className="text-gray-600 text-sm">
          최근 한 달 내 {config.desc} {stats.count}건
        </p>
      </header>
      {/* 메인 */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <WishlistPanel editMode={false} bottomPaddingPx={0}>
          <div className="flex-1 overflow-y-auto no-scrollbar pb-[90px]">
            {products.length > 0 ? (
              <>
                <WishlistGrid items={products} editMode={false} onItemClick={handleItemClick} />
                <div ref={ref} className="h-1 flex items-center justify-center w-full mt-4">
                  {isFetchingNextPage && <span className="text-gray-400 text-sm">더 불러오는 중... ⏳</span>}
                </div>
              </>
            ) : (
              <EmptyState message={`아직 ${config.desc} 내역이 없어요.`} />
            )}
          </div>
        </WishlistPanel>
      </div>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="flex flex-col h-full items-center justify-center pb-20 text-center text-gray-400">
    <p className="mt-4 text-sm">{message}</p>
  </div>
);

export default ConsumptionPage;
