import { useMemo, useState } from 'react';
import * as S from '@/pages/ReportPage/PurchaseReviewPage.styles';

import type { ReviewTabKey, PendingReviewItem, CompletedReviewItem } from '@/types/ReportPage/review';

import PendingPage from '@/pages/ReportPage/components/PendingPage';
import CompletedPage from '@/pages/ReportPage/components/CompletedPage';

export default function PurchaseReview() {
  const [activeTab, setActiveTab] = useState<ReviewTabKey>('pending');

  const pendingItems: PendingReviewItem[] = useMemo(
    () => [
      {
        id: '1',
        title: '캐시미어 로제 더블 하프코트',
        price: 238_400,
        daylabel: 23,
        imageUrl: '',
      },
      {
        id: '2',
        title: '캐시미어 로제 더블 하프코트',
        price: 238_400,
        daylabel: 23,
        imageUrl: '',
      },
      {
        id: '3',
        title: '캐시미어 로제 더블 하프코트',
        price: 238_400,
        daylabel: 23,
        imageUrl: '',
      },
    ],
    [],
  );

  const completedItems: CompletedReviewItem[] = useMemo(
    () => [
      {
        id: '1',
        title: '캐시미어 로제 더블 하프코트',
        price: 238_400,
        imageUrl: '',
        tags: ['세일 중', '기분 전환'],
        rating: 4,
      },
      {
        id: '2',
        title: '캐시미어 로제 더블 하프코트',
        price: 238_400,
        imageUrl: '',
        tags: ['세일 중', '기분 전환'],
        rating: 4,
      },
      {
        id: '3',
        title: '캐시미어 로제 더블 하프코트',
        price: 238_400,
        imageUrl: '',
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
    <S.Page>
      <S.AppBar>
        <S.BackButton type="button" aria-label="뒤로가기">
          ←
        </S.BackButton>
        <S.Title>구매한 템</S.Title>
        <S.RightSlot />
      </S.AppBar>

      <S.TopTabs>
        <S.TabButton isActive={activeTab === 'pending'} type="button" onClick={() => setActiveTab('pending')}>
          후기 작성
        </S.TabButton>

        <S.TabButton isActive={activeTab === 'completed'} type="button" onClick={() => setActiveTab('completed')}>
          작성한 후기
        </S.TabButton>
      </S.TopTabs>

      <S.ViewStage>
        <S.ViewPanel isActive={activeTab === 'pending'}>
          <PendingPage items={pendingItems} onWriteClick={handleWriteClick} />
        </S.ViewPanel>

        <S.ViewPanel isActive={activeTab === 'completed'}>
          <CompletedPage items={completedItems} onOpenClick={handleOpenClick} />
        </S.ViewPanel>
      </S.ViewStage>
    </S.Page>
  );
}
