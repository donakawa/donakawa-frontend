export type TabKey = 'record' | 'calendar';

export type ConsumptionReason = string;

export type Star = 1 | 2 | 3 | 4 | 5;

export type Period = {
  from: string;
  to: string;
  days: number;
};

export type MonthlyReport = {
  period: { from: string; to: string; days: number };
  totalWon: number;
  savedWon: number;
  reasons: string[];
  averageSatisfaction: Star | null;
  reasonSatisfaction: Record<string, Star | null>;
  insight: string;
};

export type DayTime = '아침' | '낮' | '저녁' | '새벽';

export type Weekday = '월' | '화' | '수' | '목' | '금' | '토' | '일';

export type TimeDistribution = Record<DayTime, number>;

export type WeekdayDistribution = Record<Weekday, number>;

export type DistributionMode = 'time' | 'weekday';

export type PurchaseItem = {
  id: string;
  title: string;
  price: number;
  daylabel: string;
  itemImgUrl: string;
};

export type CalendarElement = {
  year: number;
  month: number;
  totalWon: number;
  purchaseCount: number;
};

export type CalendarPurchaseItem = {
  id: string;
  date: string;
  timeLabel: DayTime;
  reason: string;
  title: string;
  price: number;
  imageUrl: string;
  hasReview: boolean;
};

export type CalendarCell = {
  date: Date | null;
  dayNumber: number | null;
  inCurrentMonth: boolean;
  hasPurchase: boolean;
};
