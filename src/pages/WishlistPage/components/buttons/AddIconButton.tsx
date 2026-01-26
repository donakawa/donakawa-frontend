import AddSquare from '@/assets/add_item.svg?react';

type Props = {
  onClick?: () => void;
};

export default function AddIconButton({ onClick}: Props) {
  return (
    <button type="button"
      onClick={onClick}
      className="flex items-center justify-center active:scale-95 transition-transform">
      <AddSquare />
    </button>
  );
}
