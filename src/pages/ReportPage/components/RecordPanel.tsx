import { useNavigate } from 'react-router-dom';

import StarIcon from '@/assets/star_line.svg';
import StarfullIcon from '@/assets/star_full.svg';
import RightArrow from '@/assets/arrow_right.svg';

import type { DayTime, Star, Weekday } from '@/types/ReportPage/report';

import { clampPercent, formatWon } from '@/utils/ReportPage/report';

import { useMonthlyReport } from '@/pages/ReportPage/hooks/useMonthlyReport';
import { usePurchaseAnalytics } from '@/pages/ReportPage/hooks/usePurchaseAnalytics';
import { useNoReviewItems } from '@/pages/ReportPage/hooks/useNoReviewItems';
import type { ReviewItemCard } from '@/pages/ReportPage/hooks/useNoReviewItems';

const WEEKDAYS: Weekday[] = ['월', '화', '수', '목', '금', '토', '일'];
const TIMES: DayTime[] = ['낮', '저녁', '새벽'];

export default function RecordView() {
  const navigate = useNavigate();

  const { monthlyReport, loading: monthlyLoading, error: monthlyError } = useMonthlyReport();

  const {
    distMode,
    setDistMode,
    timeDistribution,
    weekdayDistribution,
    loading: analyticsLoading,
    error: analyticsError,
  } = usePurchaseAnalytics();

  const { items: reviewItems, loading: reviewLoading, error: reviewError } = useNoReviewItems();

  const goToWritePage = () => {
    navigate(`/report/review`);
  };

  const goToGiveupPage = () => {
    navigate('/report/giveup');
  };

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

  const currentReasons: string[] = monthlyReport?.reasons ?? [];
  const currentReasonSatisfaction = monthlyReport?.reasonSatisfaction;

  const hasConsumption = !!monthlyReport && (monthlyReport.totalWon > 0 || (monthlyReport.reasons?.length ?? 0) > 0);

  const hasAvgSatisfaction = hasConsumption && monthlyReport?.averageSatisfaction != null;

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
                    currentReasons.map((reason) => (
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

                {hasAvgSatisfaction ? (
                  <StarLine value={monthlyReport.averageSatisfaction as Star} />
                ) : (
                  <div className="text-xs" style={{ color: 'var(--color-gray-600)' }}>
                    데이터 없음
                  </div>
                )}
              </div>

              {/* ✅ 이유별 만족도: hasConsumption일 때만 렌더, 개별 값 없으면 "데이터 없음" */}
              {hasConsumption ? (
                <div className="mt-2 flex flex-col gap-2.5 pl-[96px]">
                  {currentReasons.map((reason) => {
                    const v = currentReasonSatisfaction?.[reason] ?? null;

                    return (
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

                        {v != null ? (
                          <StarLine value={v as Star} />
                        ) : hasAvgSatisfaction ? (
                          // ✅ 개별 이유 만족도 없으면 평균으로 fallback (원하면 이 fallback 제거 가능)
                          <StarLine value={monthlyReport.averageSatisfaction as Star} />
                        ) : (
                          <div className="text-xs" style={{ color: 'var(--color-gray-600)' }}>
                            데이터 없음
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : null}

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
                className="min-w-[94px] max-w-[94px]"
                style={{ WebkitTapHighlightColor: 'transparent' }}>
                <div className="flex flex-col gap-1.5">
                  <div className="text-xs font-medium" style={{ color: 'var(--color-gray-600)' }}>
                    {item.dayLabel}
                  </div>

                  <div
                    className="w-[94px] h-[94px] rounded-[5px] overflow-hidden bg-gray-100"
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
            height: `${clampPercent(value)}%`,
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

function StarLine({ value }: { value: Star }) {
  return (
    <div className="inline-flex items-center gap-1" aria-hidden>
      {([1, 2, 3, 4, 5] as const).map((i) => (
        <img key={i} src={i <= value ? StarfullIcon : StarIcon} alt="" className="w-[18px] h-[18px] block" />
      ))}
    </div>
  );
}
