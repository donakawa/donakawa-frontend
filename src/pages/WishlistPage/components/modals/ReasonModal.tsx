import CloseIcon from '@/assets/close.svg?react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ReasonModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center px-5"
      onClick={onClose}
    >
      <div
        className="relative w-[335px] h-[234px] bg-white rounded-[20px] flex flex-col items-center shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute right-[18px] top-[16px] w-[24px] h-[24px] flex items-center justify-center"
        >
          <CloseIcon className="w-[16px] h-[16px] text-[color:var(--color-gray-600)]" />
        </button>

        <div className="mt-[64px] flex flex-col items-center gap-[40px]">
          <div className="flex flex-col items-center gap-[8px]">
            <h3 className="w-[272px] text-[20px] font-semibold leading-[150%] text-black text-center">
              이 물건을 담은 이유는 무엇인가요?<br />
              <span className="text-[color:var(--color-primary-500)]">
                위시로 담은 이유
              </span>
              를 추가해주세요!
            </h3>
            
            <p className="w-[270px] text-[14px] font-normal leading-[150%] text-[color:var(--color-gray-600)] text-center">
              나에게 꼭 필요한 소비인지 판단하는 데<br />
              도움이 됩니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
