import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import WishlistGrid, { type WishlistItemType } from '../../pages/WishlistPage/components/wishlistGrid';
import WishlistPanel from '../../pages/WishlistPage/components/wishlistPanel';

// 타입 설정 (만족 소비 / 후회 소비)
type ConsumptionType = 'satisfaction' | 'regret';

const PAGE_CONFIG: Record<string, { title: string; desc: string }> = {
  satisfaction: { title: '만족 소비', desc: '만족 소비' },
  regret: { title: '후회 소비', desc: '후회 소비' },
};

const ConsumptionPage = () => {
  const { type } = useParams<{ type: string }>();

  // 타입 결정
  const currentType = (type === 'regret' ? 'regret' : 'satisfaction') as ConsumptionType;
  const config = PAGE_CONFIG[currentType];

  const [stats, setStats] = useState({ avgDays: 0, count: 0 });

  const [products, setProducts] = useState<WishlistItemType[]>([]);

  useEffect(() => {
    if (currentType === 'satisfaction') {
      setStats({ avgDays: 7, count: 3 });
      setProducts([
        { id: '1', title: '캐시미어 로제...', price: 238400, imageUrl: 'https://placehold.co/150' },
        { id: '2', title: '캐시미어 로제...', price: 105000, imageUrl: 'https://placehold.co/150' },
        { id: '3', title: '캐시미어 로제...', price: 320000, imageUrl: 'https://placehold.co/150' },
      ]);
    } else {
      setStats({ avgDays: 2, count: 1 });
      setProducts([{ id: '4', title: '코트...', price: 50000, imageUrl: 'https://placehold.co/150' }]);
    }
  }, [currentType]);

  return (
    <div className="flex flex-col">
      <section className="px-[20px] pt-[43px] pb-[26px]">
        <h2 className="text-[18px] leading-[150%] font-semibold mb-[12px]">평균 구매 결정 시간: {stats.avgDays}일</h2>
        <p className="text-gray-600 text-[14px]">
          최근 한 달 내 {config.desc} {stats.count}건
        </p>
      </section>

      <div className="flex-1 overflow-hidden">
        <WishlistPanel editMode={false} bottomPaddingPx={0}>
          <div className="flex-1 overflow-y-auto no-scrollbar pb-[90px]">
            <WishlistGrid items={products} editMode={false} onItemClick={(id) => console.log('상품 클릭:', id)} />
          </div>
        </WishlistPanel>
      </div>
    </div>
  );
};

export default ConsumptionPage;
