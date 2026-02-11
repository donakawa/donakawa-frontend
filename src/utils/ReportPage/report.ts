import type {
  ConsumptionReason,
  Star,
  DayTime,
  TimeDistribution,
  Weekday,
  WeekdayDistribution,
} from '@/types/ReportPage/report';

export function formatWon(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}

export function toStar(n: number): Star {
  const rounded = Math.round(n);
  const clamped = Math.max(1, Math.min(5, rounded));
  return clamped as Star;
}

export function isConsumptionReason(v: string): v is ConsumptionReason {
  return v === '필요해서' || v === '세일 중' || v === '품절임박';
}

export function clampPercent(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export function emptyTimeDist(): TimeDistribution {
  return { 아침: 0, 낮: 0, 저녁: 0, 새벽: 0 };
}

export function emptyWeekdayDist(): WeekdayDistribution {
  return { 월: 0, 화: 0, 수: 0, 목: 0, 금: 0, 토: 0, 일: 0 };
}

export function toDayTimeFromAnalytics(label: string, displayName: string): DayTime {
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
      if (displayName === '아침' || displayName === '낮' || displayName === '저녁' || displayName === '새벽') {
        return displayName;
      }
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
      if (
        displayName === '월' ||
        displayName === '화' ||
        displayName === '수' ||
        displayName === '목' ||
        displayName === '금' ||
        displayName === '토' ||
        displayName === '일'
      ) {
        return displayName;
      }
      return '월';
  }
}

export function makeDayLabel(purchasedAtISO: string): string {
  const p = parseDateYYYYMMDD(purchasedAtISO) ?? parseDateFromISODateTime(purchasedAtISO);
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

export function parseDateYYYYMMDD(v: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}

// "2026-01-26T10:30:00.000Z" 같은 형태도 대응
export function parseDateFromISODateTime(v: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T/.exec(v);
  if (!m) return null;
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) };
}
