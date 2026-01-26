import AddFolderIcon from '@/assets/add_folder.svg?react';

type Props = {
  onClick?: () => void;
  size?: number;
};

export default function AddFolderButton({ onClick, size = 26 }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center active:scale-95 transition-transform"
      style={{ width: size, height: size }}
    >
      <AddFolderIcon className="w-full h-full" />
    </button>
  );
}
