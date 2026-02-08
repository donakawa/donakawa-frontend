import { useEffect, useState } from 'react';

import { axiosInstance } from '@/apis/axios';
import type { ConsumptionReason, MonthlyReport, Star } from '@/types/ReportPage/report';
import { isConsumptionReason, toStar } from '@/utils/ReportPage/report';

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

  const reasons: ConsumptionReason[] = (topReasons ?? [])
    .map((r) => r.reason)
    .filter((r): r is ConsumptionReason => isConsumptionReason(r));

  const baseStar = toStar(summary.averageSatisfaction);

  const reasonSatisfaction: Record<ConsumptionReason, Star> = {
    필요해서: baseStar,
    '세일 중': baseStar,
    품절임박: baseStar,
  };

  (topReasons ?? []).forEach((r) => {
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
}

export function useMonthlyReport(): UseMonthlyReportResult {
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.get<ReportResponse>('/histories/report');
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

  return { monthlyReport, loading, error, refetch };
}
