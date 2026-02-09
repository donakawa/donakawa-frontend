import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SelectableItem from './components/SelectableItem';
import CategoryFilter from './components/CategoryFilter';

import ArrowIcon from '@/assets/arrow.svg?react';

// 더미 데이터
const MOCK_ITEMS = Array.from({ length: 12 }).map((_, i) => ({
  id: String(i),
  title: '캐시미어 로제 니트',
  price: 238400,
  imageUrl: 'https://placehold.co/150',
  category: i % 2 === 0 ? 'outer' : 'top',
}));

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

  // 상태 관리
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // 필터링 로직
  const filteredItems =
    activeCategory === 'all' ? MOCK_ITEMS : MOCK_ITEMS.filter((item) => item.category === activeCategory);

  const handleItemClick = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleSubmit = () => {
    if (!selectedId) return;
    console.log('선택된 상품 ID:', selectedId);
    navigate('/chat');
  };

  return (
    <div className="flex flex-col h-[100dvh]">
      {/* 상단 카테고리 필터 */}
      <CategoryFilter categories={CATEGORIES} activeCategory={activeCategory} onSelectCategory={setActiveCategory} />

      {/* 상품 그리드 */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar rounded-t-[16px] shadow-[0_0_4px_rgba(0,0,0,0.25)] 
                    pt-[20px] px-[20px] pb-[50px] bg-secondary-100">
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-3 gap-[26px]">
            {filteredItems.map((item) => (
              <SelectableItem
                key={item.id}
                id={item.id}
                imageUrl={item.imageUrl}
                title={item.title}
                price={item.price}
                isSelected={selectedId === item.id}
                onClick={() => handleItemClick(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center mt-[100px] text-gray-500">
            <p className="text-[16px]">아이템이 없어요.</p>
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      {selectedId && (
        <div className="fixed bottom-0 mx-[20px] pb-[34px]">
          <button
            onClick={handleSubmit}
            className="w-[335px] h-[60px] flex items-center justify-between px-[24px] bg-white border-[1px] border-gray-300
                       rounded-full shadow-[0_0_4px_rgba(0,0,0,0.25)] active:scale-[0.98] transition-transform">
            <span className="font-medium text-[16px]">이 상품을 첨부할래요!</span>
            <ArrowIcon className="w-[8px] h-[13px] text-black" />
          </button>
        </div>
      )}
    </div>
  );
}
