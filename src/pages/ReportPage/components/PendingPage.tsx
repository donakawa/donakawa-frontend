import type { PendingReviewItem } from '@/types/ReportPage/review';
import PendingReviewItemCard from '@/pages/ReportPage/components/ReviewItemCard';

interface PendingViewProps {
  items: PendingReviewItem[];
  onWriteClick: (id: string) => void;
}

export default function PendingView({ items, onWriteClick }: PendingViewProps) {
  return (
    <>
      <div className="px-4 pt-4 text-[12px] font-medium text-[rgba(0,0,0,0.45)]">
        작성하지 않은 소비 후기가 {items.length}건 있어요.
      </div>

      <div className="flex flex-col">
        {items.map((item) => (
          <PendingReviewItemCard key={item.id} item={item} onWriteClick={onWriteClick} />
        ))}
      </div>
    </>
  );
}
