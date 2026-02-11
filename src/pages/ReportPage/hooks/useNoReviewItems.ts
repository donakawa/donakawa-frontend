import { useEffect, useState } from 'react';

import { instance } from '@/apis/axios';
import { makeDayLabel } from '@/utils/ReportPage/report';

type ReviewStatus = 'ALL' | 'WRITTEN' | 'NOT_WRITTEN';

type HistoryItemsSuccessResponse = {
  resultType: 'SUCCESS';
  error: null;
  data: {
    items: Array<{
      reviewId?: number;
      itemId: number;
      itemName: string;
      price: number;
      imageUrl: string;
      purchaseReasons: string[];
      purchasedAt: string;
    }>;
  };
};

type HistoryItemsFailResponse = {
  resultType: 'FAIL';
  error: { errorCode: string; reason: string; data?: unknown };
  success: null;
};

type HistoryItemsResponse = HistoryItemsSuccessResponse | HistoryItemsFailResponse;

export type ReviewItemCard = {
  reviewId?: number;
  itemId: number;
  itemName: string;
  price: number;
  imageUrl: string;
  purchaseReasons: string[];
  purchasedAt: string;
  dayLabel: string;
};

type UseNoReviewItemsResult = {
  items: ReviewItemCard[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useNoReviewItems(): UseNoReviewItemsResult {
  const [items, setItems] = useState<ReviewItemCard[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const reviewStatus: ReviewStatus = 'NOT_WRITTEN';

      const res = await instance.get<HistoryItemsResponse>('/histories/items', {
        params: { reviewStatus },
      });

      const body = res.data;

      if (body.resultType !== 'SUCCESS' || !body.data) {
        const msg = body.resultType === 'FAIL' ? body.error.reason : 'Unknown error';
        throw new Error(msg);
      }

      const raw = (body.data.items ?? []).filter((it) => it.reviewId == null);

      const mapped: ReviewItemCard[] = raw.map((it) => ({
        reviewId: it.reviewId,
        itemId: it.itemId,
        itemName: it.itemName,
        price: it.price,
        imageUrl: it.imageUrl ?? '',
        purchaseReasons: it.purchaseReasons ?? [],
        purchasedAt: it.purchasedAt,
        dayLabel: makeDayLabel(it.purchasedAt),
      }));

      setItems(mapped);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '소비 후기 목록을 불러오지 못했어요.';
      setError(msg);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let alive = true;

    (async () => {
      if (!alive) return;
      await refetch();
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { items, loading, error, refetch };
}
