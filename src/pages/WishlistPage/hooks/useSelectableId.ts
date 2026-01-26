// src/pages/WishlistPage/hooks/useSelectableId.ts
import { useCallback, useState } from 'react';

export default function useSelectableId(initialId: string) {
  const [selectedId, setSelectedId] = useState<string>(initialId);

  const select = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return { selectedId, setSelectedId, select };
}
