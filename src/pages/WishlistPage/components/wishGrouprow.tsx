import GroupChip from './wishGroup';
import AllIcon from '@/assets/all_folder.svg?react';

export type WishlistGroup = {
  id: string;
  name: string;
};

type Props = {
  groups: WishlistGroup[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export default function WishGroupRow({ groups, selectedId, onSelect }: Props) {
  return (
    <div className="px-4 pt-3 pb-2">
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => onSelect('all')}
          className="shrink-0 flex flex-col items-center justify-start gap-1 w-[60px]"
          aria-pressed={selectedId === 'all'}
        >
          <div className="p-[2px] overflow-visible">
            <div
              className={[
                'relative w-[60px] h-[60px] rounded-[14px] overflow-hidden',
                selectedId === 'all' ? 'ring-2 ring-[color:var(--color-primary-600)]' : '',
              ].join(' ')}
            >
              <AllIcon className="absolute inset-0 w-full h-full" />
            </div>
          </div>

          <div className="w-[60px] text-center text-[10px] leading-tight text-[color:var(--color-gray-800)] truncate">
            ALL
          </div>
        </button>

        <div className="shrink-0 w-px h-[60px] bg-[color:var(--color-gray-200)] mx-3" />

        <div className="min-w-0 flex-1 overflow-x-auto overflow-y-visible no-scrollbar">
          <div className="flex items-start gap-3 py-[6px] px-[2px] overflow-visible">
            {groups.map((g) => (
              <GroupChip
                key={g.id}
                label={g.name}
                selected={selectedId === g.id}
                onClick={() => onSelect(g.id)}
              />
            ))}
            <div className="shrink-0 w-[2px] h-1" aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  );
}