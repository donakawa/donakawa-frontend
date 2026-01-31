import FolderBg from '@/assets/folder.svg?react';

type Props = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
};

export default function WishGroup({ label, selected = false, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex flex-col items-center justify-start gap-1 shrink-0',
        'w-[60px]',
      ].join(' ')}
      aria-pressed={selected}
    >
      <div
        className={[
          'relative w-[60px] h-[60px] rounded-[14px] overflow-hidden',
          selected ? 'ring-2 ring-[color:var(--color-primary-600)]' : '',
        ].join(' ')}
      >
        <FolderBg className="absolute inset-0 w-full h-full" />
      </div>

      <div className="w-[60px] text-center text-[10px] leading-tight text-[color:var(--color-gray-800)] truncate">
        {label}
      </div>
    </button>
  );
}
