import AllIcon from '@/assets/all_folder.svg?react';
import Folder from '@/assets/folder.svg?react';

interface Category {
  id: string;
  label: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
}

export default function CategoryFilter({ categories, activeCategory, onSelectCategory }: CategoryFilterProps) {
  const allCategory = categories.find((cat) => cat.id === 'all');
  const otherCategories = categories.filter((cat) => cat.id !== 'all');

  return (
    <div className="pl-[20px] py-[24px]">
      <div className="flex items-start">
        {allCategory && (
          <div className="flex items-center flex-shrink-0 ">
            <button
              onClick={() => onSelectCategory(allCategory.id)}
              className="flex items-center justify-center hover:opacity-90 transition-opacity">
              <div className="relative w-[60px] h-[60px]">
                <AllIcon className="w-full h-full" />
                {activeCategory === 'all' && (
                  <div className="absolute inset-0 border-[2px] border-primary-500 rounded-[10px] pointer-events-none" />
                )}
              </div>
            </button>

            <div className="h-[60px] w-[1px] bg-gray-100 flex-shrink-0 mx-[14px]" />
          </div>
        )}

        <div className="flex items-start gap-[10px] overflow-x-auto no-scrollbar flex-1 w-full">
          {otherCategories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className="flex flex-col items-center flex-shrink-0 last:mr-[20px]">
                <div className="relative w-[60px] h-[60px]">
                  <Folder className="w-full h-full" />
                  {isSelected && (
                    <div className="absolute inset-0 border-[2px] border-primary-500 rounded-[10px] pointer-events-none" />
                  )}
                </div>
                <span
                  className={`block text-[12px] text-center mt-[4px] w-[54px] truncate 
                  ${isSelected ? 'font-semibold' : ''}`}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
