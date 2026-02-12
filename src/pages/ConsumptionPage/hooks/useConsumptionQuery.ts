import { useInfiniteQuery } from '@tanstack/react-query';
import { getSatisfactionItems, getRegretItems } from '@/apis/ConsumptionPage/spend';
import { type WishlistItemType } from '../../../pages/WishlistPage/components/wishlistGrid';

export const useConsumptionQuery = (currentType: 'satisfaction' | 'regret') => {
  const query = useInfiniteQuery({
    queryKey: ['consumption', currentType],

    queryFn: ({ pageParam }) =>
      currentType === 'satisfaction' ? getSatisfactionItems({ pageParam }) : getRegretItems({ pageParam }),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor ?? undefined;
    },
  });

  const products: WishlistItemType[] =
    query.data?.pages.flatMap((page) =>
      page.items.map((item) => ({
        id: item.itemId, //리뷰아이디
        title: item.name,
        price: item.price,
        imageUrl: item.imageUrl || '',
        type: 'AUTO',
      })),
    ) ?? [];

  const stats = {
    avgDays: query.data?.pages[0]?.averageDecisionDays ?? 0,
    count: query.data?.pages[0]?.recentMonthCount ?? 0,
  };

  return { ...query, products, stats };
};
