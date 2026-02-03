import { axiosInstance } from '@/apis/axios';
import type {
  CalendarElement,
  CalendarPurchaseItem,
  ConsumptionReason,
  DayTime,
  MonthlyReport,
  Star,
  Weekday,
  TimeDistribution,
  WeekdayDistribution,
} from '@/types/ReportPage/report';

type ReportSuccessResponse = {
  resultType: 'SUCCESS';
  error: null;
  data: {
    period: { from: string; to: string; days: number };
    summary: {
      totalSpent: number;
      savedAmount: number;
      averageSatisfaction: number;
    };
    topReasons: Array<{
      reason: string;
      count: number;
      averageSatisfaction: number;
    }>;
  };
};

type ReportFailResponse = {
  resultType: 'FAIL';
  error: {
    errorCode: string;
    reason: string;
    data?: unknown;
  };
  success: null;
};

type ReportResponse = ReportSuccessResponse | ReportFailResponse;

function toStar(n: number): Star {
  const rounded = Math.round(n);
  const clamped = Math.max(1, Math.min(5, rounded));
  return clamped as Star;
}

function isConsumptionReason(v: string): v is ConsumptionReason {
  return v === '필요해서' || v === '세일 중' || v === '품절임박';
}

/* -------------------- Calendar (기존) -------------------- */
type CalendarSuccessResponse = {
  resultType: 'SUCCESS';
  error: null;
  data: {
    year: number;
    month: number;
    summary: {
      totalAmount: number;
      purchaseCount: number;
    };
    calendar: Array<{
      date: string;
      purchaseCount: number;
      totalAmount: number;
    }>;
    itemsByDate: Record<
      string,
      Array<{
        itemId: number;
        itemType: string;
        name: string;
        price: number;
        thumbnailUrl: string;
        purchasedAt: string;
        satisfaction: number | null;
      }>
    >;
  };
};

type CalendarFailResponse = {
  resultType: 'FAIL';
  error: {
    errorCode: string;
    reason: string;
    data?: unknown;
  };
  success: null;
};

type CalendarResponse = CalendarSuccessResponse | CalendarFailResponse;

type CalendarPurchase = CalendarPurchaseItem & { rating?: number };

function toDayTime(purchasedAt: string): DayTime {
  switch (purchasedAt) {
    case 'MORNING':
      return '아침';
    case 'AFTERNOON':
      return '낮';
    case 'EVENING':
      return '저녁';
    case 'NIGHT':
      return '새벽';
    default:
      return '낮';
  }
}

function toRating5(satisfaction: number): 1 | 2 | 3 | 4 | 5 {
  const rounded = Math.round(satisfaction);
  const clamped = Math.max(1, Math.min(5, rounded));
  return clamped as 1 | 2 | 3 | 4 | 5;
}

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
  };
};

type AnalyticsFailResponse = {
  resultType: 'FAIL';
  error: {
    errorCode: string;
    reason: string;
    data?: unknown;
  };
  success: null;
};

type AnalyticsResponse = AnalyticsSuccessResponse | AnalyticsFailResponse;

function emptyTimeDist(): TimeDistribution {
  return { 아침: 0, 낮: 0, 저녁: 0, 새벽: 0 };
}

function emptyWeekdayDist(): WeekdayDistribution {
  return { 월: 0, 화: 0, 수: 0, 목: 0, 금: 0, 토: 0, 일: 0 };
}

function isWeekdayDisplayName(v: string): v is Weekday {
  return v === '월' || v === '화' || v === '수' || v === '목' || v === '금' || v === '토' || v === '일';
}

function isDayTimeDisplayName(v: string): v is DayTime {
  return v === '아침' || v === '낮' || v === '저녁' || v === '새벽';
}

export const reportApi = {
  async fetchMonthlyReport(): Promise<MonthlyReport> {
    const res = await axiosInstance.get<ReportResponse>('/histories/report');
    const body = res.data;

    if (body.resultType !== 'SUCCESS' || !body.data) {
      const reason = body.resultType === 'FAIL' ? body.error.reason : 'Unknown error';
      throw new Error(reason);
    }

    const { period, summary, topReasons } = body.data;

    const reasons: ConsumptionReason[] = topReasons
      .map((r) => r.reason)
      .filter((r): r is ConsumptionReason => isConsumptionReason(r));

    const baseStar = toStar(summary.averageSatisfaction);
    const reasonSatisfaction: Record<ConsumptionReason, Star> = {
      필요해서: baseStar,
      '세일 중': baseStar,
      품절임박: baseStar,
    };

    topReasons.forEach((r) => {
      if (isConsumptionReason(r.reason)) {
        reasonSatisfaction[r.reason] = toStar(r.averageSatisfaction);
      }
    });

    const insight =
      reasons.length > 0
        ? `최근 한 달 동안 "${reasons.join(', ')}" 등의 이유로 소비가 많았어요. 구매 전 한 번만 더 고민해보면 지갑을 더 지킬 수 있어요!`
        : '최근 한 달 소비 패턴을 점검해보며, 구매 전 “정말 필요한가?”를 한 번 더 체크해보세요.';

    return {
      period,
      totalWon: summary.totalSpent,
      savedWon: summary.savedAmount,
      reasons,
      averageSatisfaction: baseStar,
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
    const res = await axiosInstance.get<AnalyticsResponse>('/histories/analytics', {
      params: { metric },
    });

    const body = res.data;

    if (body.resultType === 'FAIL') {
      throw new Error(body.error.reason);
    }

    const data = body.data;
    const totalCount = data?.totalCount ?? 0;
    const stats = data?.statistics ?? [];

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
  ): Promise<{
    element: CalendarElement;
    itemsByDate: Record<string, CalendarPurchase[]>;
  }> {
    const res = await axiosInstance.get<CalendarResponse>('/histories/calendar', {
      params: { year, month },
    });

    const body = res.data;

    if (body.resultType === 'FAIL') {
      throw new Error(body.error.reason);
    }

    const data = body.data;
    if (!data) {
      return {
        element: {
          year,
          month,
          totalWon: 0,
          purchaseCount: 0,
        },
        itemsByDate: {},
      };
    }

    const { summary, itemsByDate } = data;

    const mappedItemsByDate: Record<string, CalendarPurchase[]> = {};

    Object.entries(itemsByDate ?? {}).forEach(([date, list]) => {
      mappedItemsByDate[date] = (list ?? []).map((it) => ({
        id: String(it.itemId),
        date,
        timeLabel: toDayTime(it.purchasedAt),
        reason: [],
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
