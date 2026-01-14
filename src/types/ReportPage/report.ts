export type TabKey = 'record' | 'calendar';

export type ConsumptionReason = '필요해서' | '세일 중' | '품절임박';

export type Star = 1 | 2 | 3 | 4 | 5;

export type MonthlyReport = {
  totalWon: number;
  savedWon: number;
  reasons: ConsumptionReason[];
  averageSatisfaction: Star;
  reasonSatisfaction: Record<ConsumptionReason, Star>;
  insight: string;
};

export type DayTime = '아침' | '낮' | '저녁' | '새벽';

export type TimeDistribution = Record<DayTime, number>;

export type PurchaseItem = {
  id: string;
  title: string;
  price: number;
  daylabel: string;
  itemImgUrl: string;
};
