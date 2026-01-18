import StarIcon from '@/assets/star_line.svg';
import StarfullIcon from '@/assets/star_full.svg';
import RightArrow from '@/assets/arrow_right.svg';

import type {
  ConsumptionReason,
  MonthlyReport,
  PurchaseItem,
  Star,
  DayTime,
  TimeDistribution,
} from '@/types/ReportPage/report';

export default function RecordView() {
  const monthlyReport: MonthlyReport = {
    totalWon: 234_500,
    savedWon: 23_500,
    reasons: ['필요해서', '세일 중', '품절임박'],
    averageSatisfaction: 4,
    reasonSatisfaction: {
      필요해서: 4,
      '세일 중': 4,
      품절임박: 4,
    },
    insight:
      '세일이나 품절임박 등에 휘말리지 않도록 주의해 보아요. 구매 전, ‘세일하지 않아도 구매할만한 물건일까?’를 깊이 고민해 보세요.',
  };

  const timeDistribution: TimeDistribution = {
    아침: 75,
    낮: 75,
    저녁: 75,
    새벽: 75,
  };

  const purchaseItems: PurchaseItem[] = [
    { id: '1', title: '캐시미어 로제 더블 하프코트', price: 238_400, daylabel: '38', itemImgUrl: '' },
    { id: '2', title: '캐시미어 로제 더블 하프코트', price: 238_400, daylabel: '38', itemImgUrl: '' },
    { id: '3', title: '캐시미어 로제 더블 하프코트', price: 238_400, daylabel: '38', itemImgUrl: '' },
    { id: '4', title: '캐시미어 로제 더블 하프코트', price: 238_400, daylabel: '38', itemImgUrl: '' },
  ];

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
          <div className="grid items-center py-1.5 [grid-template-columns:78px_1fr] [column-gap:18px]">
            <div className="text-sm font-normal whitespace-nowrap pl-[15px]" style={{ color: 'var(--color-gray-600)' }}>
              총 소비
            </div>
            <div className="text-base font-medium" style={{ color: 'var(--color-black)' }}>
              -{formatWon(monthlyReport.totalWon)}원
            </div>
          </div>

          <div className="grid items-center py-1.5 [grid-template-columns:78px_1fr] [column-gap:18px]">
            <div className="text-sm font-normal whitespace-nowrap pl-[15px]" style={{ color: 'var(--color-gray-600)' }}>
              절약 금액
            </div>
            <div className="text-base font-medium" style={{ color: 'var(--color-black)' }}>
              {formatWon(monthlyReport.savedWon)}원
            </div>
          </div>

          <div className="grid items-center py-1.5 [grid-template-columns:78px_1fr] [column-gap:18px]">
            <div className="text-sm font-normal whitespace-nowrap pl-[15px]" style={{ color: 'var(--color-gray-600)' }}>
              소비 이유
            </div>

            <div className="flex flex-wrap gap-1.5">
              {monthlyReport.reasons.map((reason: ConsumptionReason) => (
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
              ))}
            </div>
          </div>

          <div className="grid items-center py-1.5 [grid-template-columns:78px_1fr] [column-gap:18px]">
            <div className="text-sm font-normal whitespace-nowrap pl-[15px]" style={{ color: 'var(--color-gray-600)' }}>
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
                <StarLine value={monthlyReport.reasonSatisfaction[reason]} />
              </div>
            ))}
          </div>

          <div
            className="h-px my-[30px]"
            style={{
              backgroundImage: 'linear-gradient(to right, var(--color-primary-brown-200) 60%, rgba(255,255,255,0) 0%)',
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
              className="
                px-3 py-1.5
                rounded-full
                shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]
                text-xs font-medium
                active:scale-[0.98]
                transition-[background,border-color,transform] duration-150 ease-out
              "
              style={{ background: 'var(--color-primary-brown-400)', color: 'var(--color-white)' }}>
              달
            </button>

            <button
              type="button"
              className="
                px-3 py-1.5
                rounded-full
                shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]
                text-xs font-medium
                active:scale-[0.98]
                transition-[background,border-color,transform] duration-150 ease-out
              "
              style={{ background: 'var(--color-white)', color: 'var(--color-gray-1000)' }}>
              주
            </button>
          </div>

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

              <div className="relative z-[1] flex justify-around items-end pr-1.5">
                {(Object.keys(timeDistribution) as DayTime[]).map((k) => (
                  <div key={k} className="w-[44px] flex flex-col items-center gap-2">
                    <div className="w-[22px] h-[170px] overflow-hidden flex items-end">
                      <div
                        className="w-full rounded-[100px_100px_0_0] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]"
                        style={{
                          height: `${TimePercent(timeDistribution[k])}%`,
                          background: 'var(--color-primary-600)',
                        }}
                      />
                    </div>
                    <div className="text-xs font-normal" style={{ color: 'var(--color-gray-600)' }}>
                      {k}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 소비 후기 작성 */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-0.5 py-1">
          <div className="text-xs font-normal" style={{ color: 'var(--color-black)' }}>
            소비 후기 작성하러 가볼까요?
          </div>
          <img src={RightArrow} aria-hidden className="w-[7px] h-[13px] block" alt="" />
        </div>

        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pt-2 pb-[2px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {purchaseItems.map((item) => (
            <div key={item.id} className="min-w-[94px] max-w-[94px]">
              <div className="flex flex-col gap-1.5">
                <div className="text-xs font-medium" style={{ color: 'var(--color-gray-600)' }}>
                  {item.daylabel} Day+
                </div>

                <div
                  className="w-[94px] h-[94px] rounded-[5px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]"
                  style={{ background: 'var(--color-gray-100)' }}
                />

                <div className="text-xs font-medium" style={{ color: 'var(--color-black)' }}>
                  {formatWon(item.price)}
                </div>

                <div
                  className="text-xs font-medium overflow-hidden text-ellipsis whitespace-nowrap"
                  style={{ color: 'var(--color-black)' }}>
                  {item.title}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
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
