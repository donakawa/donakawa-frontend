import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import StarIcon from '@/assets/star_line.svg';
import StarfullIcon from '@/assets/star_full.svg';
import RightArrow from '@/assets/arrow_right.svg';

import { axiosInstance } from '@/apis/axios';

import type {
  ConsumptionReason,
  MonthlyReport,
  Star,
  DayTime,
  TimeDistribution,
  Weekday,
  WeekdayDistribution,
  DistributionMode,
} from '@/types/ReportPage/report';

const WEEKDAYS: Weekday[] = ['월', '화', '수', '목', '금', '토', '일'];
const TIMES: DayTime[] = ['아침', '낮', '저녁', '새벽'];

type ReviewStatus = 'ALL' | 'WRITTEN' | 'NOT_WRITTEN';

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

function toStar(n: number): Star {
  const rounded = Math.round(n);
  const clamped = Math.max(1, Math.min(5, rounded));
  return clamped as Star;
}

function isConsumptionReason(v: string): v is ConsumptionReason {
  return v === '필요해서' || v === '세일 중' || v === '품절임박';
}

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

function emptyTimeDist(): TimeDistribution {
  return { 아침: 0, 낮: 0, 저녁: 0, 새벽: 0 };
}

function emptyWeekdayDist(): WeekdayDistribution {
  return { 월: 0, 화: 0, 수: 0, 목: 0, 금: 0, 토: 0, 일: 0 };
}

function toDayTimeFromAnalytics(label: string, displayName: string): DayTime {
  switch (label) {
    case 'MORNING':
      return '아침';
    case 'AFTERNOON':
      return '낮';
    case 'EVENING':
      return '저녁';
    case 'NIGHT':
      return '새벽';
    default:
      if (displayName === '아침' || displayName === '낮' || displayName === '저녁' || displayName === '새벽')
        return displayName;
      return '낮';
  }
}

function toWeekdayFromAnalytics(label: string, displayName: string): Weekday {
  switch (label) {
    case 'MON':
      return '월';
    case 'TUE':
      return '화';
    case 'WED':
      return '수';
    case 'THU':
      return '목';
    case 'FRI':
      return '금';
    case 'SAT':
      return '토';
    case 'SUN':
      return '일';
    default:
      if (
        displayName === '월' ||
        displayName === '화' ||
        displayName === '수' ||
        displayName === '목' ||
        displayName === '금' ||
        displayName === '토' ||
        displayName === '일'
      )
        return displayName;
      return '월';
  }
}

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

type HistoryItemsFailResponse = {
  resultType: 'FAIL';
  error: {
    errorCode: string;
    reason: string;
    data?: unknown;
  };
  success: null;
};

type HistoryItemsResponse = HistoryItemsSuccessResponse | HistoryItemsFailResponse;

type ReviewItemCard = {
  reviewId?: number;
  itemId: number;
  itemName: string;
  price: number;
  imageUrl: string;
  purchaseReasons: string[];
  purchasedAt: string;
  dayLabel: string;
};

export default function RecordView() {
  const navigate = useNavigate();

  const goToWritePage = () => {
    navigate(`/report/review`);
  };

  const goToGiveupPage = () => {
    navigate('/report/giveup');
  };

  const [distMode, setDistMode] = useState<DistributionMode>('weekday');

  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [monthlyLoading, setMonthlyLoading] = useState<boolean>(false);
  const [monthlyError, setMonthlyError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const fetchMonthly = async () => {
      try {
        setMonthlyLoading(true);
        setMonthlyError(null);

        const res = await axiosInstance.get<ReportResponse>('/histories/report');
        const body = res.data;

        if (body.resultType !== 'SUCCESS' || !body.data) {
          const msg = body.resultType === 'FAIL' ? body.error.reason : 'Unknown error';
          throw new Error(msg);
        }

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

        const mapped: MonthlyReport = {
          period,
          totalWon: summary.totalSpent,
          savedWon: summary.savedAmount,
          reasons,
          averageSatisfaction: baseStar,
          reasonSatisfaction,
          insight,
        };

        if (!alive) return;
        setMonthlyReport(mapped);
      } catch (e) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : '리포트를 불러오지 못했어요.';
        setMonthlyError(msg);
        setMonthlyReport(null);
      } finally {
        if (!alive) return;
        setMonthlyLoading(false);
      }
    };

    fetchMonthly();
    return () => {
      alive = false;
    };
  }, []);

  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution>(emptyTimeDist());
  const [weekdayDistribution, setWeekdayDistribution] = useState<WeekdayDistribution>(emptyWeekdayDist());
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const fetchAnalytics = async () => {
      try {
        setAnalyticsLoading(true);
        setAnalyticsError(null);

        const [timeRes, dayRes] = await Promise.all([
          axiosInstance.get<AnalyticsResponse>('/histories/analytics', {
            params: { metric: 'time' satisfies AnalyticsMetricParam },
          }),
          axiosInstance.get<AnalyticsResponse>('/histories/analytics', {
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
          const key = toDayTimeFromAnalytics(s.label, s.displayName);
          nextTime[key] = typeof s.percentage === 'number' ? s.percentage : 0;
        });

        const nextDay = emptyWeekdayDist();
        (dayBody.data.statistics ?? []).forEach((s) => {
          const key = toWeekdayFromAnalytics(s.label, s.displayName);
          nextDay[key] = typeof s.percentage === 'number' ? s.percentage : 0;
        });

        if (!alive) return;
        setTimeDistribution(nextTime);
        setWeekdayDistribution(nextDay);
      } catch (e) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : '통계를 불러오지 못했어요.';
        setAnalyticsError(msg);
        setTimeDistribution(emptyTimeDist());
        setWeekdayDistribution(emptyWeekdayDist());
      } finally {
        if (!alive) return;
        setAnalyticsLoading(false);
      }
    };

    fetchAnalytics();
    return () => {
      alive = false;
    };
  }, []);

  const [reviewItems, setReviewItems] = useState<ReviewItemCard[]>([]);
  const [reviewLoading, setReviewLoading] = useState<boolean>(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const fetchNoReviewItems = async () => {
      try {
        setReviewLoading(true);
        setReviewError(null);

        const reviewStatus: ReviewStatus = 'NOT_WRITTEN';

        const res = await axiosInstance.get<HistoryItemsResponse>('/histories/items', {
          params: { reviewStatus },
        });

        const body = res.data;

        if (body.resultType !== 'SUCCESS' || !body.data) {
          const msg = body.resultType === 'FAIL' ? body.error.reason : 'Unknown error';
          throw new Error(msg);
        }

        const items = (body.data.items ?? []).filter((it) => it.reviewId == null);

        const mapped: ReviewItemCard[] = items.map((it) => ({
          reviewId: it.reviewId,
          itemId: it.itemId,
          itemName: it.itemName,
          price: it.price,
          imageUrl: it.imageUrl ?? '',
          purchaseReasons: it.purchaseReasons ?? [],
          purchasedAt: it.purchasedAt,
          dayLabel: makeDayLabel(it.purchasedAt),
        }));

        if (!alive) return;
        setReviewItems(mapped);
      } catch (e) {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : '소비 후기 목록을 불러오지 못했어요.';
        setReviewError(msg);
        setReviewItems([]);
      } finally {
        if (!alive) return;
        setReviewLoading(false);
      }
    };

    fetchNoReviewItems();
    return () => {
      alive = false;
    };
  }, []);

  const onClickReviewItem = (item: ReviewItemCard) => {
    navigate('/report/review', {
      state: {
        itemId: item.itemId,
        itemName: item.itemName,
        price: item.price,
        imageUrl: item.imageUrl,
        purchaseReasons: item.purchaseReasons,
        purchasedAt: item.purchasedAt,
      },
    });
  };

  const currentReasons = monthlyReport?.reasons ?? [];
  const currentReasonSatisfaction = monthlyReport?.reasonSatisfaction;

  return (
    <div
      className="
        px-4 pt-10 pb-6
        flex flex-col gap-8
        shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]
      "
      style={{
        background: 'var(--color-primary-100)',
        color: 'var(--color-gray-1000)',
      }}>
      {/* 최근 한 달 리포트 */}
      <section className="flex flex-col gap-2.5">
        <div
          className="
            w-fit px-2.5 py-1
            rounded-full
            border-[1.5px]
            bg-white
            shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]
            text-xs font-medium
          "
          style={{ borderColor: 'var(--color-primary-600)' }}>
          최근 한 달 리포트
        </div>

        <div
          className="
            bg-white rounded-[18px]
            border
            shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]
            px-4 py-5
          "
          style={{ borderColor: 'var(--color-gray-100)' }}>
          {monthlyLoading ? (
            <div className="text-xs" style={{ color: 'var(--color-gray-600)' }}>
              불러오는 중…
            </div>
          ) : monthlyError ? (
            <div className="text-xs" style={{ color: 'var(--color-primary-brown-500)' }}>
              {monthlyError}
            </div>
          ) : !monthlyReport ? (
            <div className="text-xs" style={{ color: 'var(--color-gray-600)' }}>
              리포트 데이터가 없어요.
            </div>
          ) : (
            <>
              <div className="grid items-center py-1.5 [grid-template-columns:78px_1fr] [column-gap:18px]">
                <div
                  className="text-sm font-normal whitespace-nowrap pl-[15px]"
                  style={{ color: 'var(--color-gray-600)' }}>
                  총 소비
                </div>
                <div className="text-base font-medium" style={{ color: 'var(--color-black)' }}>
                  -{formatWon(monthlyReport.totalWon)}원
                </div>
              </div>

              <div className="grid items-center py-1.5 [grid-template-columns:78px_1fr] [column-gap:18px]">
                <div
                  className="text-sm font-normal whitespace-nowrap pl-[15px]"
                  style={{ color: 'var(--color-gray-600)' }}>
                  절약 금액
                </div>
                <div className="text-base font-medium" style={{ color: 'var(--color-black)' }}>
                  {formatWon(monthlyReport.savedWon)}원
                </div>
              </div>

              <div className="grid items-center py-1.5 [grid-template-columns:78px_1fr] [column-gap:18px]">
                <div
                  className="text-sm font-normal whitespace-nowrap pl-[15px]"
                  style={{ color: 'var(--color-gray-600)' }}>
                  소비 이유
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {currentReasons.length === 0 ? (
                    <div className="text-xs" style={{ color: 'var(--color-gray-600)' }}>
                      데이터 없음
                    </div>
                  ) : (
                    currentReasons.map((reason: ConsumptionReason) => (
                      <div
                        key={reason}
                        className="
                          px-1.5 py-[3px]
                          rounded-full
                          bg-white
                          shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]
                          text-xs font-normal
                        "
                        style={{ color: 'var(--color-primary-brown-500)' }}>
                        #{reason}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="grid items-center py-1.5 [grid-template-columns:78px_1fr] [column-gap:18px]">
                <div
                  className="text-sm font-normal whitespace-nowrap pl-[15px]"
                  style={{ color: 'var(--color-gray-600)' }}>
                  평균 만족도
                </div>
                <StarLine value={monthlyReport.averageSatisfaction} />
              </div>

              <div className="mt-2 flex flex-col gap-2.5 pl-[96px]">
                {(Object.keys(monthlyReport.reasonSatisfaction) as ConsumptionReason[]).map((reason) => (
                  <div key={reason} className="flex flex-wrap items-center gap-3.5">
                    <div
                      className="
                        px-1.5 py-[3px]
                        rounded-full
                        bg-white
                        shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]
                        text-xs font-normal
                      "
                      style={{ color: 'var(--color-primary-brown-500)' }}>
                      #{reason}
                    </div>
                    <StarLine value={currentReasonSatisfaction?.[reason] ?? monthlyReport.averageSatisfaction} />
                  </div>
                ))}
              </div>

              <div
                className="h-px my-[30px]"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, var(--color-primary-brown-200) 60%, rgba(255,255,255,0) 0%)',
                  backgroundSize: '23px 1px',
                  backgroundRepeat: 'repeat-x',
                }}
              />

              <div className="text-base font-medium mb-4" style={{ color: 'var(--color-primary-600)' }}>
                Total
              </div>
              <div className="text-sm font-normal leading-[1.4]" style={{ color: 'var(--color-black)' }}>
                {monthlyReport.insight}
              </div>
            </>
          )}
        </div>
      </section>

      {/* 주로 구매하는 시간대 */}
      <section className="flex flex-col gap-2.5">
        <div
          className="
            w-fit px-2.5 py-1
            rounded-full
            border-[1.5px]
            bg-white
            shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]
            text-xs font-medium
          "
          style={{ borderColor: 'var(--color-primary-600)' }}>
          주로 구매하는 시간대
        </div>

        <div
          className="
            bg-white rounded-[18px]
            border
            shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]
            px-4 py-5
          "
          style={{ borderColor: 'var(--color-gray-100)' }}>
          <div className="flex gap-2 pb-2.5">
            <button
              type="button"
              onClick={() => setDistMode('weekday')}
              className="
                px-3 py-1.5
                rounded-full
                shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]
                text-xs font-medium
                active:scale-[0.98]
                transition-[background,border-color,transform] duration-150 ease-out
              "
              style={{
                background: distMode === 'weekday' ? 'var(--color-primary-brown-400)' : 'var(--color-white)',
                color: distMode === 'weekday' ? 'var(--color-white)' : 'var(--color-gray-1000)',
              }}>
              요일
            </button>

            <button
              type="button"
              onClick={() => setDistMode('time')}
              className="
                px-3 py-1.5
                rounded-full
                shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]
                text-xs font-medium
                active:scale-[0.98]
                transition-[background,border-color,transform] duration-150 ease-out
              "
              style={{
                background: distMode === 'time' ? 'var(--color-primary-brown-400)' : 'var(--color-white)',
                color: distMode === 'time' ? 'var(--color-white)' : 'var(--color-gray-1000)',
              }}>
              시간
            </button>
          </div>

          {analyticsLoading ? (
            <div className="text-xs" style={{ color: 'var(--color-gray-600)' }}>
              불러오는 중…
            </div>
          ) : analyticsError ? (
            <div className="text-xs" style={{ color: 'var(--color-primary-brown-500)' }}>
              {analyticsError}
            </div>
          ) : (
            <div className="relative">
              <div
                aria-hidden
                className="
                  pointer-events-none absolute
                  -top-1 bottom-1
                  left-[44px] right-0
                  grid [grid-template-rows:repeat(5,minmax(0,1fr))]
                ">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="self-center h-px"
                    style={{
                      backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.12) 40%, transparent 0)',
                      backgroundSize: '12px 1px',
                      backgroundRepeat: 'repeat-x',
                    }}
                  />
                ))}
              </div>

              <div className="grid gap-2.5 pt-1.5 [grid-template-columns:44px_1fr]">
                <div className="flex flex-col justify-between pb-[18px]">
                  {([100, 75, 50, 25, 0] as const).map((p) => (
                    <div key={p} className="grid items-center gap-2 [grid-template-columns:44px_1fr]">
                      <div className="text-xs font-normal" style={{ color: 'var(--color-gray-600)' }}>
                        {p}%
                      </div>
                    </div>
                  ))}
                </div>

                <div className="relative z-[1] flex items-end justify-between pr-1.5 gap-1">
                  {distMode === 'weekday' &&
                    WEEKDAYS.map((k) => <Bar key={k} label={k} value={weekdayDistribution[k]} />)}

                  {distMode === 'time' && TIMES.map((k) => <Bar key={k} label={k} value={timeDistribution[k]} />)}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 소비 후기 작성 */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-0.5 py-1">
          <div className="text-xs font-normal" style={{ color: 'var(--color-black)' }}>
            소비 후기 작성하러 가볼까요?
          </div>
          <img
            src={RightArrow}
            aria-hidden
            className="w-[7px] h-[13px] block cursor-pointer"
            alt=""
            onClick={goToWritePage}
          />
        </div>

        {reviewLoading ? (
          <div className="text-xs" style={{ color: 'var(--color-gray-600)' }}>
            불러오는 중…
          </div>
        ) : reviewError ? (
          <div className="text-xs" style={{ color: 'var(--color-primary-brown-500)' }}>
            {reviewError}
          </div>
        ) : reviewItems.length === 0 ? (
          <div className="text-xs" style={{ color: 'var(--color-gray-600)' }}>
            작성할 소비 후기가 없어요!
          </div>
        ) : (
          <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pt-2 pb-[2px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {reviewItems.map((item) => (
              <button
                key={item.itemId}
                type="button"
                onClick={() => onClickReviewItem(item)}
                className="min-w-[170px] max-w-[170px] text-left active:scale-[0.99] transition-transform"
                style={{ WebkitTapHighlightColor: 'transparent' }}>
                <div className="flex flex-col gap-1.5">
                  <div className="text-xs font-medium" style={{ color: 'var(--color-gray-600)' }}>
                    {item.dayLabel}
                  </div>

                  <div
                    className="w-[170px] h-[170px] rounded-[8px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] overflow-hidden bg-gray-100"
                    style={{ background: 'var(--color-gray-100)' }}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover block" draggable={false} />
                    ) : null}
                  </div>

                  <div className="text-xs font-medium" style={{ color: 'var(--color-black)' }}>
                    {formatWon(item.price)}원
                  </div>

                  <div
                    className="text-xs font-medium overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{ color: 'var(--color-black)' }}>
                    {item.itemName}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {item.purchaseReasons.slice(0, 2).map((r) => (
                      <span
                        key={`${item.itemId}-${r}`}
                        className="px-1.5 py-[3px] rounded-full bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] text-[11px] font-normal"
                        style={{ color: 'var(--color-primary-brown-500)' }}>
                        #{r}
                      </span>
                    ))}
                    {item.purchaseReasons.length > 2 ? (
                      <span className="text-[11px]" style={{ color: 'var(--color-gray-600)' }}>
                        +{item.purchaseReasons.length - 2}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 구매 포기템 */}
      <section className="flex flex-col gap-2.5">
        <button
          type="button"
          onClick={goToGiveupPage}
          className="bg-primary-200 rounded-[10px] p-[14px] gap-3 flex flex-col text-left
                     active:scale-[0.99] transition-transform">
          <div className="text-[12px] font-normal text-primary-500">내 지갑을 지킨</div>
          <div className="text-[18px] font-semibold">구매 포기템</div>
        </button>
      </section>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-2 min-w-0 flex-1">
      <div className="w-[18px] h-[170px] overflow-hidden flex items-end">
        <div
          className="
            w-full
            rounded-[100px_100px_0_0]
            shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]
            transition-[height] duration-200 ease-out
          "
          style={{
            height: `${TimePercent(value)}%`,
            background: 'var(--color-primary-600)',
          }}
        />
      </div>

      <div className="text-xs font-normal" style={{ color: 'var(--color-gray-600)' }}>
        {label}
      </div>
    </div>
  );
}

function formatWon(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}

function StarLine({ value }: { value: Star }) {
  return (
    <div className="inline-flex items-center gap-1" aria-hidden>
      {([1, 2, 3, 4, 5] as const).map((i) => (
        <img key={i} src={i <= value ? StarfullIcon : StarIcon} alt="" className="w-[18px] h-[18px] block" />
      ))}
    </div>
  );
}

function TimePercent(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function makeDayLabel(purchasedAtISO: string): string {
  const p = parseDate(purchasedAtISO);
  if (!p) return 'Day+';

  const today = new Date();
  const start = new Date(p.y, p.m - 1, p.d);
  start.setHours(0, 0, 0, 0);

  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  end.setHours(0, 0, 0, 0);

  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  return `${diffDays} Day+`;
}

function parseDate(iso: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}
