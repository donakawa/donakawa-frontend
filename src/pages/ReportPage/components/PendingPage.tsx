import * as S from '@/pages/ReportPage/components/PendingPage.style';
import type { PendingReviewItem } from '@/types/ReportPage/review';
import PendingReviewItemCard from '@/pages/ReportPage/components/ReviewItemCard';

interface PendingViewProps {
  items: PendingReviewItem[];
  onWriteClick: (id: string) => void;
}

export default function PendingView({ items, onWriteClick }: PendingViewProps) {
  return (
    <>
      <S.SectionHint>작성하지 않은 소비 후기가 {items.length}건 있어요.</S.SectionHint>

      <S.List>
        {items.map((item) => (
          <PendingReviewItemCard key={item.id} item={item} onWriteClick={onWriteClick} />
        ))}
      </S.List>
    </>
  );
}
