import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { instance } from '@/apis/axios';

import SelectableItem from './components/SelectableItem';
import CategoryFilter from './components/CategoryFilter';

import ArrowIcon from '@/assets/arrow.svg?react';

type LocationState = { from?: string };

import type { ChatItemType } from '@/apis/AIChatPage/aichat';
import type { PickedWishItem } from '../HomePage/hooks/useAIChat';

type WishItemStatus = 'WISHLISTED' | 'UNWISHLISTED' | string;

type WishItem = {
  id: string;
  name: string;
  price: number;
  photoUrl: string | null;
  type: 'MANUAL' | 'CRAWLED' | string;
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

const WISH_STATUS: WishItemStatus = 'WISHLISTED';

const CATEGORIES = [
  { id: 'all', label: 'ALL' },
  { id: 'outer', label: '아우터' },
  { id: 'top', label: '상의' },
  { id: 'winter', label: '겨울 메이트 코트' },
  { id: 'bottom', label: '하의' },
  { id: 'shoes', label: '신발' },
  { id: 'bag', label: '가방' },
];

export default function ItemSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as LocationState | null)?.from ?? '/home/ai-chat';

  const [items, setItems] = useState<WishItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    let mounted = true;

    const fetchWishlist = async () => {
      setLoading(true);
      setErrorMsg(null);

      try {
        const res = await instance.get<WishlistItemsResponse>('/wishlist/items', {
          params: {
            status: WISH_STATUS,
            take: 50,
            _ts: Date.now(),
          },
          headers: {
            Accept: 'application/json',
            'Cache-Control': 'no-cache',
            Pragma: 'no-cache',
          },
          withCredentials: true,
        });

        if (!mounted) return;

        if (res.data.resultType !== 'SUCCESS') {
          setItems([]);
          const msg = res.data.error?.reason ?? res.data.error?.message ?? '위시리스트를 불러오지 못했어요.';
          setErrorMsg(msg);
          return;
        }

        setItems(res.data.data.wishitems ?? []);
      } catch (err: unknown) {
        if (!mounted) return;

        const e = err as {
          response?: { data?: { message?: string; reason?: string; error?: { reason?: string; message?: string } } };
          message?: string;
        };

        const serverMsg =
          e?.response?.data?.message ||
          e?.response?.data?.error?.reason ||
          e?.response?.data?.error?.message ||
          e?.response?.data?.reason ||
          e?.message;

        setItems([]);
        setErrorMsg(serverMsg ? String(serverMsg) : '위시리스트를 불러오는 중 오류가 발생했어요.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void fetchWishlist();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return items;
    return items;
  }, [items, activeCategory]);

  const selectedItem = useMemo(() => {
    if (!selectedId) return null;
    return items.find((it) => it.id === selectedId) ?? null;
  }, [selectedId, items]);

  const handleItemClick = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const mapWishItemTypeToChatType = (wishType: string): ChatItemType => {
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

    navigate(from, {
      state: { pickedWishItem },
    });
  };

  return (
    <div className="flex h-[100dvh] flex-col">
      <CategoryFilter categories={CATEGORIES} activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

      <div
        className="flex-1 overflow-y-auto no-scrollbar rounded-t-[16px] shadow-[0_0_4px_rgba(0,0,0,0.25)]
                   bg-secondary-100 px-[20px] pb-[50px] pt-[20px]">
        {loading ? (
          <div className="flex h-full items-center justify-center text-gray-500">
            <p className="text-[16px]">불러오는 중...</p>
          </div>
        ) : errorMsg ? (
          <div className="mt-[100px] flex h-full flex-col items-center text-gray-500">
            <p className="text-center text-[16px] whitespace-pre-line">{errorMsg}</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-3 gap-[26px]">
            {filteredItems.map((item) => (
              <SelectableItem
                key={item.id}
                id={item.id}
                imageUrl={item.photoUrl ?? 'https://placehold.co/150'}
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
