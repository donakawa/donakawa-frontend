import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import RightArrow from '@/assets/arrow_right(gray).svg';
import LeftArrow from '@/assets/arrow_left(gray).svg';
import UpArrow from '@/assets/arrow_up(gray).svg';
import SunIcon from '@/assets/sun.svg';
import MoonIcon from '@/assets/moon_dawn.svg';
import PlusIcon from '@/assets/view_more(brown).svg';
import StarFilled from '@/assets/star_full.svg';
import StarEmpty from '@/assets/star_line.svg';

import { reportApi } from '@/apis/ReportPage/report';

import type {
  CalendarCell,
  CalendarElement,
  CalendarPurchaseItem,
  ConsumptionReason,
  DayTime,
} from '@/types/ReportPage/report';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

type CalendarPurchase = CalendarPurchaseItem & { rating?: number };

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

const TIME_ORDER: DayTime[] = ['아침', '낮', '저녁', '새벽'];

function getTimeIcon(time: DayTime): { src: string; alt: string } {
  if (time === '저녁' || time === '새벽') return { src: MoonIcon, alt: '달' };
  return { src: SunIcon, alt: '해' };
}

function groupByTime(list: CalendarPurchase[]): Record<DayTime, CalendarPurchase[]> {
  const grouped: Record<DayTime, CalendarPurchase[]> = {
    아침: [],
    낮: [],
    저녁: [],
    새벽: [],
  };

  for (const item of list) grouped[item.timeLabel].push(item);
  return grouped;
}

// 별점 표시
function RatingStars({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(5, Math.floor(value))); // 0~5 정수로 clamp
  return (
    <div className="mt-1 inline-flex items-center gap-[6px]" aria-label={`별점 ${clamped}점`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < clamped;
        return (
          <img
            key={`star-${i}`}
            src={filled ? StarFilled : StarEmpty}
            alt={filled ? '채워진 별' : '빈 별'}
            className="w-[18px] h-[18px] block"
            draggable={false}
          />
        );
      })}
    </div>
  );
}

export default function CalendarPanel() {
  const navigate = useNavigate();

  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string>(
    toISO(today.getFullYear(), today.getMonth() + 1, today.getDate()),
  );

  // 구매 목록 열림/닫힘
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const sheetScrollRef = useRef<HTMLDivElement | null>(null);

  const toggleSheet = () => {
    setSheetOpen((prev) => {
      const next = !prev;
      if (next) {
        requestAnimationFrame(() => {
          sheetScrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
        });
      }
      return next;
    });
  };

  // 구매 목록 열려있으면 -> 배경 스크롤 잠금
  useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sheetOpen]);

  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [element, setElement] = useState<CalendarElement>({
    year,
    month,
    totalWon: 0,
    purchaseCount: 0,
  });

  const [itemsByDate, setItemsByDate] = useState<Record<string, CalendarPurchase[]>>({});

  useEffect(() => {
    let alive = true;

    const run = async () => {
      try {
        setLoadState('loading');
        setErrorMessage(null);

        const res = await reportApi.fetchCalendarMonth(year, month);

        if (!alive) return;

        setElement(res.element);
        setItemsByDate(res.itemsByDate ?? {});
        setLoadState('success');
      } catch (e) {
        if (!alive) return;

        const msg = e instanceof Error ? e.message : '캘린더 데이터를 불러오지 못했어요.';
        setErrorMessage(msg);
        setItemsByDate({});
        setElement({ year, month, totalWon: 0, purchaseCount: 0 });
        setLoadState('error');
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [year, month]);

  const purchaseMap = useMemo(() => {
    const map = new Map<string, CalendarPurchase[]>();
    Object.entries(itemsByDate).forEach(([date, list]) => {
      map.set(date, list ?? []);
    });
    return map;
  }, [itemsByDate]);

  const days: CalendarCell[] = useMemo(
    () => MonthDaysWithLeadingBlanks(year, month, purchaseMap),
    [year, month, purchaseMap],
  );

  const selectedPurchases: CalendarPurchase[] = purchaseMap.get(selectedDate) ?? [];
  const grouped = useMemo(() => groupByTime(selectedPurchases), [selectedPurchases]);

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

    // 월 이동 시 목록 닫기
    setSheetOpen(false);
  };

  const SHEET_CLOSED_H = 220;
  const SHEET_TOP_GAP = 150;

  return (
    <div className="px-4 pt-10 pb-0 min-h-screen flex flex-col gap-[30px] bg-secondary-100 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] relative">
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

      {loadState === 'loading' && <div className="text-[12px] text-gray-600">캘린더 불러오는 중…</div>}
      {loadState === 'error' && errorMessage && (
        <div className="text-[12px] text-primary-brown-400">{errorMessage}</div>
      )}

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

        <div className="grid grid-cols-7 gap-[6px]">
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
                  <div className={cn('w-[28px] h-[28px] rounded-full grid place-items-center font-normal')} />
                  <div className="mt-1 flex gap-[3px] h-[6px]" aria-hidden />
                </button>
              );
            }

            const iso = toISO(cell.date.getFullYear(), cell.date.getMonth() + 1, cell.date.getDate());
            const selected = iso === selectedDate;

            const count = purchaseMap.get(iso)?.length ?? 0;
            const dotCount = Math.min(3, count);
            const showPlus = count > 3;

            return (
              <button
                key={iso}
                type="button"
                onClick={() => {
                  setSelectedDate(iso);
                  setSheetOpen(false);
                }}
                className={cn(
                  'border-0 bg-transparent p-0 cursor-pointer',
                  'flex flex-col items-center justify-start h-[44px]',
                )}>
                <div
                  className={cn(
                    'w-[28px] h-[28px] rounded-full grid place-items-center font-normal',
                    selected ? 'bg-primary-600 text-white' : 'bg-transparent text-gray-600',
                  )}>
                  {cell.dayNumber}
                </div>

                <div className="mt-1 flex items-center gap-[3px] h-[6px]" aria-hidden>
                  {count > 0 ? (
                    <>
                      {Array.from({ length: dotCount }).map((_, i) => (
                        <span key={`${iso}-dot-${i}`} className="w-1 h-1 rounded-full bg-primary-brown-300" />
                      ))}
                      {showPlus ? <img src={PlusIcon} alt="더보기" className="w-[4px] h-[4px] block" /> : null}
                    </>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 구매 목록 */}
      <div
        className={cn(
          'fixed bottom-0 left-1/2 -translate-x-1/2',
          'w-[min(375px,100vw)]',
          'bg-primary-100 rounded-t-[20px] border border-gray-100',
          'shadow-[0px_-8px_18px_rgba(0,0,0,0.08)]',
          'px-[14px] pt-[14px] pb-[10px]',
          'flex flex-col',
          'transition-[height] duration-200 ease-out',
        )}
        style={{
          height: sheetOpen ? `calc(100dvh - ${SHEET_TOP_GAP}px)` : '40dvh',
        }}>
        <button
          type="button"
          onClick={toggleSheet}
          aria-label={sheetOpen ? '내리기' : '끌어올리기'}
          className="mx-auto mb-3 w-fit border-0 bg-transparent p-0 cursor-pointer active:scale-[0.98]">
          <img
            src={UpArrow}
            alt=""
            className={cn(
              'w-[30px] h-[30px] block transition-transform duration-200',
              sheetOpen ? 'rotate-180' : 'rotate-0',
            )}
          />
        </button>

        <div className="text-primary-brown-400 text-[16px] font-medium mb-3 ml-3">{formatKoreanDate(selectedDate)}</div>

        <div
          ref={sheetScrollRef}
          className={cn(
            'flex flex-col gap-3',
            sheetOpen ? 'overflow-y-auto' : 'overflow-hidden',
            '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
          )}
          style={{
            maxHeight: sheetOpen ? `calc(100dvh - ${SHEET_TOP_GAP + 90}px)` : 'calc(40dvh - 90px)',
          }}>
          {selectedPurchases.length === 0 ? (
            <div className="text-primary-brown-400 text-[12px] font-normal">선택한 날짜에 구매 기록이 없어요.</div>
          ) : (
            TIME_ORDER.map((time) => {
              const list = grouped[time];
              if (list.length === 0) return null;

              const icon = getTimeIcon(time);

              return (
                <div key={time} className="flex flex-col pl-1">
                  <div className="flex items-center gap-2 px-2 py-2">
                    <img src={icon.src} alt={icon.alt} className="h-[30px] block" />
                  </div>

                  {list.map((p) => (
                    <div
                      key={p.id}
                      className="grid grid-cols-[94px_1fr] gap-x-4 px-2 py-5 border-b border-b-[rgba(0,0,0,0.06)]">
                      <div className="flex items-center justify-center">
                        <div className="w-[94px] h-[104px] rounded-[5px] bg-gray-100 shadow-[0px_0px_4px_rgba(0,0,0,0.18)] overflow-hidden">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt="" className="w-full h-full object-cover block" />
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-col gap-0.5 flex justify-between pl-1">
                        <div className="text-[16px] font-medium text-black">{p.title}</div>

                        <div className="text-[16px] font-medium text-black mb-1">{formatWon(p.price)}</div>

                        <div className="flex flex-wrap gap-[8px]">
                          {p.reason.map((r: ConsumptionReason) => (
                            <div
                              key={`${p.id}-${r}`}
                              className="px-[6px] py-[3px] rounded-full bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] text-[12px] font-normal text-primary-brown-400">
                              #{r}
                            </div>
                          ))}
                        </div>

                        {/* 리뷰 작성시 -> 별점 */}
                        {p.hasReview && typeof p.rating === 'number' ? (
                          <div className="mt-1 w-fit">
                            <RatingStars value={p.rating} />
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => navigate('/report/review')}
                            className="mt-1 w-fit border-0 bg-transparent p-0 cursor-pointer text-gray-600 text-[12px] font-normal inline-flex items-center gap-[8px]">
                            구매 후기 작성하러 가기
                            <img src={RightArrow} alt="" className="w-[6px] h-[10px] block" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div style={{ height: `${SHEET_CLOSED_H + 12}px` }} />
    </div>
  );
}

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
  purchaseMap: Map<string, CalendarPurchase[]>,
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
      hasPurchase: (purchaseMap.get(iso)?.length ?? 0) > 0,
    });
  }

  return cells;
}
