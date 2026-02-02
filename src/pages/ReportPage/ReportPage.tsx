import { useState } from 'react';

import type { TabKey } from '@/types/ReportPage/report';

import RecordView from '@/pages/ReportPage/components/RecordPanel';
import CalendarView from '@/pages/ReportPage/components/CalendarPanel';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('record');

  return (
    <div className="w-full min-h-full bg-[var(--color-primary-100)] text-[var(--color-gray-1000)]">
      <div className="flex gap-[10px] px-4 pt-3 bg-[var(--color-white)]">
        <button
          type="button"
          onClick={() => setActiveTab('record')}
          className={cn(
            "font-['Galmuri11'] font-bold text-[20px] px-3 py-[7px] rounded-t-[10px]",
            '[clip-path:inset(-10px_-10px_0px_-10px)]',
            'shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]',
            activeTab === 'record'
              ? 'border-b border-b-[var(--color-white)] bg-[var(--color-primary-100)] text-[var(--color-primary-brown-500)]'
              : 'border-b border-b-[var(--color-gray-200)] bg-[var(--color-white)] text-[var(--color-gray-200)]',
            'transition-[background,border-color,transform] duration-150 ease-out',
          )}>
          기록
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={cn(
            "font-['Galmuri11'] font-bold text-[20px] px-3 py-[7px] rounded-t-[10px]",
            '[clip-path:inset(-10px_-10px_0px_-10px)]',
            'shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]',
            activeTab === 'calendar'
              ? 'border-b border-b-[var(--color-white)] bg-[var(--color-secondary-100)] text-[var(--color-primary-brown-500)]'
              : 'border-b border-b-[var(--color-gray-200)] bg-[var(--color-white)] text-[var(--color-gray-200)]',
            'transition-[background,border-color,transform] duration-150 ease-out',
          )}>
          캘린더
        </button>
      </div>

      {activeTab === 'record' ? <RecordView /> : <CalendarView />}
    </div>
  );
}
