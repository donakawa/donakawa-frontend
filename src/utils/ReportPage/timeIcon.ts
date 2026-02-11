import type { DayTime } from '@/types/ReportPage/report';

import SunIcon from '@/assets/SunIcon.svg';
import MoonIcon from '@/assets/MoonIcon.svg';
import MoonDawnIcon from '@/assets/MoonDawnIcon.svg';

export type TimeIcon = { src: string; alt: string };

export function getTimeIcon(time: DayTime | string | null | undefined): TimeIcon {
  const t = time ?? '';

  if (t === '새벽' || t === 'DAWN') return { src: MoonDawnIcon, alt: '새벽 달' };
  if (t === '저녁' || t === 'EVENING') return { src: MoonIcon, alt: '달' };

  return { src: SunIcon, alt: '해' };
}
