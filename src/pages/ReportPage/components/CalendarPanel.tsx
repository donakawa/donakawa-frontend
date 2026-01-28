import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import RightArrow from '@/assets/arrow_right(gray).svg';
import LeftArrow from '@/assets/arrow_left(gray).svg';

import type { CalendarCell, CalendarElement, CalendarPurchaseItem, ConsumptionReason } from '@/types/ReportPage/report';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function CalendarPanel() {
  const navigate = useNavigate();

  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(1);

  const [selectedDate, setSelectedDate] = useState<string>(toISO(2026, 1, 10));

  const purchases: CalendarPurchaseItem[] = useMemo(
    () => [
      {
        id: '1',
        date: toISO(2026, 1, 10),
        timeLabel: '저녁',
        reason: ['세일 중', '필요해서'] satisfies ConsumptionReason[],
        title: '캐시미어 로제 더블 하프코트',
        price: 238_400,
        imageUrl: '',
        hasReview: false,
      },
      {
        id: '2',
        date: toISO(2026, 1, 10),
        timeLabel: '저녁',
        reason: ['세일 중', '필요해서'] satisfies ConsumptionReason[],
        title: '캐시미어 로제 더블 하프코트',
        price: 238_400,
        imageUrl: '',
        hasReview: false,
      },
      {
        id: '3',
        date: toISO(2026, 1, 10),
        timeLabel: '저녁',
        reason: ['세일 중', '필요해서'] satisfies ConsumptionReason[],
        title: '캐시미어 로제 더블 하프코트',
        price: 238_400,
        imageUrl: '',
        hasReview: false,
      },
    ],
    [],
  );

  const purchaseMap = useMemo(() => {
    const map = new Map<string, CalendarPurchaseItem[]>();
    for (const p of purchases) {
      const list = map.get(p.date) ?? [];
      list.push(p);
      map.set(p.date, list);
    }
    return map;
  }, [purchases]);

  const element: CalendarElement = useMemo(
    () => ({
      year,
      month,
      totalWon: 264_500,
      purchaseCount: 15,
    }),
    [year, month],
  );

  const days: CalendarCell[] = useMemo(() => {
    return MonthDaysWithLeadingBlanks(year, month, purchaseMap);
  }, [year, month, purchaseMap]);

  const selectedPurchases = purchaseMap.get(selectedDate) ?? [];

  const moveMonth = (delta: -1 | 1) => {
    const keepDay = parseISO(selectedDate)?.d ?? 1;

    const base = new Date(year, month - 1, 1);
    base.setMonth(base.getMonth() + delta);

    const nextY = base.getFullYear();
    const nextM = base.getMonth() + 1;

    const maxDay = daysInMonth(nextY, nextM);
    const nextD = Math.min(keepDay, maxDay);

    setYear(nextY);
    setMonth(nextM);
    setSelectedDate(toISO(nextY, nextM, nextD));
  };

  return (
    <div className="px-4 pt-10 pb-0 min-h-screen flex flex-col gap-[30px] bg-secondary-100 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]">
      <div className="flex items-center gap-[10px]">
        <button
          type="button"
          aria-label="이전 달"
          onClick={() => moveMonth(-1)}
          className="w-[30px] h-[30px] p-0 border-0 bg-transparent cursor-pointer inline-flex items-center justify-center active:scale-[0.98]">
          <img src={LeftArrow} alt="" />
        </button>

        <div className="text-[20px] font-semibold text-black">
          {year}.{String(month).padStart(2, '0')}
        </div>

        <button
          type="button"
          aria-label="다음 달"
          onClick={() => moveMonth(1)}
          className="w-[30px] h-[30px] p-0 border-0 bg-transparent cursor-pointer inline-flex items-center justify-center active:scale-[0.98]">
          <img src={RightArrow} alt="" />
        </button>
      </div>

      <div className="flex items-center gap-[14px] px-1">
        <div className="text-[24px] font-bold text-primary-brown-400">{formatWon(element.totalWon)}원</div>
        <div className="text-[20px] font-semibold text-gray-600">{element.purchaseCount}회 구매</div>
      </div>

      <div className="flex flex-col gap-[14px]">
        <div className="grid grid-cols-7 py-2 gap-0">
          {(['월', '화', '수', '목', '금', '토', '일'] as const).map((w) => (
            <div key={w} className="text-center text-[16px] font-medium text-black">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((cell, idx) => {
            if (!cell.date || cell.dayNumber == null) {
              return (
                <button
                  key={`blank-${year}-${month}-${idx}`}
                  type="button"
                  disabled
                  aria-hidden
                  className={cn(
                    'border-0 bg-transparent p-0',
                    'flex flex-col items-center justify-start h-[44px]',
                    'cursor-default',
                  )}>
                  <div
                    className={cn(
                      'w-[28px] h-[28px] rounded-full grid place-items-center font-normal',
                      'bg-transparent text-gray-600',
                    )}
                  />
                  <div className="mt-1 flex gap-[3px] h-[6px]" aria-hidden />
                </button>
              );
            }

            const iso = toISO(cell.date.getFullYear(), cell.date.getMonth() + 1, cell.date.getDate());
            const selected = iso === selectedDate;

            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelectedDate(iso)}
                className={cn(
                  'border-0 bg-transparent p-0 cursor-pointer',
                  'flex flex-col items-center justify-start h-[44px]',
                )}>
                <div
                  className={cn(
                    'w-[28px] h-[28px] rounded-full grid place-items-center font-normal',
                    selected ? 'bg-primary-500 text-white' : 'bg-transparent text-gray-600',
                  )}>
                  {cell.dayNumber}
                </div>

                <div className="mt-1 flex gap-[3px] h-[6px]" aria-hidden>
                  {cell.hasPurchase ? (
                    <>
                      <span className="w-1 h-1 rounded-full bg-primary-brown-300" />
                      <span className="w-1 h-1 rounded-full bg-primary-brown-300" />
                      <span className="w-1 h-1 rounded-full bg-primary-brown-300" />
                    </>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="-mx-4 w-[calc(100%+32px)] bg-primary-100 rounded-t-[20px] border border-gray-100 shadow-[0px_-1px_8px_rgba(0,0,0,0.05)] px-[14px] pt-[14px] pb-[10px] flex-1 flex flex-col min-h-[220px]">
        <div aria-hidden className="w-[46px] h-[5px] rounded-[100px] bg-gray-100 mx-auto mb-3" />

        <div className="flex flex-col gap-3 max-h-[340px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {selectedPurchases.length === 0 ? (
            <div className="text-primary-brown-400 text-[12px] font-normal">선택한 날짜에 구매 기록이 없어요.</div>
          ) : (
            selectedPurchases.map((p) => (
              <div
                key={p.id}
                className="grid grid-cols-[94px_1fr] gap-x-3 px-2 py-3 border-b border-b-[rgba(0,0,0,0.06)]">
                <div>
                  <div className="w-[94px] h-[94px] rounded-[5px] bg-gray-100 shadow-[0px_0px_4px_rgba(0,0,0,0.18)] overflow-hidden">
                    {p.imageUrl ? <img src={p.imageUrl} alt="" className="w-full h-full object-cover block" /> : null}
                  </div>

                  <div className="mt-2 text-[12px] font-medium text-black">{formatWon(p.price)}</div>

                  <div className="text-[14px] font-normal text-black overflow-hidden text-ellipsis whitespace-nowrap">
                    {p.title}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center text-[13px] font-medium text-black">
                    <div className="min-w-[60px] text-black font-normal text-[12px]">구매 이유:</div>

                    <div className="flex flex-wrap gap-[6px]">
                      {p.reason.map((r) => (
                        <div
                          key={`${p.id}-${r}`}
                          className="px-[6px] py-[3px] rounded-full bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] text-[12px] font-normal text-primary-brown-500">
                          #{r}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center text-[13px] font-medium text-black">
                    <div className="min-w-[60px] text-black font-normal text-[12px]">구매 일시:</div>
                    <div className="text-primary-brown-400 text-[12px] font-normal">
                      {formatKoreanDate(p.date)} {p.timeLabel}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/report/review')}
                    className="mt-2 w-fit border-0 bg-transparent p-0 cursor-pointer text-gray-600 text-[12px] font-normal inline-flex items-center gap-[6px]">
                    구매 후기 작성하러 가기 <span className="text-[18px]">›</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 함수 모음
function formatWon(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}

function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function parseISO(iso: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

function daysInMonth(y: number, m1to12: number): number {
  return new Date(y, m1to12, 0).getDate();
}

function formatKoreanDate(iso: string): string {
  const p = parseISO(iso);
  if (!p) return iso;
  return `${p.y}.${String(p.m).padStart(2, '0')}.${String(p.d).padStart(2, '0')}`;
}

function MonthDaysWithLeadingBlanks(
  year: number,
  month1to12: number,
  purchaseMap: Map<string, CalendarPurchaseItem[]>,
): CalendarCell[] {
  const first = new Date(year, month1to12 - 1, 1);

  // 월요일 시작
  const mondayStartIndex = (first.getDay() + 6) % 7;

  const lastDay = daysInMonth(year, month1to12);

  const cells: CalendarCell[] = [];

  for (let i = 0; i < mondayStartIndex; i += 1) {
    cells.push({
      date: null,
      dayNumber: null,
      inCurrentMonth: false,
      hasPurchase: false,
    });
  }

  for (let day = 1; day <= lastDay; day += 1) {
    const d = new Date(year, month1to12 - 1, day);
    const iso = toISO(year, month1to12, day);

    cells.push({
      date: d,
      dayNumber: day,
      inCurrentMonth: true,
      hasPurchase: purchaseMap.has(iso),
    });
  }

  return cells;
}
