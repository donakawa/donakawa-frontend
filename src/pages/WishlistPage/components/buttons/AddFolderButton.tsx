import AddFolderIcon from '@/assets/add_folder.svg?react';

type Props = {
  onClick?: () => void;
  size?: number;
  ariaLabel?: string;
};

export default function AddFolderButton({ onClick, size = 26, ariaLabel = '폴더 추가' }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex items-center justify-center active:scale-95 transition-transform"
      style={{ width: size, height: size }}
    >
      <AddFolderIcon className="w-full h-full" />
    </button>
  );
}
