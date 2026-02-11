import type { PendingReviewItem } from '@/types/ReportPage/review';
import { PendingReviewCard } from '@/pages/ReportPage/components/ReviewItemCard';

interface PendingViewProps {
  items: PendingReviewItem[];
  onWriteClick: (id: string) => void;
}

export default function PendingPage({ items, onWriteClick }: PendingViewProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col">
        <div className="px-4 pt-4 text-[12px] font-medium text-gray-600">작성할 후기가 없어요.</div>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 pt-4 text-[12px] font-medium text-gray-600">
        작성하지 않은 소비 후기가 {items.length}건 있어요.
      </div>

      <div className="flex flex-col gap-3 px-4 py-4">
        {items.map((item) => (
          <PendingReviewCard key={item.id} item={item} onWriteClick={onWriteClick} />
        ))}
      </div>
    </>
  );
}
