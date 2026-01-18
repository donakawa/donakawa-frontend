import * as S from '@/pages/ReportPage/components/CompletedPage.style';
import type { CompletedReviewItem } from '@/types/ReportPage/review';
import WrittenReviewItemCard from '@/pages/ReportPage/components/ReviewItemCard';

interface WrittenViewProps {
  items: CompletedReviewItem[];
  onOpenClick: (id: string) => void;
}

export default function WrittenView({ items, onOpenClick }: WrittenViewProps) {
  return (
    <>
      <S.SectionHint>작성한 소비 후기가 {items.length}건 있어요.</S.SectionHint>

      <S.List>
        {items.map((item) => (
          <WrittenReviewItemCard key={item.id} item={item} onOpenClick={onOpenClick} />
        ))}
      </S.List>
    </>
  );
}
