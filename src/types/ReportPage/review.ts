import type { DayLabel } from '@/utils/ReportPage/report';

export type ReviewTabKey = 'pending' | 'completed';

export type Rating = 1 | 2 | 3 | 4 | 5;

export type PendingReviewItem = {
  id: string;
  title: string;
  price: number;
  dayLabel: DayLabel;
  imageUrl: string;
  purchasedAt: string;
  tags: string[];
};

export type CompletedReviewItem = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  tags: string[];
  rating: Rating;
  purchasedAt: string;
  itemId: string;
  reviewId: string;
};

export type RatingValue = 0 | Rating;

export type UsageLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type ReviewWritePurchase = {
  id: string;
  title: string;
  price: number;
  dayLabel: number;
  imageUrl: string;
  tags: string[];
  dateText: string;
  timeLabel: string;
};

export type ItemReviewDetail = {
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
