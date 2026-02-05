import type { CompletedReviewItem } from '@/types/ReportPage/review';
import WrittenReviewItemCard from '@/pages/ReportPage/components/ReviewItemCard';

interface WrittenViewProps {
  items: CompletedReviewItem[];
  onOpenClick: (id: string) => void;
}

export default function WrittenView({ items, onOpenClick }: WrittenViewProps) {
  return (
    <>
      <div className="px-4 pt-4 text-[12px] font-medium text-[rgba(0,0,0,0.45)]">
        작성한 소비 후기가 {items.length}건 있어요.
      </div>

      <div className="flex flex-col">
        {items.map((item) => (
          <WrittenReviewItemCard key={item.id} item={item} onOpenClick={onOpenClick} />
        ))}
      </div>
    </>
  );
}
