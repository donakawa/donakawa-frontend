type Props = {
  label: string;
  onClick: () => void;
  variant?: 'outline' | 'filled';
  disabled?: boolean;
  className?: string;
};

export default function PillActionButton({
  label,
  onClick,
  variant = 'filled',
}: Props) {
    const base = [
    'w-[110px] h-[40px] rounded-[100px]',
    'flex items-center justify-center',
    'p-0',
    'text-[16px] leading-none',
    'border-[1.5px] border-[color:var(--color-primary-brown-300)]',
    'active:scale-[0.99]'
  ].join(' ');

  //outline, filled 따라 다른 버튼 제공
  const outline =
    'bg-[color:var(--color-white)] text-[color:var(--color-primary-brown-300)] ';

  const filled =
    'bg-[color:var(--color-primary-brown-300)] text-[color:var(--color-white)]';

  return (
    <button
      onClick={onClick}
      className={[base, variant === 'outline' ? outline : filled].join(' ')}
    >
      {label}
    </button>
  );
}
