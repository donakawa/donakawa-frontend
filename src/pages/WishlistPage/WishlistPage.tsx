import { useMemo, useState } from 'react';

import WishGroupRow from './components/wishGrouprow';
import WishlistGrid from './components/wishlistGrid';
import type { WishlistItemType } from './components/wishlistGrid';
import WishlistPanel from './components/wishlistPanel';

import AddFolderButton from './components/buttons/AddFolderButton';
import PillIconButton from './components/buttons/PillButton';

import ConfirmDeleteModal from './components/modals/ConfirmDeleteModal';
import MoveFolderSheet from './components/MoveFolderSheet';
import Toast from './components/Toast';


import useToggle from './hooks/useToggle';
import useSelectableId from './hooks/useSelectableId';

import WishListLogo from '@/assets/wishlist_logo.svg?react';
import EditPill from '@/assets/edit.svg?react';
import DeletePill from '@/assets/delete.svg?react';
import MovePill from '@/assets/move.svg?react';
import ClosePill from '@/assets/close.svg?react';

const HEADER_HEIGHT = 56;

export default function WishlistPage() {
  //const [showRegistration, setShowRegistration] = useState(false);
  //const [showLinkRegistration, setShowLinkRegistration] = useState(false);
  //const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [moveSheetOpen, setMoveSheetOpen] = useState(false);
  
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const editMode = useToggle(false);
  const { selectedId, select } = useSelectableId('all');

  const groups = useMemo(
    () => [
      { id: 'g1', name: '겨울 아우터' },
      { id: 'g2', name: '겨울 아우터' },
      { id: 'g3', name: '겨울 아우터' },
      { id: 'g4', name: '겨울 아우터' },
      { id: 'g5', name: '겨울 아우터' },
    ],
    [],
  );

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

  const moveFolders = useMemo(
    () => groups.map((g) => ({ id: g.id, name: g.name })),
    [groups],
  );

  const hasSelection = selectedItemIds.size > 0;

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastOpen(true);
    window.setTimeout(() => setToastOpen(false), 2000);
  };

  const enterEditMode = () => {
    setSelectedItemIds(new Set());
    editMode.on();
  };

  const exitEditMode = () => {
    setSelectedItemIds(new Set());
    editMode.off();
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = () => {
    if (selectedItemIds.size === 0) return;
    setDeleteModalOpen(true);
  };

  const confirmDeleteSelected = () => {
    setDeleteModalOpen(false);
    setSelectedItemIds(new Set());
    editMode.off();
    showToast('위시템이 삭제되었습니다.');
  };

  const handleMoveSelected = () => {
    if (selectedItemIds.size === 0) return;
    setMoveSheetOpen(true);
  };

  const handleSelectFolder = (folderId: string) => {
    const folder = groups.find((g) => g.id === folderId);
    if (!folder) return;

    setMoveSheetOpen(false);
    setSelectedItemIds(new Set());
    editMode.off();
    showToast(`${folder.name} 폴더로 이동했습니다.`);
  };

  /*
  if (showLinkRegistration) {
    return (
      <LinkRegistrationPage 
        onBack={() => setShowLinkRegistration(false)} 
        onComplete={() => {
          setShowLinkRegistration(false);
        }}
      />
    );
  }

  if (showRegistration) {
    return <WishRegistrationPage onBack={() => setShowRegistration(false)} />;
  }
*/
  return (
    <div className="AppContainer relative flex flex-col h-screen overflow-hidden">
      {/* 임시 헤더 */}
      <div className="shrink-0 bg-white" style={{ height: HEADER_HEIGHT }}>
        <header className="px-5 flex items-center justify-between h-full">
          <WishListLogo className="w-[112px] h-[22px]" aria-label="Wish List" />
          <AddFolderButton onClick={() => {}} />
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
                <PillIconButton
                  Icon={DeletePill}
                  ariaLabel="상품삭제"
                  onClick={handleDeleteSelected}
                  disabled={!hasSelection}
                />
                <PillIconButton
                  Icon={MovePill}
                  ariaLabel="폴더로 이동"
                  onClick={handleMoveSelected}
                  disabled={!hasSelection}
                />
              </div>
              <PillIconButton Icon={ClosePill} ariaLabel="닫기" onClick={exitEditMode} />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              <WishlistGrid
                items={items}
                editMode
                selectedIds={selectedItemIds}
                onToggleSelect={toggleSelectItem}
              />
              <div className="h-[96px]" />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <PillIconButton Icon={EditPill} ariaLabel="수정하기" onClick={enterEditMode} />
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              <WishlistGrid items={items} />
              <div className="h-[96px]" />
            </div>
          </>
        )}
      </WishlistPanel>

      <ConfirmDeleteModal
        open={deleteModalOpen}
        title="선택한 상품을 삭제할까요?"
        description="삭제한 상품은 되돌릴 수 없어요."
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteSelected}
      />
      
      <MoveFolderSheet
        open={moveSheetOpen}
        folders={moveFolders}
        onClose={() => setMoveSheetOpen(false)}
        onSelectFolder={handleSelectFolder}
      />

      {!editMode.value && toastOpen ? <Toast message={toastMessage} /> : null}
    </div>
  );
}

