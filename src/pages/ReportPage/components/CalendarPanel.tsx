import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import DefaultImg from '@/assets/default_item_photo.svg?url';
import RightArrow from '@/assets/arrow_right(gray).svg';
import LeftArrow from '@/assets/arrow_left(gray).svg';
import UpArrow from '@/assets/arrow_up(gray).svg';
import PlusIcon from '@/assets/view_more(brown).svg';
import StarFilled from '@/assets/star_full.svg';
import StarEmpty from '@/assets/star_line.svg';

import type { CalendarPurchase } from '@/apis/ReportPage/report';
import { formatWon } from '@/utils/ReportPage/report';
import { formatKoreanDate, toISO } from '@/utils/ReportPage/calendar';
import { getTimeIcon } from '@/utils/ReportPage/timeIcon';
import { useCalendarMonth } from '@/pages/ReportPage/hooks/useCalendarMonth';
import type { CalendarCell, DayTime } from '@/types/ReportPage/report';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

// 별점 표시
function RatingStars({ value }: { value: number }) {
  const clamped = Math.max(0, Math.min(5, Math.floor(value)));
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

  const {
    year,
    month,
    selectedDate,
    element,
    purchaseMap,
    days,
    selectedPurchases,
    grouped,
    loadState,
    errorMessage,
    moveMonth,
    selectDate,
    timeOrder,
  } = useCalendarMonth();

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

  // 날짜 선택 바뀌면 목록 닫기
  const onSelectDate = (iso: string) => {
    selectDate(iso);
    setSheetOpen(false);
  };

  // 월 이동하면 목록 닫기
  const onMoveMonth = (delta: -1 | 1) => {
    moveMonth(delta);
    setSheetOpen(false);
  };

  const groupedMemo = useMemo(() => grouped, [grouped]);

  const SHEET_CLOSED_H = 220;
  const SHEET_TOP_GAP = 150;

  return (
    <div className="px-4 pt-10 pb-0 min-h-screen flex flex-col gap-[30px] bg-secondary-100 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] relative">
      <div className="flex items-center gap-[10px]">
        <button
          type="button"
          aria-label="이전 달"
          onClick={() => onMoveMonth(-1)}
          className="w-[30px] h-[30px] p-0 border-0 bg-transparent cursor-pointer inline-flex items-center justify-center active:scale-[0.98]">
          <img src={LeftArrow} alt="" />
        </button>

        <div className="text-[20px] font-semibold text-black">
          {year}.{String(month).padStart(2, '0')}
        </div>

        <button
          type="button"
          aria-label="다음 달"
          onClick={() => onMoveMonth(1)}
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
          {days.map((cell: CalendarCell, idx: number) => {
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
                onClick={() => onSelectDate(iso)}
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
            (timeOrder as readonly DayTime[]).map((time) => {
              const list = groupedMemo[time];
              if (!list || list.length === 0) return null;

              const icon = getTimeIcon(time);

              return (
                <div key={time} className="flex flex-col pl-1">
                  <div className="flex items-center gap-2 px-2 py-2">
                    <img src={icon.src} alt={icon.alt} className="h-[30px] block" />
                  </div>

                  {(list as CalendarPurchase[]).map((p) => {
                    const reasons: string[] = Array.isArray((p as CalendarPurchase).reason)
                      ? ((p as CalendarPurchase).reason.filter(
                          (x): x is string => typeof x === 'string' && x.length > 0,
                        ) as string[])
                      : [];

                    return (
                      <div
                        key={p.id}
                        className="grid grid-cols-[94px_1fr] gap-x-4 px-2 py-5 border-b border-b-[rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-center">
                          <div className="w-[94px] h-[104px] rounded-[5px] bg-gray-100 shadow-[0px_0px_4px_rgba(0,0,0,0.18)] overflow-hidden">
                            <img
                              src={p.imageUrl?.trim() ? p.imageUrl : DefaultImg}
                              alt=""
                              className="w-full h-full object-cover block"
                              draggable={false}
                              onError={(e) => {
                                const img = e.currentTarget;
                                if (img.src !== DefaultImg) img.src = DefaultImg;
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex flex-col justify-between gap-0.5 pl-1">
                          <div className="text-[16px] font-medium text-black">{p.title}</div>

                          <div className="text-[16px] font-medium text-black mb-1">{formatWon(p.price)}</div>

                          {reasons.length > 0 ? (
                            <div className="flex flex-wrap gap-[8px]">
                              {reasons.map((r) => (
                                <div
                                  key={`${p.id}-${r}`}
                                  className="px-[6px] py-[3px] rounded-full bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] text-[12px] font-normal text-primary-brown-400">
                                  #{r}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[12px] text-gray-600">구매 이유 없음</div>
                          )}

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
                    );
                  })}
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
