import { useState } from 'react';

import * as S from '@/pages/ReportPage/ReportPage.style';

import StarIcon from '@/assets/star_line.svg';
import StarfullIcon from '@/assets/star_full.svg';
import RightArrow from '@/assets/arrow_right.svg';

import type {
  ConsumptionReason,
  MonthlyReport,
  PurchaseItem,
  Star,
  TabKey,
  DayTime,
  TimeDistribution,
} from '@/types/ReportPage/report';

export default function ReportPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('record');

  const monthlyReport: MonthlyReport = {
    totalWon: 234_500,
    savedWon: 23_500,
    reasons: ['필요해서', '세일 중', '품절임박'],
    averageSatisfaction: 4,
    reasonSatisfaction: {
      필요해서: 4,
      '세일 중': 4,
      품절임박: 4,
    },
    insight:
      '세일이나 품절임박 등에 휘말리지 않도록 주의해 보아요. 구매 전, ‘세일하지 않아도 구매할만한 물건일까?’를 깊이 고민해 보세요.',
  };

  const timeDistribution: TimeDistribution = {
    아침: 75,
    낮: 75,
    저녁: 75,
    새벽: 75,
  };

  const purchaseItems: PurchaseItem[] = [
    { id: '1', title: '캐시미어 로제 더블 하프코트', price: 238_400, daylabel: '38', itemImgUrl: '' },
    { id: '2', title: '캐시미어 로제 더블 하프코트', price: 238_400, daylabel: '38', itemImgUrl: '' },
    { id: '3', title: '캐시미어 로제 더블 하프코트', price: 238_400, daylabel: '38', itemImgUrl: '' },
    { id: '4', title: '캐시미어 로제 더블 하프코트', price: 238_400, daylabel: '38', itemImgUrl: '' },
  ];

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

      <S.Body>
        {/* 최근 한 달 리포트 */}
        <S.Section>
          <S.SectionTitle>최근 한 달 리포트</S.SectionTitle>

          <S.Card>
            <S.ContentLine>
              <S.ContentTitle>총 소비</S.ContentTitle>
              <S.ContentValue>-{formatWon(monthlyReport.totalWon)}원</S.ContentValue>
            </S.ContentLine>

            <S.ContentLine>
              <S.ContentTitle>절약 금액</S.ContentTitle>
              <S.ContentValue>{formatWon(monthlyReport.savedWon)}원</S.ContentValue>
            </S.ContentLine>

            <S.ContentLine>
              <S.ContentTitle>소비 이유</S.ContentTitle>
              <S.TagLine style={{ gap: '6px' }}>
                {monthlyReport.reasons.map((reason: ConsumptionReason) => (
                  <S.Tag key={reason}>#{reason}</S.Tag>
                ))}
              </S.TagLine>
            </S.ContentLine>

            <S.ContentLine>
              <S.ContentTitle>평균 만족도</S.ContentTitle>
              <StarLine value={monthlyReport.averageSatisfaction} />
            </S.ContentLine>

            <S.ReasonStars>
              {(Object.keys(monthlyReport.reasonSatisfaction) as ConsumptionReason[]).map((reason) => (
                <S.TagLine key={reason}>
                  <S.Tag>#{reason}</S.Tag>
                  <StarLine value={monthlyReport.reasonSatisfaction[reason]} />
                </S.TagLine>
              ))}
            </S.ReasonStars>

            <S.DottedLine />

            <S.TotalTitle>Total</S.TotalTitle>
            <S.TotalText>{monthlyReport.insight}</S.TotalText>
          </S.Card>
        </S.Section>

        {/* 주로 구매하는 시간대 */}
        <S.Section>
          <S.SectionTitle>주로 구매하는 시간대</S.SectionTitle>

          <S.Card>
            <S.Slot>
              <S.SlotButton $active type="button">
                달
              </S.SlotButton>
              <S.SlotButton $active={false} type="button">
                주
              </S.SlotButton>
            </S.Slot>

            <S.ChartWrap>
              <S.GridOverlay aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <S.GridLine key={i} />
                ))}
              </S.GridOverlay>

              <S.Chart>
                <S.YAxis>
                  {([100, 75, 50, 25, 0] as const).map((p) => (
                    <S.YAxisLine key={p}>
                      <S.YAxisLabel>{p}%</S.YAxisLabel>
                    </S.YAxisLine>
                  ))}
                </S.YAxis>

                <S.Bars>
                  {(Object.keys(timeDistribution) as DayTime[]).map((k) => (
                    <S.BarCol key={k}>
                      <S.BarSet>
                        <S.Bar style={{ height: `${TimePercent(timeDistribution[k])}%` }} />
                      </S.BarSet>
                      <S.BarLabel>{k}</S.BarLabel>
                    </S.BarCol>
                  ))}
                </S.Bars>
              </S.Chart>
            </S.ChartWrap>
          </S.Card>
        </S.Section>

        {/* 소비 후기 작성 */}
        <S.Section>
          <S.PSSection>
            <S.PSSectionTitle>소비 후기 작성하러 가볼까요?</S.PSSectionTitle>
            <S.PSIcon src={RightArrow} aria-hidden />
          </S.PSSection>

          <S.PSItemList>
            {purchaseItems.map((item) => (
              <S.PSItemCard key={item.id}>
                <S.ItemSet>
                  <S.ItemDay>{item.daylabel} Day+</S.ItemDay>
                  <S.ItemImg>{item.itemImgUrl}</S.ItemImg>
                  <S.ItemPrice>{formatWon(item.price)}</S.ItemPrice>
                  <S.ItemTitle>{item.title}</S.ItemTitle>
                </S.ItemSet>
              </S.PSItemCard>
            ))}
          </S.PSItemList>
        </S.Section>
      </S.Body>
    </S.Page>
  );
}

// 함수 모음
function formatWon(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}

function StarLine({ value }: { value: Star }) {
  return (
    <S.StarWrap aria-hidden>
      {([1, 2, 3, 4, 5] as const).map((i) => (
        <S.StarIcon key={i} src={i <= value ? StarfullIcon : StarIcon} alt="" />
      ))}
    </S.StarWrap>
  );
}

function TimePercent(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}
