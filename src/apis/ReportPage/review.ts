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
