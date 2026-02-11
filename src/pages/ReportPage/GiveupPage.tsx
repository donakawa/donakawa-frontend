import { useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';

import type { GiveupItemsPageData } from '@/types/ReportPage/giveup';
import WishlistGrid, { type WishlistItemType } from '@/pages/WishlistPage/components/wishlistGrid';
import type { HeaderControlContext } from '@/layouts/ProtectedLayout';

const formatWon = (value: number): string => new Intl.NumberFormat('ko-KR').format(value);

export default function GiveupItemsPage(): React.JSX.Element {
  const { setTitle } = useOutletContext<HeaderControlContext>();

  useEffect(() => {
    setTitle('포기한 템');
    return () => setTitle('');
  }, [setTitle]);

  const data = useMemo(
    () =>
      ({
        summary: {
          totalGiveupAmount: 234_500,
          GiveupCount: 4,
        },
        items: [
          {
            id: '1',
            title: '캐시미어 로제...',
            price: 238_400,
            imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=60',
            type: 'MANUAL',
          },
          {
            id: '2',
            title: '캐시미어 로제...',
            price: 238_400,
            imageUrl: 'https://images.unsplash.com/photo-1520975958225-5f1d6b5d4a0b?auto=format&fit=crop&w=600&q=60',
            type: 'MANUAL',
          },
          {
            id: '3',
            title: '캐시미어 로제...',
            price: 238_400,
            imageUrl: 'https://images.unsplash.com/photo-1520975869016-6dcf7b3f1d6b?auto=format&fit=crop&w=600&q=60',
            type: 'MANUAL',
          },
          {
            id: '4',
            title: '캐시미어 로제...',
            price: 238_400,
            imageUrl: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=60',
            type: 'MANUAL',
          },
        ],
      }) satisfies GiveupItemsPageData,
    [],
  );

  const gridItems: WishlistItemType[] = useMemo(
    () =>
      data.items.map((it) => ({
        id: it.id,
        imageUrl: it.imageUrl ?? '',
        price: it.price,
        title: it.title,
        type: it.type === 'AUTO' ? 'AUTO' : 'MANUAL',
      })),
    [data.items],
  );

  const handleItemClick = (id: string): void => {
    const found = data.items.find((it) => it.id === id);
    if (!found) return;
    console.log('clicked item:', found.id);
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-[100vh] flex flex-col bg-white overflow-hidden">
      <main className="flex-1 flex flex-col min-h-0">
        <section className="mt-[14px] px-4 pt-[18px] pb-6 flex flex-col gap-3">
          <div className="text-[20px] font-semibold">총 아낀 금액: {formatWon(data.summary.totalGiveupAmount)}</div>
          <p className="text-[16px] text-gray-600">구매 포기한 위시템 {data.summary.GiveupCount}건</p>
        </section>

        <section
          className="
            flex-1 min-h-0
            pt-10 px-4 pb-0
            flex flex-col gap-[30px]
            bg-secondary-100
            shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]
            rounded-t-[20px]
          ">
          <WishlistGrid items={gridItems} onItemClick={handleItemClick} />
        </section>
      </main>
    </div>
  );
}
