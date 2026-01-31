import AddFolder2Icon from '@/assets/add_folder2.svg?react';
import FolderIcon from '@/assets/folder.svg?react';
import DeleteFolderIcon from '@/assets/delete_folder.svg?react';
import type { FolderItem } from './MoveFolderSheet';

interface Props {
  folders: FolderItem[];
  showAddButton?: boolean; // '폴더 추가' 항목 표시 여부
  isDeleteMode?: boolean;  // 삭제 모드 활성화 여부
  onAddClick?: () => void;
  onFolderClick?: (id: string) => void;
  onDeleteClick?: (folder: FolderItem) => void;
}

export default function FolderList({
  folders,
  showAddButton = false,
  isDeleteMode = false,
  onAddClick,
  onFolderClick,
  onDeleteClick,
}: Props) {
  return (
    <ul className="px-1">
      {/* 1. 폴더 추가 항목 (삭제 모드가 아닐 때만) */}
      {showAddButton && !isDeleteMode && (
        <li className="border-b border-gray-100 last:border-0">
          <button
            type="button"
            onClick={onAddClick}
            className="w-full flex items-center gap-4 py-4 text-left active:scale-[0.99] text-gray-900"
          >
            <div className="w-[60px] h-[60px] rounded-[10px] flex items-center justify-center shrink-0">
              <AddFolder2Icon className="w-full h-full" />
            </div>
            <span className="text-[14px] font-medium truncate">폴더 추가</span>
          </button>
        </li>
      )}

      {/* 2. 폴더 리스트 항목들 */}
      {folders.map((f) => (
        <li key={f.id} className="border-b border-gray-100 last:border-0">
          <div className="w-full flex items-center gap-4 py-4">
            {/* 삭제 모드일 때 */}
            {isDeleteMode && onDeleteClick && (
              <button 
                onClick={() => onDeleteClick(f)}
                className="shrink-0 active:scale-90 transition-transform"
              >
                <DeleteFolderIcon className="w-6 h-6" /> 
              </button>
            )}
            
            <button
              type="button"
              onClick={() => !isDeleteMode && onFolderClick?.(f.id)}
              className={`flex-1 flex items-center gap-4 text-left overflow-hidden ${
                isDeleteMode ? 'cursor-default' : 'active:scale-[0.99]'
              }`}
            >
              <div className="w-[60px] h-[60px] rounded-[10px] overflow-hidden shrink-0 bg-gray-100">
                <FolderIcon className="w-full h-full object-cover" />
              </div>
              <span className="text-[14px] font-medium text-gray-900 truncate">{f.name}</span>
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}