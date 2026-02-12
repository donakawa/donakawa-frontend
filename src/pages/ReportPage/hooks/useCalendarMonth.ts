import { useEffect, useMemo, useState } from 'react';

import { reportApi } from '@/apis/ReportPage/report';
import type { CalendarPurchase } from '@/apis/ReportPage/report';
import type { CalendarCell, CalendarElement, DayTime } from '@/types/ReportPage/report';
import {
  TIME_ORDER,
  daysInMonth,
  groupByTime,
  monthDaysWithLeadingBlanks,
  parseISO,
  toISO,
} from '@/utils/ReportPage/calendar';

export type LoadState = 'idle' | 'loading' | 'success' | 'error';

type UseCalendarMonthResult = {
  year: number;
  month: number; // 1~12
  selectedDate: string; // YYYY-MM-DD

  setSelectedDate: (iso: string) => void;

  element: CalendarElement;
  itemsByDate: Record<string, CalendarPurchase[]>;

  purchaseMap: Map<string, CalendarPurchase[]>;
  days: CalendarCell[];

  selectedPurchases: CalendarPurchase[];
  grouped: Record<DayTime, CalendarPurchase[]>;

  loadState: LoadState;
  errorMessage: string | null;

  moveMonth: (delta: -1 | 1) => void;
  selectDate: (iso: string) => void;

  timeOrder: readonly DayTime[];
};

export function useCalendarMonth(): UseCalendarMonthResult {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState<number>(today.getFullYear());
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string>(
    toISO(today.getFullYear(), today.getMonth() + 1, today.getDate()),
  );

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
    () => monthDaysWithLeadingBlanks(year, month, purchaseMap),
    [year, month, purchaseMap],
  );

  const selectedPurchases: CalendarPurchase[] = purchaseMap.get(selectedDate) ?? [];
  const grouped = useMemo(() => groupByTime(selectedPurchases), [selectedPurchases]);

  const selectDate = (iso: string) => {
    setSelectedDate(iso);
  };

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

  return {
    year,
    month,
    selectedDate,
    setSelectedDate,

    element,
    itemsByDate,

    purchaseMap,
    days,

    selectedPurchases,
    grouped,

    loadState,
    errorMessage,

    moveMonth,
    selectDate,

    timeOrder: TIME_ORDER,
  };
}
