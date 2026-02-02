import type { ComponentType, SVGProps } from 'react';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type Props = {
  Icon: IconType;
  ariaLabel: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
};
export default function PillIconButton({
  Icon,
  ariaLabel,
  onClick,
  disabled = false,
  className,
}: Props) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      className={[
        disabled ? 'opacity-50 pointer-events-none' : '',
        className ?? '',
      ].join(' ')}
    >
      <Icon />
    </button>
  );
}
