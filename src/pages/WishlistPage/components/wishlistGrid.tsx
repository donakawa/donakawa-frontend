import WishlistItem from './wishlistItem';

export type WishlistItemType = {
  id: string;
  imageUrl: string;
  price: number;
  title: string;
};

type Props = {
  items: WishlistItemType[];

  editMode?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;

  onItemClick?: (id: string) => void;
};

export default function WishlistGrid({
  items,
  editMode = false,
  selectedIds = new Set(),
  onToggleSelect,
  onItemClick,
}: Props) {
  return (
    <div
      className={[
        'w-[335px] h-[534px]',
        'grid grid-cols-3',
        'gap-x-[26px] gap-y-[26px]',
      ].join(' ')}
    >
      {items.map((it) => (
        <WishlistItem
          key={it.id}
          imageUrl={it.imageUrl}
          price={it.price}
          title={it.title}
          editMode={editMode}
          selected={selectedIds.has(it.id)}
          onToggleSelect={() => onToggleSelect?.(it.id)}
          onClick={() => onItemClick?.(it.id)}
        />
      ))}
    </div>
  );
}
