import { useState } from 'react';
import BackIcon from '@/assets/back.svg?react';
import ConfirmDeleteModal from './components/modals/ConfirmDeleteModal';
import FolderList from './components/FolderList';
import type { FolderItem } from './components/MoveFolderSheet';

interface Props {
  folders: FolderItem[];
  onBack: () => void;
  onAddFolder: () => void;
  onDeleteComplete: (folderName: string) => void;
}

export default function FolderEditPage({ folders, onBack, onAddFolder, onDeleteComplete }: Props) {
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetFolder, setTargetFolder] = useState<FolderItem | null>(null);

  const handleDeleteClick = (folder: FolderItem) => {
    setTargetFolder(folder);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (targetFolder) {
      setDeleteModalOpen(false);
      onDeleteComplete(targetFolder.name);
    }
  };

  return (
    <div className="absolute inset-0 z-[100] bg-white flex flex-col">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-5 h-[56px] shrink-0">
        <button onClick={onBack} className="p-2 -ml-2">
          <BackIcon className="w-6 h-6 text-black" />
        </button>
        <h1 className="text-[18px] font-bold text-black">폴더 편집</h1>
        <button 
          onClick={() => setIsDeleteMode(!isDeleteMode)}
          className="text-[14px] font-medium text-gray-500"
        >
          {isDeleteMode ? '취소' : '선택삭제'}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-4">
        <FolderList 
          folders={folders}
          showAddButton={true}
          isDeleteMode={isDeleteMode}
          onAddClick={onAddFolder}
          onDeleteClick={handleDeleteClick}
        />
      </main>

      <ConfirmDeleteModal 
        open={deleteModalOpen} 
        title="폴더를 삭제하시겠어요?" 
        description="폴더를 삭제하더라도 위시템은 유지됩니다." 
        onCancel={() => setDeleteModalOpen(false)} 
        onConfirm={handleConfirmDelete} 
      />
    </div>
  );
}