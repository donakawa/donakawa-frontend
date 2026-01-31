import PillActionButton from "../buttons/PillActionButton";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDeleteModal({
  open,
  title,
  description,
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/35" />

      <div
        className={[
          'relative',
          'w-[335px] h-[234px] rounded-[20px]',
          'max-w-[calc(100vw-40px)]',
          'bg-[color:var(--color-white)]',
          'px-6',
          'shadow-[0_10px_30px_rgba(0,0,0,0.18)]',
          'flex flex-col items-center justify-center',
        ].join(' ')}
      >
        <h2 className="text-center text-[20px] font-semibold text-[color:var(--color-black)]">
          {title}
        </h2>

        {description ? (
          <p className="mt-3 text-center text-[14px] leading-[20px] text-[color:var(--color-gray-500)]">
            {description}
          </p>
        ) : null}

        <div className="mt-8 flex items-center justify-center gap-6">
          <PillActionButton label="취소" variant="outline" onClick={onCancel} />
          <PillActionButton label="삭제" variant="filled" onClick={onConfirm} />
        </div>
      </div>
    </div>
  );
}
