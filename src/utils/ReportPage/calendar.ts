import type { CalendarCell, CalendarPurchaseItem, DayTime } from '@/types/ReportPage/report';

export type CalendarPurchase = CalendarPurchaseItem & { rating?: number };

export const TIME_ORDER: DayTime[] = ['아침', '낮', '저녁', '새벽'];

export function toISO(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

export function parseISO(iso: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

export function daysInMonth(y: number, m1to12: number): number {
  return new Date(y, m1to12, 0).getDate();
}

export function formatKoreanDate(iso: string): string {
  const p = parseISO(iso);
  if (!p) return iso;
  return `${p.y}.${String(p.m).padStart(2, '0')}.${String(p.d).padStart(2, '0')}`;
}

export function groupByTime(list: CalendarPurchase[]): Record<DayTime, CalendarPurchase[]> {
  const grouped: Record<DayTime, CalendarPurchase[]> = { 아침: [], 낮: [], 저녁: [], 새벽: [] };
  for (const item of list) grouped[item.timeLabel].push(item);
  return grouped;
}

export function monthDaysWithLeadingBlanks(
  year: number,
  month1to12: number,
  purchaseMap: Map<string, CalendarPurchase[]>,
): CalendarCell[] {
  const first = new Date(year, month1to12 - 1, 1);

  // 월요일 시작 (Mon=0)
  const mondayStartIndex = (first.getDay() + 6) % 7;
  const lastDay = daysInMonth(year, month1to12);

  const cells: CalendarCell[] = [];

  for (let i = 0; i < mondayStartIndex; i += 1) {
    cells.push({ date: null, dayNumber: null, inCurrentMonth: false, hasPurchase: false });
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
