import { useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  durationMs?: number;
}

export default function ToastModal({
  open,
  onClose,
  durationMs = 2000,
}: Props) {
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      onClose();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [open, durationMs, onClose]);

  if (!open) return null;

  return (
    <div
        className="fixed inset-0 z-[120] bg-black/50 flex items-center justify-center px-5"
        onClick={onClose}
    >
        <div
            className="w-[335px] h-[150px] bg-white rounded-[24px] shadow-xl px-[24px] py-[28px] text-center flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            >
            <p className="mb-[8px]">
                <span className="text-[18px] text-[color:var(--color-primary-500)] font-medium">
                브라우저 주소창의 URL
                </span>
                <span className="text-[17px] leading-[150%] text-black font-semibold">
                을 입력해 주세요.
                </span>
            </p>

            <span className="text-[14px] leading-[150%] text-[color:var(--color-gray-600)]">
                공유 링크(.onelink)는 사용할 수 없습니다.
            </span>
            </div>

    </div>
    );
}
