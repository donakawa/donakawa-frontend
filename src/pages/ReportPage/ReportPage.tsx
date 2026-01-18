import { useState } from 'react';
import * as S from '@/pages/ReportPage/ReportPage.style';

import type { TabKey } from '@/types/ReportPage/report';

import RecordView from '@/pages/ReportPage/components/RecordPanel';
import CalendarView from '@/pages/ReportPage/components/CalendarPanel';

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('record');

  return (
    <S.Page>
      <S.TopTabs>
        <S.TabButton isActive={activeTab === 'record'} type="button" onClick={() => setActiveTab('record')}>
          기록
        </S.TabButton>

        <S.TabButton isActive={activeTab === 'calendar'} type="button" onClick={() => setActiveTab('calendar')}>
          캘린더
        </S.TabButton>
      </S.TopTabs>

      {/* Body는 뷰에서 렌더링 */}
      {activeTab === 'record' ? <RecordView /> : <CalendarView />}
    </S.Page>
  );
}
