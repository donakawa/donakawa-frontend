import { instance } from '@/apis/axios';

type ReviewStatus = 'ALL' | 'WRITTEN' | 'NOT_WRITTEN';

type FailResponse = {
  resultType: 'FAIL';
  error: {
    errorCode: string;
    reason: string;
    data?: unknown;
  };
  success: null;
};

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
      itemType?: 'AUTO' | 'MANUAL';
      purchasedAtTime?: string;
    }>;
  };
};

type HistoryItemsResponse = HistoryItemsSuccessResponse | FailResponse;

export async function getHistoryItems(params: { reviewStatus: ReviewStatus }) {
  const res = await instance.get<HistoryItemsResponse>('/histories/items', { params });

  const body = res.data;
  if (body.resultType !== 'SUCCESS') {
    throw new Error(body.error.reason ?? '불러오기에 실패했어요.');
  }

  return body.data.items ?? [];
}

type WrittenReviewsSuccessResponse = {
  resultType: 'SUCCESS';
  error: null;
  data: {
    reviewCount: number;
    reviews: Array<{
      reviewId: number;
      itemId: number;
      itemName: string;
      price: number;
      imageUrl: string;
      purchaseReasons: string[];
      satisfactionScore: number;
      purchasedAt: string;
    }>;
  };
};

type WrittenReviewsResponse = WrittenReviewsSuccessResponse | FailResponse;

export async function getWrittenReviews() {
  const res = await instance.get<WrittenReviewsResponse>('/histories/reviews');

  const body = res.data;
  if (body.resultType !== 'SUCCESS') {
    throw new Error(body.error.reason ?? '불러오기에 실패했어요.');
  }

  return {
    reviewCount: body.data.reviewCount ?? 0,
    reviews: body.data.reviews ?? [],
  };
}

type ItemReviewSuccessResponse = {
  resultType: 'SUCCESS';
  error: null;
  data: {
    itemId: number;
    itemType: 'AUTO' | 'MANUAL' | string;
    purchasedDate: string;
    purchasedAt: string;
    product: {
      name: string;
      price: number;
      imageUrl: string | null;
    };
    purchaseReason?: string | string[];
    review: {
      reviewId: number;
      satisfaction: number;
      usageFrequency: number;
      createdAt: string;
    };
  };
};

type ItemReviewResponse = ItemReviewSuccessResponse | FailResponse;

export async function getItemReview(params: { itemId: number | string; itemType: 'AUTO' | 'MANUAL' }) {
  const res = await instance.get<ItemReviewResponse>(
    `/histories/items/${encodeURIComponent(String(params.itemId))}/review`,
    {
      params: { itemType: params.itemType },
    },
  );

  const body = res.data;
  if (body.resultType !== 'SUCCESS') {
    throw new Error(body.error.reason ?? '후기를 불러오기에 실패했어요.');
  }

  return body.data;
}
