import { instance } from '@/apis/axios';

import type {
  CalendarElement,
  ConsumptionReason,
  MonthlyReport,
  Star,
  TimeDistribution,
  WeekdayDistribution,
  DayTime,
} from '@/types/ReportPage/report';

import {
  emptyTimeDist,
  emptyWeekdayDist,
  hasConsumptionData,
  isDayTimeDisplayName,
  isWeekdayDisplayName,
  toDayTimeFromCalendar,
  toStarOrNull,
} from '@/utils/ReportPage/report';

type ReportSuccessResponse = {
  resultType: 'SUCCESS';
  error: null;
  data: {
    period: { from: string; to: string; days: number };
    summary: {
      totalSpent: number;
      savedAmount: number;
      averageSatisfaction: number | null;
    };
    topReasons: Array<{
      reason: string;
      count: number;
      averageSatisfaction: number | null;
    }>;
  };
};

type ReportFailResponse = {
  resultType: 'FAIL';
  error: { errorCode: string; reason: string; data?: unknown };
  success: null;
};

type ReportResponse = ReportSuccessResponse | ReportFailResponse;

type CalendarSuccessResponse = {
  resultType: 'SUCCESS';
  error: null;
  data: {
    year: number;
    month: number;
    summary: { totalAmount: number; purchaseCount: number };
    calendar: Array<{ date: string; purchaseCount: number; totalAmount: number }>;
    itemsByDate: Record<
      string,
      Array<{
        itemId: number;
        itemType: string;
        name: string;
        price: number;
        thumbnailUrl: string;
        purchasedAt: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
        satisfaction: number | null;
        reason?: string;
      }>
    >;
  } | null;
};

type CalendarFailResponse = {
  resultType: 'FAIL';
  error: { errorCode: string; reason: string; data?: unknown };
  success: null;
};

type CalendarResponse = CalendarSuccessResponse | CalendarFailResponse;

type AnalyticsMetricParam = 'time' | 'day';

type AnalyticsSuccessResponse = {
  resultType: 'SUCCESS';
  error: null;
  data: {
    metric: 'TIME' | 'DAY';
    totalCount: number;
    statistics: Array<{
      label: string;
      displayName: string;
      count: number;
      percentage: number;
    }>;
  } | null;
};

type AnalyticsFailResponse = {
  resultType: 'FAIL';
  error: { errorCode: string; reason: string; data?: unknown };
  success: null;
};

type AnalyticsResponse = AnalyticsSuccessResponse | AnalyticsFailResponse;

export type CalendarPurchase = {
  id: string;
  date: string;
  timeLabel: DayTime;
  reason: ConsumptionReason[];
  title: string;
  price: number;
  imageUrl: string;
  hasReview: boolean;
  rating?: Star;
};

function toRating5(satisfaction: number): Star {
  const rounded = Math.round(satisfaction);
  const clamped = Math.max(1, Math.min(5, rounded));
  return clamped as Star;
}

function normalizeReasons(topReasons: Array<{ reason: string; count: number }>): ConsumptionReason[] {
  const list = (topReasons ?? [])
    .filter((r) => (r?.count ?? 0) > 0)
    .map((r) => (typeof r.reason === 'string' ? r.reason.trim() : ''))
    .filter((r) => r.length > 0);

  return Array.from(new Set(list));
}

export const reportApi = {
  async fetchMonthlyReport(): Promise<MonthlyReport> {
    const res = await instance.get<ReportResponse>('/histories/report');
    const body = res.data;

    if (body.resultType !== 'SUCCESS' || !body.data) {
      const reason = body.resultType === 'FAIL' ? body.error.reason : 'Unknown error';
      throw new Error(reason);
    }

    const { period, summary, topReasons } = body.data;

    const hasData = hasConsumptionData(summary, topReasons);

    const reasons: ConsumptionReason[] = hasData ? normalizeReasons(topReasons) : [];
    const avgStar: Star | null = hasData ? toStarOrNull(summary.averageSatisfaction) : null;

    const reasonSatisfaction: Record<ConsumptionReason, Star | null> = {};
    if (hasData) {
      (topReasons ?? []).forEach((r) => {
        if ((r?.count ?? 0) <= 0) return;
        const key = typeof r.reason === 'string' ? r.reason.trim() : '';
        if (!key) return;
        reasonSatisfaction[key] = toStarOrNull(r.averageSatisfaction);
      });
    }

    const insight = hasData
      ? reasons.length > 0
        ? `최근 한 달 동안 "${reasons.join(', ')}" 등의 이유로 소비가 많았어요. 구매 전 한 번만 더 고민해보면 지갑을 더 지킬 수 있어요!`
        : '최근 한 달 소비 패턴을 점검해보며, 구매 전 “정말 필요한가?”를 한 번 더 체크해보세요.'
      : '아직 소비 기록이 없어요. 첫 기록을 남겨보면 리포트를 만들어드릴게요!';

    return {
      period,
      totalWon: summary.totalSpent,
      savedWon: summary.savedAmount,
      reasons,
      averageSatisfaction: avgStar,
      reasonSatisfaction,
      insight,
    };
  },

  async fetchAnalytics(metric: AnalyticsMetricParam): Promise<{
    metric: 'TIME' | 'DAY';
    totalCount: number;
    timeDistribution?: TimeDistribution;
    weekdayDistribution?: WeekdayDistribution;
  }> {
    const res = await instance.get<AnalyticsResponse>('/histories/analytics', { params: { metric } });
    const body = res.data;

    if (body.resultType === 'FAIL') {
      throw new Error(body.error.reason);
    }

    const data = body.data;
    if (!data) {
      return metric === 'time'
        ? { metric: 'TIME', totalCount: 0, timeDistribution: emptyTimeDist() }
        : { metric: 'DAY', totalCount: 0, weekdayDistribution: emptyWeekdayDist() };
    }

    const totalCount = data.totalCount ?? 0;
    const stats = data.statistics ?? [];

    if (data.metric === 'TIME') {
      const dist = emptyTimeDist();
      stats.forEach((s) => {
        const name = s.displayName;
        if (isDayTimeDisplayName(name)) dist[name] = s.percentage;
      });
      return { metric: 'TIME', totalCount, timeDistribution: dist };
    }

    const dist = emptyWeekdayDist();
    stats.forEach((s) => {
      const name = s.displayName;
      if (isWeekdayDisplayName(name)) dist[name] = s.percentage;
    });

    return { metric: 'DAY', totalCount, weekdayDistribution: dist };
  },

  async fetchCalendarMonth(
    year: number,
    month: number,
  ): Promise<{ element: CalendarElement; itemsByDate: Record<string, CalendarPurchase[]> }> {
    const res = await instance.get<CalendarResponse>('/histories/calendar', { params: { year, month } });
    const body = res.data;

    if (body.resultType === 'FAIL') {
      throw new Error(body.error.reason);
    }

    const data = body.data;
    if (!data) {
      return {
        element: { year, month, totalWon: 0, purchaseCount: 0 },
        itemsByDate: {},
      };
    }

    const { summary, itemsByDate } = data;

    const mappedItemsByDate: Record<string, CalendarPurchase[]> = {};

    Object.entries(itemsByDate ?? {}).forEach(([date, list]) => {
      mappedItemsByDate[date] = (list ?? []).map((it) => ({
        id: String(it.itemId),
        date,
        timeLabel: toDayTimeFromCalendar(it.purchasedAt),
        reason: typeof it.reason === 'string' && it.reason.trim().length > 0 ? [it.reason.trim()] : [],
        title: it.name,
        price: it.price,
        imageUrl: it.thumbnailUrl ?? '',
        hasReview: it.satisfaction !== null,
        rating: it.satisfaction !== null ? toRating5(it.satisfaction) : undefined,
      }));
    });

    return {
      element: {
        year: data.year ?? year,
        month: data.month ?? month,
        totalWon: summary?.totalAmount ?? 0,
        purchaseCount: summary?.purchaseCount ?? 0,
      },
      itemsByDate: mappedItemsByDate,
    };
  },
};
