import { useMemo, useState } from 'react';

import WishGroupRow from './components/wishGrouprow';
import WishlistGrid from './components/wishlistGrid';
import type { WishlistItemType } from './components/wishlistGrid';
import WishlistPanel from './components/wishlistPanel';

import AddFolderButton from './components/buttons/AddFolderButton';
import AddIconButton from './components/buttons/AddIconButton';
import PillIconButton from './components/buttons/PillButton';

import ConfirmDeleteModal from './components/modals/ConfirmDeleteModal';
import AddWishItemModal from './components/modals/AddWishItemModal';
import MoveFolderSheet from './components/MoveFolderSheet';
import Toast from './components/Toast';

import WishRegistrationPage from './WishRegistrationPage';
import LinkRegistrationPage from './LinkRegistrationPage';
import AddFolderPage from './AddFolderPage';

import useToggle from './hooks/useToggle';
import useSelectableId from './hooks/useSelectableId';

import WishListLogo from '@/assets/wishlist_logo.svg?react';
import EditPill from '@/assets/edit.svg?react';
import DeletePill from '@/assets/delete.svg?react';
import MovePill from '@/assets/move.svg?react';
import ClosePill from '@/assets/close.svg?react';
import type { WishItemData } from './types/WishItemData';
import FolderEditPage from './FolderEditPage';

const HEADER_HEIGHT = 56;

export default function WishlistPage() {
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLinkRegistration, setShowLinkRegistration] = useState(false);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [initialData, setInitialData] = useState<WishItemData | null>(null); // 링크에서 가져온 데이터 저장
  
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [moveSheetOpen, setMoveSheetOpen] = useState(false);
  const [showFolderEdit, setShowFolderEdit] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const editMode = useToggle(false);
  const { selectedId, select } = useSelectableId('all');

  const groups = useMemo(() => [
    { id: 'g1', name: '겨울 아우터' },
    { id: 'g2', name: '겨울 아우터' },
    { id: 'g3', name: '겨울 아우터' },
    { id: 'g4', name: '겨울 아우터' },
    { id: 'g5', name: '겨울 아우터' },
  ], []);

  const items: WishlistItemType[] = useMemo(() => 
    Array.from({ length: 12 }).map((_, i) => ({
      id: `item-${i + 1}`,
      imageUrl: 'https://placehold.co/300x300/png',
      price: 238_400,
      title: '캐시미어 로제...',
    })), []);

  const moveFolders = useMemo(() => groups.map((g) => ({ id: g.id, name: g.name })), [groups]);
  const hasSelection = selectedItemIds.size > 0;

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
    window.setTimeout(() => setToastOpen(false), 2000);
  };

  const handleLinkComplete = (data: WishItemData) => {
    setInitialData(data);
    setShowLinkRegistration(false);
    setShowRegistration(true);
  };

  const handleRegistrationComplete = () => {
    setShowRegistration(false);
    setInitialData(null);
    showToast('위시템이 추가되었습니다!');
  };

  const confirmDeleteSelected = () => {
    setDeleteModalOpen(false);
    setSelectedItemIds(new Set());
    editMode.off();
    showToast('위시템이 삭제되었습니다.');
  };

  const handleAddFolderComplete = (folderName: string) => {
    setShowAddFolder(false);
    editMode.off();
    showToast(`'${folderName}' 폴더가 추가되었습니다!`);
  };
  
  const handleFolderDeleteComplete = (folderName: string) => {
    setShowFolderEdit(false);
    showToast(`'${folderName}' 폴더가 삭제되었습니다.`);
  };

  const enterEditMode = () => { editMode.on(); setSelectedItemIds(new Set()); };
  const exitEditMode = () => { editMode.off(); setSelectedItemIds(new Set()); };
  
  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  if (showLinkRegistration) {
    return <LinkRegistrationPage onBack={() => setShowLinkRegistration(false)} onComplete={handleLinkComplete} />;
  }

  if (showRegistration) {
    return (
      <WishRegistrationPage 
        onBack={() => { setShowRegistration(false); setInitialData(null); }} 
        onComplete={handleRegistrationComplete}
        initialData={initialData||undefined}
      />
    );
  }

  if (showAddFolder) {
    return (
      <AddFolderPage 
        onBack={() => setShowAddFolder(false)} 
        onComplete={handleAddFolderComplete} 
      />
    );
  }

  if (showFolderEdit) {
    return (
      <FolderEditPage 
        folders={moveFolders}
        onBack={() => setShowFolderEdit(false)}
        onAddFolder={() => {
          setShowFolderEdit(false);
          setShowAddFolder(true);
        }}
        onDeleteComplete={handleFolderDeleteComplete}
      />
    );
  }

  return (
    <div className="AppContainer relative flex flex-col h-screen overflow-hidden">
      <div className="shrink-0 bg-white" style={{ height: HEADER_HEIGHT }}>
        <header className="px-5 flex items-center justify-between h-full">
          <WishListLogo className="w-[112px] h-[22px]" />
          <AddFolderButton onClick={() => setShowFolderEdit(true)} />
        </header>
      </div>

      {!editMode.value && (
        <div className="shrink-0">
          <WishGroupRow groups={groups} selectedId={selectedId} onSelect={select} />
        </div>
      )}

      <WishlistPanel editMode={editMode.value} bottomPaddingPx={0}>
        {editMode.value ? (
          <>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <PillIconButton Icon={DeletePill} ariaLabel="상품삭제" onClick={() => setDeleteModalOpen(true)} disabled={!hasSelection} />
                <PillIconButton Icon={MovePill} ariaLabel="폴더로 이동" onClick={() => setMoveSheetOpen(true)} disabled={!hasSelection} />
              </div>
              <PillIconButton Icon={ClosePill} ariaLabel="닫기" onClick={exitEditMode} />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              <WishlistGrid items={items} editMode selectedIds={selectedItemIds} onToggleSelect={toggleSelectItem} />
              <div className="h-[96px]" />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <PillIconButton Icon={EditPill} ariaLabel="수정하기" onClick={enterEditMode} />
              <AddIconButton onClick={() => setAddModalOpen(true)} />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              <WishlistGrid items={items} />
              <div className="h-[96px]" />
            </div>
          </>
        )}
      </WishlistPanel>

      <ConfirmDeleteModal open={deleteModalOpen} title="위시템을 삭제하시겠어요?" description="삭제 시 되돌릴 수 없습니다." onCancel={() => setDeleteModalOpen(false)} onConfirm={confirmDeleteSelected} />
      <MoveFolderSheet open={moveSheetOpen} folders={moveFolders} onClose={() => setMoveSheetOpen(false)} onAddFolderClick={() => { setMoveSheetOpen(false);setShowAddFolder(true);}} onSelectFolder={() => { setMoveSheetOpen(false); exitEditMode(); showToast('폴더로 이동했습니다.'); }} />
      <AddWishItemModal open={addModalOpen} onClose={() => setAddModalOpen(false)} onAddViaLink={() => { setAddModalOpen(false); setShowLinkRegistration(true); }} onAddDirectly={() => { setAddModalOpen(false); setShowRegistration(true); }} />
      {toastOpen && <Toast message={toastMessage} />}
    </div>
  );
}