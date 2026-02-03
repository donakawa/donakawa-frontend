import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import type { HeaderControlContext } from '@/layouts/ProtectedLayout';
import type { ReviewTabKey, PendingReviewItem, CompletedReviewItem, Rating } from '@/types/ReportPage/review';

import PendingPage from '@/pages/ReportPage/components/PendingPage';
import CompletedPage from '@/pages/ReportPage/components/CompletedPage';

import { getHistoryItems, getWrittenReviews } from '@/apis/ReportPage/review';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function getDayLabel(dateStr: string): number {
  // ✅ purchasedAt이 "2026-02-01T10:30:00Z" 같이 이미 ISO인 경우도 안전하게 처리
  const d = new Date(dateStr);
  if (!Number.isNaN(d.getTime())) return d.getDate();

  // 혹시 "2026-02-01" 같은 날짜만 오는 케이스 fallback
  const d2 = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(d2.getTime()) ? 0 : d2.getDate();
}

function toRating(v: unknown): Rating {
  const n = typeof v === 'number' ? Math.floor(v) : 1;
  if (n <= 1) return 1;
  if (n === 2) return 2;
  if (n === 3) return 3;
  if (n === 4) return 4;
  return 5;
}

export default function PurchaseReview() {
  const { setTitle } = useOutletContext<HeaderControlContext>();

  useEffect(() => {
    setTitle('구매한 템');
    return () => setTitle('');
  }, [setTitle]);

  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ReviewTabKey>('pending');

  // Pending
  const [pendingItems, setPendingItems] = useState<PendingReviewItem[]>([]);
  const [pendingLoading, setPendingLoading] = useState<boolean>(false);
  const [pendingError, setPendingError] = useState<string | null>(null);

  const fetchPending = async () => {
    setPendingLoading(true);
    setPendingError(null);

    try {
      const items = await getHistoryItems({ reviewStatus: 'NOT_WRITTEN' });

      const mapped: PendingReviewItem[] = items.map((it) => ({
        id: String(it.itemId),
        title: it.itemName,
        price: it.price,
        imageUrl: it.imageUrl ?? '',
        // ✅ daylabel -> dayLabel 로 통일 (카드 컴포넌트와 맞추기)
        dayLabel: getDayLabel(it.purchasedAt),
        purchasedAt: it.purchasedAt,
        tags: it.purchaseReasons ?? [],
      }));

      setPendingItems(mapped);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '불러오기에 실패했어요.';
      setPendingError(msg);
      setPendingItems([]);
    } finally {
      setPendingLoading(false);
    }
  };

  // Completed
  const [completedItems, setCompletedItems] = useState<CompletedReviewItem[]>([]);
  const [completedLoading, setCompletedLoading] = useState<boolean>(false);
  const [completedError, setCompletedError] = useState<string | null>(null);
  const [completedFetched, setCompletedFetched] = useState<boolean>(false);

  const fetchCompleted = async () => {
    setCompletedLoading(true);
    setCompletedError(null);

    try {
      const { reviewCount, reviews } = await getWrittenReviews();

      const mapped: CompletedReviewItem[] = reviews.map((r) => ({
        id: String(r.reviewId),
        title: r.itemName,
        price: r.price,
        imageUrl: r.imageUrl ?? '',
        tags: r.purchaseReasons ?? [],
        rating: toRating(r.satisfactionScore),
        purchasedAt: r.purchasedAt,
        itemId: String(r.itemId),
        reviewId: String(r.reviewId),
      }));

      void reviewCount;

      setCompletedItems(mapped);
      setCompletedFetched(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '불러오기에 실패했어요.';
      setCompletedError(msg);
      setCompletedItems([]);
      setCompletedFetched(true);
    } finally {
      setCompletedLoading(false);
    }
  };

  useEffect(() => {
    void fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'completed' && !completedFetched && !completedLoading) {
      void fetchCompleted();
    }
  }, [activeTab, completedFetched, completedLoading]);

  const handleWriteClick = (itemId: string) => {
    navigate(`/report/review/write?purchasedId=${encodeURIComponent(itemId)}`);
  };

  const handleOpenClick = (id: string) => {
    console.log('open completed review:', id);
  };

  return (
    <div className="w-full max-w-[430px] mx-auto bg-white min-h-[100dvh] flex flex-col">
      <div className="h-12 grid grid-cols-2 items-stretch border-b border-b-gray-100">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={cn(
            'border-0 bg-transparent text-[16px] font-medium cursor-pointer',
            activeTab === 'pending' ? 'text-black' : 'text-gray-400',
          )}>
          후기 작성
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={cn(
            'border-0 bg-transparent text-[16px] font-medium cursor-pointer',
            activeTab === 'completed' ? 'text-black' : 'text-gray-400',
          )}>
          작성한 후기
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {/* Pending */}
        <section
          className={cn(
            'absolute inset-0 overflow-auto pb-[86px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-all duration-200',
            activeTab === 'pending'
              ? 'opacity-100 translate-x-0 pointer-events-auto'
              : 'opacity-0 translate-x-[10px] pointer-events-none',
          )}>
          {pendingLoading && <div className="px-4 pt-4 text-[12px] font-medium text-gray-500">불러오는 중…</div>}

          {!pendingLoading && pendingError && (
            <div className="px-4 pt-4 text-[12px] font-medium text-red-500">{pendingError}</div>
          )}

          {!pendingLoading && !pendingError && <PendingPage items={pendingItems} onWriteClick={handleWriteClick} />}
        </section>

        {/* Completed */}
        <section
          className={cn(
            'absolute inset-0 overflow-auto pb-[86px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-all duration-200',
            activeTab === 'completed'
              ? 'opacity-100 translate-x-0 pointer-events-auto'
              : 'opacity-0 translate-x-[10px] pointer-events-none',
          )}>
          {completedLoading && <div className="px-4 pt-4 text-[12px] font-medium text-gray-500">불러오는 중…</div>}

          {!completedLoading && completedError && (
            <div className="px-4 pt-4 text-[12px] font-medium text-red-500">{completedError}</div>
          )}

          {!completedLoading && !completedError && (
            <CompletedPage items={completedItems} onOpenClick={handleOpenClick} />
          )}
        </section>
      </div>
    </div>
  );
}
