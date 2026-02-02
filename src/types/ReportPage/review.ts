export type ReviewTabKey = 'pending' | 'completed';

export type ConsumptionReason = string;

export type PendingReviewItem = {
  id: string;
  title: string;
  price: number;
  daylabel: number;
  imageUrl: string;
};

export type CompletedReviewItem = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  tags: ConsumptionReason[];
  rating: 1 | 2 | 3 | 4 | 5;
};

export type ReviewItem = PendingReviewItem | CompletedReviewItem;

export interface ReviewItemCardProps {
  item: ReviewItem;
  onWriteClick?: (id: string) => void; // pending에서만 사용
  onOpenClick?: (id: string) => void; // completed에서만 사용
}

// 리뷰 작성하기 페이지용
export type RatingValue = 0 | 1 | 2 | 3 | 4 | 5;

export type UsageLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type ReviewWritePurchase = {
  id: string;
  title: string;
  price: number;
  dayLabel: number;
  imageUrl: string;
  tags: string[];
  dateText: string; // 2026.01.10
  timeLabel: '아침' | '낮' | '저녁';
};
