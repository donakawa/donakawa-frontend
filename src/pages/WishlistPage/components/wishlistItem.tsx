import DefaultPhoto from '@/assets/default_item_photo.svg';

type Props = {
  imageUrl: string;
  price: number;
  title: string;

  editMode?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;

  onClick?: () => void;
};

export default function WishlistItem({
  imageUrl,
  price,
  title,
  editMode = false,
  selected = false,
  onToggleSelect,
  onClick,
}: Props) {
  const handleClick = () => {
    if (editMode) {
      onToggleSelect?.();
      return;
    }
    onClick?.();
  };

  return (
    <button type="button" onClick={handleClick} className="text-left w-full">
      <div
        className={[
          'relative',
          'w-[94px] h-[94px]',
          'overflow-hidden',
          'rounded-[5px]',
          'bg-[color:var(--color-gray-100)]',
          'shadow-[0_0_4px_rgba(0,0,0,0.25)]',
        ].join(' ')}
      >
        <img
          src={imageUrl || DefaultPhoto}
          alt={title}
          className="w-full h-full object-cover"
        />

        {editMode && (
          <div
            className={[
              'absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center',
              selected
                ? [
                    'bg-[color:var(--color-primary-600)]',
                    'ring-1 ring-white',
                    'ring-offset-1 ring-offset-transparent',
                  ].join(' ')
                : 'bg-white/90 border border-[color:var(--color-gray-300)]',
            ].join(' ')}
            aria-hidden="true"
          >
            {selected && (
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
                <path
                  d="M20 6L9 17l-5-5"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      <div className="pt-2">
        <div className="text-[12px] font-semibold text-[color:var(--color-black)] leading-none">
          {price.toLocaleString()}
        </div>
        <div className="mt-1 text-[14px] text-[color:var(--color-black)] truncate">
          {title}
        </div>
      </div>
    </button>
  );
}
