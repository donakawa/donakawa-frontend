import { useEffect, useState } from 'react';

import { instance } from '@/apis/axios';
import type { MonthlyReport, Star } from '@/types/ReportPage/report';
import { hasConsumptionData, toStarOrNull } from '@/utils/ReportPage/report';

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

type UseMonthlyReportResult = {
  monthlyReport: MonthlyReport | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

function buildMonthlyReport(body: ReportSuccessResponse): MonthlyReport {
  const { period, summary, topReasons } = body.data;

  const hasData = hasConsumptionData({ totalSpent: summary.totalSpent }, topReasons ?? []);

  const reasons: string[] = hasData
    ? (topReasons ?? [])
        .filter((r) => (r?.count ?? 0) > 0)
        .map((r) => r.reason)
        .filter((r) => typeof r === 'string' && r.length > 0)
    : [];

  const baseStar = hasData ? toStarOrNull(summary.averageSatisfaction) : null;

  const reasonSatisfaction: Record<string, Star | null> = {};

  if (hasData) {
    (topReasons ?? []).forEach((r) => {
      if (!r?.reason) return;
      if ((r.count ?? 0) <= 0) return;

      reasonSatisfaction[r.reason] = toStarOrNull(r.averageSatisfaction);
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
    averageSatisfaction: baseStar,
    reasonSatisfaction,
    insight,
  };
}

export function useMonthlyReport(): UseMonthlyReportResult {
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const res = await instance.get<ReportResponse>('/histories/report');
      const body = res.data;

      if (body.resultType !== 'SUCCESS' || !body.data) {
        const msg = body.resultType === 'FAIL' ? body.error.reason : 'Unknown error';
        throw new Error(msg);
      }

      setMonthlyReport(buildMonthlyReport(body));
    } catch (e) {
      const msg = e instanceof Error ? e.message : '리포트를 불러오지 못했어요.';
      setError(msg);
      setMonthlyReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { monthlyReport, loading, error, refetch };
}
