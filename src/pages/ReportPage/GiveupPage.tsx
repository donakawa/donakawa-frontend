import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import type { HeaderControlContext } from '@/layouts/ProtectedLayout';
import WishlistGrid, { type WishlistItemType } from '@/pages/WishlistPage/components/wishlistGrid';

import { getWishlistAnalytics } from '@/apis/WishlistPage/analytics';
import { getWishlistItems } from '@/apis/WishlistPage/wishlistItems';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

type GiveupSummary = {
  totalGiveupAmount: number;
  giveupCount: number;
};

type DroppedWishItem = {
  id: string;
  name: string;
  price: number;
  photoUrl: string;
  type: 'AUTO' | 'MANUAL';
  status: 'WISHLISTED' | 'DROPPED' | 'BOUGHT';
};

type PageState = {
  summary: GiveupSummary;
  items: DroppedWishItem[];
  loadState: LoadState;
  errorMessage: string;
};

const DEFAULT_STATE: PageState = {
  summary: { totalGiveupAmount: 0, giveupCount: 0 },
  items: [],
  loadState: 'idle',
  errorMessage: '',
};

const formatWon = (value: number): string => new Intl.NumberFormat('ko-KR').format(value);

export default function GiveupItemsPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { setTitle } = useOutletContext<HeaderControlContext>();

  const [state, setState] = useState<PageState>(DEFAULT_STATE);

  useEffect(() => {
    setTitle('포기한 템');
    return () => setTitle('');
  }, [setTitle]);

  useEffect(() => {
    let mounted = true;

    const fetchAll = async () => {
      try {
        setState((prev) => ({ ...prev, loadState: 'loading', errorMessage: '' }));

        const [analyticsRes, itemsRes] = await Promise.all([
          getWishlistAnalytics(),
          getWishlistItems({ status: 'DROPPED' }),
        ]);

        if (!mounted) return;

        const droppedSummary =
          analyticsRes.resultType === 'SUCCESS' ? analyticsRes.data.droppedItems : { totalCount: 0, totalPrice: 0 };

        const droppedItems: DroppedWishItem[] =
          itemsRes.resultType === 'SUCCESS' ? (itemsRes.data.wishitems as DroppedWishItem[]) : [];

        setState({
          summary: {
            totalGiveupAmount: droppedSummary.totalPrice ?? 0,
            giveupCount: droppedSummary.totalCount ?? 0,
          },
          items: droppedItems,
          loadState: 'success',
          errorMessage: '',
        });
      } catch (err: unknown) {
        if (!mounted) return;

        const e = err as {
          response?: { data?: { error?: { reason?: string }; reason?: string } };
          message?: string;
        };

        const message =
          e?.response?.data?.error?.reason ||
          e?.response?.data?.reason ||
          e?.message ||
          '포기한 아이템을 불러오는 중 오류가 발생했어요.';

        setState((prev) => ({ ...prev, loadState: 'error', errorMessage: message }));
      }
    };

    fetchAll();

    return () => {
      mounted = false;
    };
  }, []);

  const gridItems: WishlistItemType[] = useMemo(
    () =>
      state.items.map((it) => ({
        id: it.id,
        imageUrl: it.photoUrl ?? '',
        price: it.price,
        title: it.name,
        type: it.type,
      })),
    [state.items],
  );

  const handleItemClick = (id: string): void => {
    const found = state.items.find((it) => it.id === id);
    if (!found) return;

    navigate(`/wishlist/detail/${found.id}`, { state: { type: found.type } });
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-[100vh] flex flex-col bg-white overflow-hidden">
      <main className="flex-1 flex flex-col min-h-0">
        <section className="mt-[14px] px-4 pt-[18px] pb-6 flex flex-col gap-3">
          <div className="text-[20px] font-semibold">총 아낀 금액: {formatWon(state.summary.totalGiveupAmount)}</div>
          <p className="text-[16px] text-gray-600">구매 포기한 위시템 {state.summary.giveupCount}건</p>

          {state.loadState === 'error' && <p className="text-[14px] text-red-500">{state.errorMessage}</p>}
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
