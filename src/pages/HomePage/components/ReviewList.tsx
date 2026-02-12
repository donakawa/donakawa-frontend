import React from 'react';
import { motion } from 'framer-motion';
import ArrowIcon from '@/assets/arrow.svg?react';

interface ReviewItem {
  itemId: number;
  purchasedAt: string;
  imageUrl?: string;
  itemName: string;
  price: number;
}

const getDDay = (dateString: string) => {
  const today = new Date();
  const purchaseDate = new Date(dateString);

  today.setHours(0, 0, 0, 0);
  purchaseDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - purchaseDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  return `${diffDays} Day+`;
};

export const ReviewList = ({
  items,
  scrollRef,
}: {
  items?: ReviewItem[];
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) => (
  <div className="mb-[100px]">
    {/* 타이틀 */}
    <div className="flex justify-between items-center mb-[14px] ">
      <div className="text-[12px]">소비 후기 작성하러 가볼까요?</div>
      <ArrowIcon className="w-[24px] h-[24px] px-[8px] py-[5px]" />
    </div>

    {/* 가로 스크롤 카드 리스트 */}
    <div ref={scrollRef} className="overflow-hidden -mx-[20px]">
      <motion.div
        className="flex gap-4 w-max px-[20px]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        drag="x"
        dragConstraints={scrollRef}>
        {items?.map((item) => (
          <div key={item.itemId} className="flex flex-col min-w-[94px] gap-[6px] cursor-pointer">
            <span className="text-gray-600 text-[12px] mb-[2px] leading-none font-medium">
              {getDDay(item.purchasedAt)}
            </span>

            <div className={`w-[94px] h-[94px] rounded-[5px] overflow-hidden`}>
              {item.imageUrl && <img src={item.imageUrl} alt={item.itemName} className="w-full h-full object-cover" />}
            </div>

            {/* 가격 및 이름 */}
            <div className="flex flex-col gap-[6px] px-[2px] ">
              <span className="text-[12px] leading-none font-medium">{item.price.toLocaleString()}원</span>
              <span className="text-[12px] leading-none truncate w-[94px]">{item.itemName}</span>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  </div>
);
