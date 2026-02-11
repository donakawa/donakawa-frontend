import { useNavigate } from 'react-router-dom';

import type { PendingReviewItem, CompletedReviewItem } from '@/types/ReportPage/review';

import StarFullIcon from '@/assets/star_full.svg';
import StarIcon from '@/assets/star_line.svg';

type PendingCardProps = {
  item: PendingReviewItem;
  onWriteClick: (id: string) => void;
};

type CompletedCardProps = {
  item: CompletedReviewItem;
  onOpenClick: (id: string) => void;
};

export function PendingReviewCard({ item }: PendingCardProps) {
  const navigate = useNavigate();

  const goToWritePage = () => {
    navigate(`/report/review/write?purchasedId=${encodeURIComponent(item.id)}`);
  };

  return (
    <div className="p-5 relative">
      <div className="absolute left-4 right-4 bottom-0 h-px bg-gray-100" />

      <div className="flex gap-[14px]">
        <div className="w-[94px] h-[94px] rounded-[5px] overflow-hidden bg-gray-100 shrink-0">
          {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between gap-1">
          <div className="text-[16px] font-medium truncate">{item.title}</div>
          <div className="text-[16px] font-medium">{item.price.toLocaleString()}원</div>
          <div className="text-[16px] font-medium text-gray-600">구매한 지 {item.dayLabel}DAY+</div>
        </div>
      </div>

      <button
        type="button"
        onClick={goToWritePage}
        className="mt-[14px] w-full h-9 rounded-[5px] bg-primary-400 text-white text-[16px] font-medium">
        소비 후기 작성
      </button>
    </div>
  );
}

export function CompletedReviewCard({ item, onOpenClick }: CompletedCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpenClick(item.reviewId)}
      className="w-full text-left p-5 relative bg-transparent border-0">
      <div className="absolute left-4 right-4 bottom-0 h-px bg-gray-100" />

      <div className="flex gap-[20px]">
        <div className="w-[94px] h-[104px] rounded-[5px] overflow-hidden bg-gray-100 shrink-0">
          {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-[6px]">
          <div>
            <div className="text-[16px] font-medium">{item.title}</div>
            <div className="text-[16px] font-medium">{item.price.toLocaleString()}원</div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {item.tags.map((t) => (
              <span
                key={`${item.reviewId}-${t}`}
                className="px-[6px] py-[3px] rounded-full bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] text-[12px] font-normal text-primary-brown-500">
                #{t}
              </span>
            ))}
          </div>

          <div className="flex gap-[6px]">
            {Array.from({ length: 5 }, (_, i) => (
              <img key={i} src={i < item.rating ? StarFullIcon : StarIcon} className="w-[18px] h-[18px]" />
            ))}
          </div>
        </div>
      </div>
    </button>
  );
}
