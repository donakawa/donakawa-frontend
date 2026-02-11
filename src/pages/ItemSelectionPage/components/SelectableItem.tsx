import Check from '@/assets/check.svg?react';

type Props = {
  id: string;
  imageUrl: string;
  title: string;
  price: number;
  isSelected: boolean;
  onClick: () => void;
};

export default function SelectableItem({ imageUrl, title, price, isSelected, onClick }: Props) {
  return (
    <div className="flex flex-col gap-[4px] cursor-pointer" onClick={onClick}>
      {/* 이미지 영역 */}
      <div className="relative rounded-[5px] overflow-hidden">
        <img src={imageUrl} alt={title} className="w-full h-full object-cover" />

        {/* 선택 체크박스 */}
        <div className="absolute top-[4px] right-[4px]">
          {isSelected ? (
            <div className="w-[24px] h-[24px] rounded-full bg-primary-600 flex items-center justify-center border-[2px] border-white">
              <Check className="w-[14px] h-[14px] text-white" />
            </div>
          ) : (
            <div className="w-[24px] h-[24px] rounded-full border-[2px] border-white bg-gray-600/30" />
          )}
        </div>
      </div>

      {/* 상품 정보 */}
      <div>
        <div className="font-medium text-[12px]">{price.toLocaleString()}</div>
        <div className="text-[14px] truncate">{title}</div>
      </div>
    </div>
  );
}
