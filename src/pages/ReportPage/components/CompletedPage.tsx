import type { CompletedReviewItem } from '@/types/ReportPage/review';
import { CompletedReviewCard } from '@/pages/ReportPage/components/ReviewItemCard';

interface CompletedPageProps {
  items: CompletedReviewItem[];
  onOpenClick: (id: string) => void;
}

export default function CompletedPage({ items, onOpenClick }: CompletedPageProps) {
  return (
    <div className="flex flex-col">
      <div className="px-4 pt-4 text-[12px] font-medium text-gray-600">작성한 소비 후기가 {items.length}건 있어요.</div>

      {items.length === 0 ? (
        <div className="px-4 pt-2 text-[12px] font-medium text-gray-500">아직 작성한 후기가 없어요.</div>
      ) : (
        <div className="flex flex-col">
          {items.map((item) => (
            <CompletedReviewCard key={item.id} item={item} onOpenClick={onOpenClick} />
          ))}
        </div>
      )}
    </div>
  );
}
