import AddSquare from '@/assets/add_item.svg?react';

type Props = {
  onClick?: () => void;
  ariaLabel: string;
};

export default function AddIconButton({ onClick, ariaLabel }: Props) {
  return (
    <button type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex items-center justify-center active:scale-95 transition-transform">
      <AddSquare />
    </button>
  );
}
