import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import * as C from '@/pages/ReportPage/components/CalendarPanel.style';

import RightArrow from '@/assets/arrow_right(gray).svg';
import LeftArrow from '@/assets/arrow_left(gray).svg';

import type { CalendarCell, CalendarElement, CalendarPurchaseItem, ConsumptionReason } from '@/types/ReportPage/report';

export default function CalendarPanel() {
  const navigate = useNavigate();

  const [year, setYear] = useState<number>(2026);
  const [month, setMonth] = useState<number>(1);

  // ✅ selectedDate는 "YYYY-MM-DD" 고정
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
        reason: ['세일 중'] satisfies ConsumptionReason[],
        title: '니트 장갑',
        price: 18_900,
        imageUrl: '',
        hasReview: true,
      },
      {
        id: '3',
        date: toISO(2026, 1, 12),
        timeLabel: '낮',
        reason: ['필요해서'] satisfies ConsumptionReason[],
        title: '울 머플러',
        price: 32_000,
        imageUrl: '',
        hasReview: false,
      },
    ],
    [],
  );

  // ✅ 날짜별 구매내역 맵
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

  // ✅ "현재 달 존재하는 날짜만" 생성 (1~마지막날)
  const days: CalendarCell[] = useMemo(() => {
    return MonthDaysWithLeadingBlanks(year, month, purchaseMap);
  }, [year, month, purchaseMap]);

  const selectedPurchases = purchaseMap.get(selectedDate) ?? [];

  // ✅ 월 이동: 선택 day 최대한 유지
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
    <C.Wrap>
      <C.CalendarTitle>
        <C.NavButton type="button" aria-label="이전 달" onClick={() => moveMonth(-1)}>
          <img src={LeftArrow} alt="" />
        </C.NavButton>

        <C.MonthText>
          {year}.{String(month).padStart(2, '0')}
        </C.MonthText>

        <C.NavButton type="button" aria-label="다음 달" onClick={() => moveMonth(1)}>
          <img src={RightArrow} alt="" />
        </C.NavButton>
      </C.CalendarTitle>

      <C.Elementrow>
        <C.ElementAmount>{formatWon(element.totalWon)}원</C.ElementAmount>
        <C.ElementCount>{element.purchaseCount}회 구매</C.ElementCount>
      </C.Elementrow>

      <C.CalendarGrid>
        <C.Week>
          {(['월', '화', '수', '목', '금', '토', '일'] as const).map((w) => (
            <C.Weekday key={w}>{w}</C.Weekday>
          ))}
        </C.Week>

        <C.Grid>
          {days.map((cell, idx) => {
            // ✅ 빈칸: DOM을 반드시 만들어서 칸을 차지하게
            if (!cell.date || cell.dayNumber == null) {
              return (
                <C.DayCellButton
                  key={`blank-${year}-${month}-${idx}`}
                  type="button"
                  $selected={false}
                  $muted
                  disabled
                  aria-hidden>
                  <div className="num" />
                  <div className="dots" aria-hidden />
                </C.DayCellButton>
              );
            }

            const iso = toISO(cell.date.getFullYear(), cell.date.getMonth() + 1, cell.date.getDate());
            const selected = iso === selectedDate;

            return (
              <C.DayCellButton
                key={iso}
                type="button"
                $selected={selected}
                $muted={false}
                onClick={() => setSelectedDate(iso)}>
                <div className="num">{cell.dayNumber}</div>

                <div className="dots" aria-hidden>
                  {cell.hasPurchase ? (
                    <>
                      <span className="dot" />
                      <span className="dot" />
                      <span className="dot" />
                    </>
                  ) : null}
                </div>
              </C.DayCellButton>
            );
          })}
        </C.Grid>
      </C.CalendarGrid>

      <C.BottomSheet>
        <C.Handle aria-hidden />

        <C.PurchaseList>
          {selectedPurchases.length === 0 ? (
            <C.SubText>선택한 날짜에 구매 기록이 없어요.</C.SubText>
          ) : (
            selectedPurchases.map((p) => (
              <C.PurchaseCard key={p.id}>
                <div>
                  <C.Thumb>{p.imageUrl ? <img src={p.imageUrl} alt="" /> : null}</C.Thumb>
                  <C.Price>{formatWon(p.price)}</C.Price>
                  <C.Title>{p.title}</C.Title>
                </div>

                <C.InfoCol>
                  <C.Row>
                    <C.Label>구매 이유:</C.Label>
                    <C.TagLine>
                      {p.reason.map((r) => (
                        <C.Tag key={`${p.id}-${r}`}>#{r}</C.Tag>
                      ))}
                    </C.TagLine>
                  </C.Row>

                  <C.Row>
                    <C.Label>구매 일시:</C.Label>
                    <C.SubText>
                      {formatKoreanDate(p.date)} {p.timeLabel}
                    </C.SubText>
                  </C.Row>

                  <C.ReviewLink type="button" onClick={() => navigate('/report/review')}>
                    구매 후기 작성하러 가기 <C.RightChevron>›</C.RightChevron>
                  </C.ReviewLink>
                </C.InfoCol>
              </C.PurchaseCard>
            ))
          )}
        </C.PurchaseList>
      </C.BottomSheet>
    </C.Wrap>
  );
}

/** ===== 유틸 ===== */

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

  // 월요일 시작 기준: 월=0 ... 일=6
  const mondayStartIndex = (first.getDay() + 6) % 7;

  const lastDay = daysInMonth(year, month1to12);

  const cells: CalendarCell[] = [];

  // ✅ 1) 월~(시작요일-1)까지 빈칸 채우기
  for (let i = 0; i < mondayStartIndex; i += 1) {
    cells.push({
      date: null,
      dayNumber: null,
      inCurrentMonth: false,
      hasPurchase: false,
    });
  }

  // ✅ 2) 1일~말일까지
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
