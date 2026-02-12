import type { Star, DayTime, TimeDistribution, Weekday, WeekdayDistribution } from '@/types/ReportPage/report';

export function formatWon(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}

export function clampPercent(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export function toStar(n: number): Star {
  const rounded = Math.round(n);
  const clamped = Math.max(1, Math.min(5, rounded));
  return clamped as Star;
}

export function toStarOrNull(n: number | null | undefined): Star | null {
  if (n == null) return null;
  return toStar(n);
}

export function toStarFallback(n: number | null | undefined, fallback: Star): Star {
  if (n == null) return fallback;
  return toStar(n);
}

export function hasConsumptionData(summary: { totalSpent: number }, topReasons: Array<{ count: number }>): boolean {
  if (summary.totalSpent > 0) return true;
  return topReasons.some((r) => r.count > 0);
}

export function emptyTimeDist(): TimeDistribution {
  return { 아침: 0, 낮: 0, 저녁: 0, 새벽: 0 };
}

export function emptyWeekdayDist(): WeekdayDistribution {
  return { 월: 0, 화: 0, 수: 0, 목: 0, 금: 0, 토: 0, 일: 0 };
}

export function isWeekdayDisplayName(v: string): v is Weekday {
  return v === '월' || v === '화' || v === '수' || v === '목' || v === '금' || v === '토' || v === '일';
}

export function isDayTimeDisplayName(v: string): v is DayTime {
  return v === '아침' || v === '낮' || v === '저녁' || v === '새벽';
}

export function toDayTimeFromAnalytics(label: string, displayName: string): DayTime {
  switch (label) {
    case 'MORNING':
      return '낮';
    case 'EVENING':
      return '저녁';
    case 'NIGHT':
      return '새벽';
    default:
      if (isDayTimeDisplayName(displayName)) return displayName;
      return '낮';
  }
}

export function toWeekdayFromAnalytics(label: string, displayName: string): Weekday {
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
      if (isWeekdayDisplayName(displayName)) return displayName;
      return '월';
  }
}

export function toDayTimeFromCalendar(purchasedAt: string): DayTime {
  switch (purchasedAt) {
    case 'MORNING':
      return '낮';
    case 'EVENING':
      return '저녁';
    case 'NIGHT':
      return '새벽';
    default:
      return '낮';
  }
}

export type DayLabel = 'Today' | `${number} Day+`;

function parseToLocalMidnight(dateString: string): Date | null {
  const ymd = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (ymd) {
    const y = Number(ymd[1]);
    const m = Number(ymd[2]);
    const d = Number(ymd[3]);
    const dt = new Date(y, m - 1, d);
    if (Number.isNaN(dt.getTime())) return null;
    dt.setHours(0, 0, 0, 0);
    return dt;
  }

  const dt = new Date(dateString);
  if (Number.isNaN(dt.getTime())) return null;
  dt.setHours(0, 0, 0, 0);
  return dt;
}

export function getDDayLabel(dateString: string): DayLabel {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const purchaseDate = parseToLocalMidnight(dateString);
  if (!purchaseDate) return 'Today';

  const diffTime = today.getTime() - purchaseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  return `${diffDays} Day+`;
}

export function makeDayLabel(purchasedAtISO: string): DayLabel {
  return getDDayLabel(purchasedAtISO);
}

export function parseDateYYYYMMDD(v: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

export function parseDateFromISODateTime(v: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T/.exec(v);
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}
