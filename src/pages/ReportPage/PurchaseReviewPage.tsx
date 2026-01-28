import { useMemo, useState } from 'react';

import type { ReviewTabKey, PendingReviewItem, CompletedReviewItem } from '@/types/ReportPage/review';

import Sample from '@/assets/sample.svg';

import PendingPage from '@/pages/ReportPage/components/PendingPage';
import CompletedPage from '@/pages/ReportPage/components/CompletedPage';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function PurchaseReview() {
  const [activeTab, setActiveTab] = useState<ReviewTabKey>('pending');

  const pendingItems: PendingReviewItem[] = useMemo(
    () => [
      { id: '1', title: '캐시미어 로제 더블 하프코트', price: 238_400, daylabel: 23, imageUrl: Sample },
      { id: '2', title: '캐시미어 로제 더블 하프코트', price: 238_400, daylabel: 23, imageUrl: Sample },
      { id: '3', title: '캐시미어 로제 더블 하프코트', price: 238_400, daylabel: 23, imageUrl: Sample },
    ],
    [],
  );

  const completedItems: CompletedReviewItem[] = useMemo(
    () => [
      {
        id: '1',
        title: '캐시미어 로제 더블 하프코트',
        price: 238_400,
        imageUrl: Sample,
        tags: ['세일 중', '기분 전환'],
        rating: 4,
      },
      {
        id: '2',
        title: '캐시미어 로제 더블 하프코트',
        price: 238_400,
        imageUrl: Sample,
        tags: ['세일 중', '기분 전환'],
        rating: 4,
      },
      {
        id: '3',
        title: '캐시미어 로제 더블 하프코트',
        price: 238_400,
        imageUrl: Sample,
        tags: ['세일 중', '기분 전환'],
        rating: 4,
      },
    ],
    [],
  );

  const handleWriteClick = (id: string) => {
    console.log('write click:', id);
  };

  const handleOpenClick = (id: string) => {
    console.log('open completed review:', id);
  };

  return (
    <div className="w-full max-w-[430px] mx-auto bg-white min-h-[100dvh] flex flex-col">
      <header className="h-[56px] grid grid-cols-[48px_1fr_48px] items-center px-2">
        <button
          type="button"
          aria-label="뒤로가기"
          className="w-10 h-10 border-0 bg-transparent text-[18px] cursor-pointer">
          ←
        </button>

        <h1 className="m-0 text-center text-[20px] font-semibold">구매한 템</h1>

        <div className="w-10 h-10" />
      </header>

      <div className="h-12 grid grid-cols-2 items-stretch border-b border-b-gray-100">
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={cn(
            'border-0 bg-transparent text-[16px] font-medium cursor-pointer',
            activeTab === 'pending' ? 'text-black' : 'text-gray-100',
          )}>
          후기 작성
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={cn(
            'border-0 bg-transparent text-[16px] font-medium cursor-pointer',
            activeTab === 'completed' ? 'text-black' : 'text-gray-100',
          )}>
          작성한 후기
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <section
          className={cn(
            'absolute inset-0 overflow-auto pb-[86px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            activeTab === 'pending'
              ? 'opacity-100 translate-x-0 pointer-events-auto'
              : 'opacity-0 translate-x-[10px] pointer-events-none',
          )}>
          <PendingPage items={pendingItems} onWriteClick={handleWriteClick} />
        </section>

        <section
          className={cn(
            'absolute inset-0 overflow-auto pb-[86px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            activeTab === 'completed'
              ? 'opacity-100 translate-x-0 pointer-events-auto'
              : 'opacity-0 translate-x-[10px] pointer-events-none',
          )}>
          <CompletedPage items={completedItems} onOpenClick={handleOpenClick} />
        </section>
      </div>
    </div>
  );
}
