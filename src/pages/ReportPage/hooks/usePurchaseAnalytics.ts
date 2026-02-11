import { useEffect, useState } from 'react';

import { instance } from '@/apis/axios';

import type {
  DayTime,
  DistributionMode,
  TimeDistribution,
  Weekday,
  WeekdayDistribution,
} from '@/types/ReportPage/report';
import {
  emptyTimeDist,
  emptyWeekdayDist,
  toDayTimeFromAnalytics,
  toWeekdayFromAnalytics,
} from '@/utils/ReportPage/report';

type AnalyticsMetricParam = 'day' | 'time';
type AnalyticsMetric = 'DAY' | 'TIME';

type AnalyticsSuccessResponse = {
  resultType: 'SUCCESS';
  error: null;
  data: {
    metric: AnalyticsMetric;
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
  error: { errorCode: string; reason: string; data?: unknown };
  success: null;
};

type AnalyticsResponse = AnalyticsSuccessResponse | AnalyticsFailResponse;

type UsePurchaseAnalyticsResult = {
  distMode: DistributionMode;
  setDistMode: (v: DistributionMode) => void;
  timeDistribution: TimeDistribution;
  weekdayDistribution: WeekdayDistribution;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function usePurchaseAnalytics(): UsePurchaseAnalyticsResult {
  const [distMode, setDistMode] = useState<DistributionMode>('weekday');

  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution>(emptyTimeDist());
  const [weekdayDistribution, setWeekdayDistribution] = useState<WeekdayDistribution>(emptyWeekdayDist());

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const [timeRes, dayRes] = await Promise.all([
        instance.get<AnalyticsResponse>('/histories/analytics', {
          params: { metric: 'time' satisfies AnalyticsMetricParam },
        }),
        instance.get<AnalyticsResponse>('/histories/analytics', {
          params: { metric: 'day' satisfies AnalyticsMetricParam },
        }),
      ]);

      const timeBody = timeRes.data;
      const dayBody = dayRes.data;

      if (timeBody.resultType !== 'SUCCESS' || !timeBody.data) {
        const msg = timeBody.resultType === 'FAIL' ? timeBody.error.reason : 'Unknown error';
        throw new Error(msg);
      }
      if (dayBody.resultType !== 'SUCCESS' || !dayBody.data) {
        const msg = dayBody.resultType === 'FAIL' ? dayBody.error.reason : 'Unknown error';
        throw new Error(msg);
      }

      const nextTime = emptyTimeDist();
      (timeBody.data.statistics ?? []).forEach((s) => {
        const key: DayTime = toDayTimeFromAnalytics(s.label, s.displayName);
        nextTime[key] = typeof s.percentage === 'number' ? s.percentage : 0;
      });

      const nextDay = emptyWeekdayDist();
      (dayBody.data.statistics ?? []).forEach((s) => {
        const key: Weekday = toWeekdayFromAnalytics(s.label, s.displayName);
        nextDay[key] = typeof s.percentage === 'number' ? s.percentage : 0;
      });

      setTimeDistribution(nextTime);
      setWeekdayDistribution(nextDay);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '통계를 불러오지 못했어요.';
      setError(msg);
      setTimeDistribution(emptyTimeDist());
      setWeekdayDistribution(emptyWeekdayDist());
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

  return {
    distMode,
    setDistMode,
    timeDistribution,
    weekdayDistribution,
    loading,
    error,
    refetch,
  };
}
