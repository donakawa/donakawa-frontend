import { useEffect } from "react";
import CloseIcon from '@/assets/close.svg?react'
import WishMenuButton from "../buttons/WishMenuButton";

type Props = {
  open: boolean;
  onClose: () => void;
  onAddViaLink: () => void;
  onAddDirectly: () => void;
};

export default function AddWishItemModal({
  open,
  onClose,
  onAddViaLink,
  onAddDirectly,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/35" onClick={onClose} />

      <div
        className={[
          "relative",
          "w-[335px] h-[234px] rounded-[20px]",
          "bg-white",
          "shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
          "flex flex-col",
        ].join(" ")}
      >
        
        <CloseIcon onClick={onClose} className="absolute right-4 top-4 p-2 text-gray-400 active:scale-95 transition-transform" />
        <h2 className="mt-[38px] text-center text-[20px] font-semibold text-gray-900">
          위시템 추가
        </h2>

        <div className="mt-4 w-full px-6 flex flex-col">
          <WishMenuButton label="링크로 등록" onClick={onAddViaLink} />
          <div className="w-full h-[1px] bg-gray-100" />
          <WishMenuButton label="직접 등록" onClick={onAddDirectly} />
        </div>
      </div>
    </div>
  );
}