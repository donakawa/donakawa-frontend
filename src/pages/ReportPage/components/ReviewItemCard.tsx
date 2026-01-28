import { useNavigate } from 'react-router-dom';

import type { ReviewItemCardProps } from '@/types/ReportPage/review';

import StarFullIcon from '@/assets/star_full.svg';
import StarIcon from '@/assets/star_line.svg';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function ReviewItemCard({ item, onOpenClick }: ReviewItemCardProps) {
  const navigate = useNavigate();

  const isCompleted = 'rating' in item;

  const goToWritePage = () => {
    navigate(`/report/review/write?purchaseId=${encodeURIComponent(item.id)}`);
  };

  const handleCompletedClick = () => {
    onOpenClick?.(item.id);
  };

  if (isCompleted) {
    return (
      <div
        onClick={handleCompletedClick}
        role={onOpenClick ? 'button' : undefined}
        className={cn('p-4 border-b border-b-gray-100', onOpenClick ? 'cursor-pointer' : 'cursor-default')}>
        <div className="flex gap-[21px]">
          <div className="w-[94px] flex-none">
            <div className="w-[94px] h-[94px] rounded-[5px] overflow-hidden shrink-0">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover block" />
            </div>

            <div className="mt-[6px]">
              <div className="text-[12px] font-medium mb-1">{item.price.toLocaleString('ko-KR')}</div>
              <div className="text-[14px] font-normal leading-[1.3] whitespace-nowrap overflow-hidden text-ellipsis">
                {item.title}
              </div>
            </div>
          </div>

          <div className="flex-1 py-[3px] min-w-0 flex flex-col justify-between">
            <div className="flex gap-2 flex-wrap">
              {item.tags.map((t) => (
                <span
                  key={`${item.id}-${t}`}
                  className="px-[6px] py-[3px] rounded-full bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] text-[12px] font-normal text-primary-brown-500">
                  #{t}
                </span>
              ))}
            </div>

            <div className="flex gap-[6px] items-center" aria-label={`별점 ${item.rating}점 / 5점`}>
              {Array.from({ length: 5 }, (_, i) => {
                const filled = i < item.rating;
                return (
                  <img
                    key={`${item.id}-star-${i}`}
                    src={filled ? StarFullIcon : StarIcon}
                    alt={filled ? '채워진 별' : '비워진 별'}
                    className="w-[18px] h-[18px] block"
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-b-gray-100">
      <div className="flex gap-[14px]">
        <div className="w-[94px] h-[94px] rounded-[5px] overflow-hidden shrink-0">
          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover block" />
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="text-[16px] font-medium whitespace-nowrap overflow-hidden text-ellipsis">{item.title}</div>
          <div className="text-[16px] font-medium">{item.price.toLocaleString('ko-KR')}</div>
          <div className="text-[16px] font-medium text-gray-600">구매한 지 {item.daylabel}DAY+</div>
        </div>
      </div>

      <button
        type="button"
        onClick={goToWritePage}
        className="mt-[14px] w-full h-9 border-0 rounded-[5px] bg-primary-400 text-white text-[16px] font-medium cursor-pointer">
        소비 후기 작성
      </button>
    </div>
  );
}
