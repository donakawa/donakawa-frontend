import CloseButton from '@/assets/close.svg?react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  productImage?: string;
  price?: string;
  productName?: string;
}

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  //임시값
  productImage = "/path-to-image.png", 
  price = "238,400", 
  productName = "캐시미어 로제 더블 하프코트" 
}: SuccessModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 font-sans text-[color:var(--color-black)]">
      <div className="w-[335px] h-[363px] bg-[color:var(--color-white)] rounded-[20px] relative shadow-xl overflow-hidden duration-200">
        
        <button onClick={onClose} aria-label="닫기" className="absolute right-[19px] top-[13px] cursor-pointer z-10">
          <CloseButton width={24} height={24} />
        </button>
        <div className="absolute left-1/2 -translate-x-1/2 top-[49px] w-[271px] h-[280px] flex flex-col items-center">
          
          <div className="flex flex-col items-center gap-[8px] mb-[20px] shrink-0">
            <h2 className="text-[20px] font-semibold text-[color:var(--color-black)] leading-[150%] text-center">기록이 완료되었습니다!</h2>
            <p className="text-[color:var(--color-gray-600)] text-[14px] leading-[150%] text-center">기록은 소비 피드백에 반영됩니다.</p>
          </div>
          {/* 해당 상품 정보는 나중에 wish랑 합치면 item 컴포넌트로 사용할 예정입니다 */}
          <div className="flex flex-col items-start gap-[4px] w-[94px] h-[141px] mb-[20px]">
            <div className="w-[94px] h-[94px] bg-[color:var(--color-gray-100)] rounded-[5px] overflow-hidden">
              <img src={productImage} alt={productName} className="w-full h-full object-cover" />
            </div>
            <span className="text-[12px] font-medium text-[color:var(--color-black)] leading-[150%]">{price}</span>
            <span className="text-[14px] text-[color:var(--color-black)] leading-[150%] truncate w-full">{productName}</span>
          </div>

          <button 
            className="w-[131px] h-[40px] rounded-[100px] bg-[color:var(--color-primary-brown-300)] text-[color:var(--color-white)] text-[14px] font-medium transition-opacity hover:opacity-90 cursor-pointer"
            onClick={onClose}
          >
            기록 보러 가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;