import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import type { AxiosResponse } from 'axios';

import { instance } from '@/apis/axios';

import SelectableItem from './components/SelectableItem';
import CategoryFilter from './components/CategoryFilter';

import ArrowIcon from '@/assets/arrow.svg?react';
import DefaultImg from '@/assets/default_item_photo.svg?url';

import type { HeaderControlContext } from '@/layouts/ProtectedLayout';
import type { ChatItemType } from '@/apis/AIChatPage/aichat';
import type { PickedWishItem } from '../HomePage/hooks/useAIChat';

type LocationState = { from?: string };

type WishItemStatus = 'WISHLISTED' | 'UNWISHLISTED' | string;
type WishItemType = 'AUTO' | 'MANUAL' | string;

type WishItem = {
  id: string;
  name: string;
  price: number;
  photoUrl: string | null;
  type: WishItemType;
  status: WishItemStatus;
};

type WishlistItemsSuccess = {
  resultType: 'SUCCESS';
  error: null;
  data: {
    nextCursor: string | null;
    wishitems: WishItem[];
  };
};

type WishlistItemsFail = {
  resultType: 'FAIL' | 'FAILED';
  error: { errorCode: string; reason?: string; message?: string; data: unknown | null };
  data: null;
};

type WishlistItemsResponse = WishlistItemsSuccess | WishlistItemsFail;

type WishlistFolder = {
  id: string;
  name: string;
};

type WishlistFoldersSuccess = {
  resultType: 'SUCCESS';
  error: null;
  data: {
    folders: WishlistFolder[];
    nextCursor: string | null;
  };
};

type WishlistFoldersFail = {
  resultType: 'FAIL' | 'FAILED';
  error: { errorCode: string; reason?: string; message?: string; data?: unknown };
  data: null;
};

type WishlistFoldersResponse = WishlistFoldersSuccess | WishlistFoldersFail;

type Category = { id: 'all'; label: 'ALL' } | { id: string; label: string };

type LoadState = 'idle' | 'loading' | 'success' | 'error';

const WISH_STATUS: WishItemStatus = 'WISHLISTED';

const TAKE = 10;
const MAX_PAGES = 50;

export default function ItemSelectionPage(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTitle } = useOutletContext<HeaderControlContext>();

  const from = (location.state as LocationState | null)?.from ?? '/home/ai-chat';

  const [categories, setCategories] = useState<Category[]>([{ id: 'all', label: 'ALL' }]);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const [items, setItems] = useState<WishItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setTitle('고민템을 선택해주세요!');
  }, [setTitle]);

  useEffect(() => {
    let mounted = true;

    const fetchAllFolders = async (): Promise<void> => {
      try {
        const all: WishlistFolder[] = [];
        let cursor: string | null = null;

        for (let i = 0; i < MAX_PAGES; i += 1) {
          const res: AxiosResponse<WishlistFoldersResponse> = await instance.get('/wishlist/folders', {
            params: { take: TAKE, cursor: cursor ?? undefined, _ts: Date.now() },
            headers: { Accept: 'application/json' },
            withCredentials: true,
          });

          if (!mounted) return;

          if (res.data.resultType !== 'SUCCESS') break;

          all.push(...(res.data.data.folders ?? []));

          const next = res.data.data.nextCursor;
          if (!next) break;
          cursor = next;
        }

        if (!mounted) return;

        const nextCategories: Category[] = [
          { id: 'all', label: 'ALL' },
          ...all.map((f) => ({ id: f.id, label: f.name })),
        ];

        setCategories(nextCategories);

        if (activeCategory !== 'all' && !all.some((f) => f.id === activeCategory)) {
          setActiveCategory('all');
        }
      } catch {
        if (!mounted) return;
        setCategories([{ id: 'all', label: 'ALL' }]);
      }
    };

    void fetchAllFolders();

    return () => {
      mounted = false;
    };
  }, [activeCategory]);

  useEffect(() => {
    let mounted = true;

    const fetchAllItemsByCursor = async (): Promise<WishItem[]> => {
      const isAll = activeCategory === 'all';
      const url = isAll ? '/wishlist/items' : `/wishlist/folders/${activeCategory}/items`;

      const all: WishItem[] = [];
      let cursor: string | null = null;

      for (let i = 0; i < MAX_PAGES; i += 1) {
        const res: AxiosResponse<WishlistItemsResponse> = await instance.get(url, {
          params: isAll
            ? { status: WISH_STATUS, take: TAKE, cursor: cursor ?? undefined, _ts: Date.now() }
            : { take: TAKE, cursor: cursor ?? undefined, _ts: Date.now() },
          headers: { Accept: 'application/json' },
          withCredentials: true,
        });

        if (res.data.resultType !== 'SUCCESS') {
          const msg =
            res.data.error?.reason ??
            res.data.error?.message ??
            (isAll ? '위시리스트를 불러오지 못했어요.' : '폴더 아이템을 불러오지 못했어요.');
          throw new Error(msg);
        }

        all.push(...(res.data.data.wishitems ?? []));

        const next = res.data.data.nextCursor;
        if (!next) break;
        cursor = next;
      }

      return all;
    };

    const run = async (): Promise<void> => {
      setLoadState('loading');
      setErrorMsg(null);
      setSelectedId(null);

      try {
        const list = await fetchAllItemsByCursor();
        if (!mounted) return;

        setItems(list);
        setLoadState('success');
      } catch (err: unknown) {
        if (!mounted) return;

        const msg = err instanceof Error ? err.message : '목록을 불러오는 중 오류가 발생했어요.';
        setItems([]);
        setErrorMsg(msg);
        setLoadState('error');
      }
    };

    void run();

    return () => {
      mounted = false;
    };
  }, [activeCategory]);

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return items.find((it) => it.id === selectedId) ?? null;
  }, [selectedId, items]);

  const handleItemClick = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const mapWishItemTypeToChatType = (wishType: WishItemType): ChatItemType => {
    if (wishType === 'MANUAL') return 'MANUAL';
    return 'AUTO';
  };

  const handleSubmit = () => {
    if (!selectedItem) return;

    const wishItemId = Number(selectedItem.id);
    if (Number.isNaN(wishItemId)) return;

    const pickedWishItem: PickedWishItem = {
      wishItemId,
      name: selectedItem.name,
      price: selectedItem.price,
      imageUrl: selectedItem.photoUrl ?? 'https://placehold.co/150',
      type: mapWishItemTypeToChatType(selectedItem.type),
    };

    navigate(from, { state: { pickedWishItem } });
  };

  return (
    <div className="flex h-[100dvh] flex-col">
      <CategoryFilter categories={categories} activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

      <div
        className="flex-1 overflow-y-auto no-scrollbar rounded-t-[16px] shadow-[0_0_4px_rgba(0,0,0,0.25)]
                   bg-secondary-100 px-[20px] pb-[50px] pt-[20px]">
        {loadState === 'loading' ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            <p className="text-[16px]">불러오는 중...</p>
          </div>
        ) : loadState === 'error' && errorMsg ? (
          <div className="mt-[100px] flex h-full flex-col items-center text-gray-500">
            <p className="text-center text-[16px] whitespace-pre-line">{errorMsg}</p>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-3 gap-[26px]">
            {items.map((item) => (
              <SelectableItem
                key={item.id}
                id={item.id}
                imageUrl={item.photoUrl ?? DefaultImg}
                title={item.name}
                price={item.price}
                isSelected={selectedId === item.id}
                onClick={() => handleItemClick(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-[100px] flex h-full flex-col items-center text-gray-500">
            <p className="text-[16px]">아이템이 없어요.</p>
          </div>
        )}
      </div>

      {selectedId && (
        <div className="fixed bottom-0 mx-[20px] pb-[34px]">
          <button
            onClick={handleSubmit}
            className="flex h-[60px] w-[335px] items-center justify-between rounded-full border-[1px] border-gray-300 bg-white
                       px-[24px] shadow-[0_0_4px_rgba(0,0,0,0.25)] transition-transform active:scale-[0.98]">
            <span className="text-[16px] font-medium">이 상품을 첨부할래요!</span>
            <ArrowIcon className="h-[13px] w-[8px] text-black" />
          </button>
        </div>
      )}
    </div>
  );
}
