import { useMemo } from 'react';

import WishlistGrid from './components/wishlistGrid';
import type { WishlistItemType } from './components/wishlistGrid';
import WishlistPanel from './components/wishlistPanel';

export default function WishlistPage() {
  const items: WishlistItemType[] = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: `item-${i + 1}`,
        imageUrl: 'https://placehold.co/300x300/png',
        price: 238_400,
        title: '캐시미어 로제...',
      })),
    [],
  );

  return (
    <div className="AppContainer relative flex flex-col h-screen overflow-hidden">
      <WishlistPanel editMode={false} bottomPaddingPx={0}>
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <WishlistGrid items={items} />
        </div>
      </WishlistPanel>
    </div>
  );
}
