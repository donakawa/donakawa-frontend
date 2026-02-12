import { useEffect, useMemo, useState, useRef } from 'react';

import WishlistGrid, { type WishlistItemType } from './components/wishlistGrid';
import WishlistPanel from './components/wishlistPanel';

import AddFolderButton from './components/buttons/AddFolderButton';
import AddIconButton from './components/buttons/AddIconButton';
import PillIconButton from './components/buttons/PillButton';

import ConfirmDeleteModal from './components/modals/ConfirmDeleteModal';
import AddWishItemModal from './components/modals/AddWishItemModal';
import MoveFolderSheet from './components/MoveFolderSheet';
import Toast from './components/Toast';

import LinkRegistrationPage from './LinkRegistrationPage';
import AddFolderPage from './AddFolderPage';

import useToggle from './hooks/useToggle';
import useSelectableId from './hooks/useSelectableId';

import WishListLogo from '@/assets/wishlist_logo.svg?react';
import EditPill from '@/assets/edit.svg?react';
import DeletePill from '@/assets/delete.svg?react';
import MovePill from '@/assets/move.svg?react';
import ClosePill from '@/assets/close.svg?react';
import type { WishItemData } from '../../types/WishlistPage/WishItemData';
import FolderEditPage from './FolderEditPage';
import DonaAiBanner from './components/donaAIBanner';
import WishGroupRow from './components/wishGrouprow';

import { useWishlistFolders } from '@/queries/WishlistPage/useWishlistFolders';
import LinkLoadingScreen from './LinkLoadingScreen';
import { useCreateWishlistFolder } from '@/queries/WishlistPage/useCreateWishlistFolders';
import { useWishlistItems } from '@/queries/WishlistPage/useWishlistItems';
import { useInView } from 'react-intersection-observer';
import { useUpdateWishlistItemFolder } from '@/queries/WishlistPage/useUpdateWishlistItemFolder';
import { useWishlistFolderItems } from '@/queries/WishlistPage/useWishlistFolderItems';
import { useDeleteWishlistItem } from '@/queries/WishlistPage/useDeleteWishlistItem';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import WishRegistrationPage from './WishRegistrationPage';
type WishlistDisplayItem = WishlistItemType & { realId: string };

const HEADER_HEIGHT = 56;

export default function WishlistPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showRegistration, setShowRegistration] = useState(false);
  const [showLinkRegistration, setShowLinkRegistration] = useState(false);
  const [showAddFolder, setShowAddFolder] = useState(false);
  const [initialData, setInitialData] = useState<(WishItemData & { cacheId?: string }) | null>(null); // 링크에서 가져온 데이터 저장
  
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [moveSheetOpen, setMoveSheetOpen] = useState(false);
  const [showFolderEdit, setShowFolderEdit] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const editMode = useToggle(false);
  const { selectedId, select } = useSelectableId('all');
  const {
    data: allItemsData,
    fetchNextPage: fetchNextAll,
    hasNextPage: hasNextAll,
    isFetchingNextPage: isFetchingAll,
  } = useWishlistItems("WISHLISTED");

  const {
    data: folderItemsData,
    fetchNextPage: fetchNextFolderItems,
    hasNextPage: hasNextFolderItems,
    isFetchingNextPage: isFetchingFolderItems,
  } = useWishlistFolderItems(selectedId);

  const isAllTab = selectedId === 'all';
  const hasNext = isAllTab ? hasNextAll : hasNextFolderItems;
  const isFetchingNext = isAllTab ? isFetchingAll : isFetchingFolderItems;
  const fetchNext = isAllTab ? fetchNextAll : fetchNextFolderItems;

  //무한 스크롤 감지
  const { ref: loadMoreRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNext && !isFetchingNext) {
        fetchNext();
      }
    },
  });

  const displayItems: WishlistDisplayItem[] = useMemo(() => {
    const currentItemsData = isAllTab ? allItemsData : folderItemsData;
    
    return (currentItemsData?.items || []).map((item) => ({
      id: `${item.type}_${item.id}`, 
      imageUrl: item.photoUrl,
      price: item.price,
      title: item.name,
      type: item.type,
      realId: item.id 
    }));
  }, [isAllTab, allItemsData, folderItemsData]);

  const { mutateAsync: deleteItem } = useDeleteWishlistItem();
  
  const [bannerEpoch, setBannerEpoch] = useState(0);
  const createFolder = useCreateWishlistFolder();
  const { mutateAsync: updateFolder } = useUpdateWishlistItemFolder();
  const {
    data: folderQuery,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: folderLoading,
    isError: folderError,
  } = useWishlistFolders(10);

  const folderGroups = useMemo(
    () => (folderQuery?.folders ?? []).map((f) => ({ id: f.id, name: f.name })),
    [folderQuery]
  );

  const groups = useMemo(
    () => [...folderGroups],
    [folderGroups]
  );

  // MoveFolderSheet / FolderEditPage에 넘길 폴더
  const moveFolders = useMemo(
    () => folderGroups.map((g) => ({ id: g.id, name: g.name })),
    [folderGroups]
  );

  const handleItemClick = (compositeId: string) => {
    const idx = compositeId.indexOf('_');
    const type = compositeId.slice(0, idx);
    const id = compositeId.slice(idx + 1);
    navigate(`/wishlist/detail/${id}?type=${type}`);
  };

  const hasSelection = selectedItemIds.size > 0;

  const toastTimeoutRef = useRef<number | null>(null);
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const [dismissedEpoch, setDismissedEpoch] = useState<number | null>(null);

  const isMain =
    !showLinkRegistration &&
    !showRegistration &&
    !showAddFolder &&
    !showFolderEdit;

  const showBanner = isMain && dismissedEpoch !== bannerEpoch;

  const dismissBanner = () => setDismissedEpoch(bannerEpoch);

  // 메인으로 돌아왔을 때 배너를 다시 띄우기
  const resetBanner = () => setBannerEpoch((v) => v + 1);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    setToastOpen(true);
    toastTimeoutRef.current = window.setTimeout(() => setToastOpen(false), 2000);
  };

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);


  const handleLinkComplete = (data: WishItemData & { cacheId?: string }) => {
    setInitialData(data);
    setShowLinkRegistration(false);
    setShowRegistration(true);
  };

  const handleRegistrationComplete = (data: any) => {
    setShowRegistration(false);
    setInitialData(null);

    const message = data?.isEdit ? '정보가 수정되었습니다.' : '위시템이 추가되었습니다!';
    showToast(message);
    
    resetBanner();
};

  const confirmDeleteSelected = async () => {
    const selectedItems = displayItems.filter((item) => selectedItemIds.has(item.id));
    if (selectedItems.length === 0) return;

    try {
      await Promise.all(
        selectedItems.map((item) =>
          deleteItem({ 
            itemId: (item as any).realId,
            type: item.type as 'AUTO' | 'MANUAL' 
          })
        )
      );

      queryClient.invalidateQueries({ queryKey: ["wishlistItems"] });
      queryClient.invalidateQueries({ queryKey: ["wishlistFolderItems"] });

      setDeleteModalOpen(false);
      setSelectedItemIds(new Set());
      editMode.off();
      showToast('위시템이 삭제되었습니다.');
      resetBanner();
    } catch (error: any) {
      console.error(error);
      if (error.response?.status === 404) {
        alert("일부 아이템을 찾을 수 없습니다. 이미 삭제되었을 수 있습니다.");
      } else {
        alert("아이템 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleAddFolderComplete = async (folderName: string) => {
    try {
      const res = await createFolder.mutateAsync(folderName);

      if (res.resultType === "SUCCESS") {
        setShowAddFolder(false);
        editMode.off();
        showToast(`'${folderName}' 폴더가 추가되었습니다!`);
        resetBanner();
        return;
      }

      showToast("폴더 생성에 실패했어요.");
    } catch {
      showToast("폴더 생성에 실패했어요.");
    }
  };

  
  const handleFolderDeleteComplete = (folderName: string) => {
    setShowFolderEdit(false);
    showToast(`'${folderName}' 폴더가 삭제되었습니다.`);
    resetBanner();
  };

  const enterEditMode = () => { dismissBanner(); editMode.on(); setSelectedItemIds(new Set()); };
  const exitEditMode = () => { editMode.off(); setSelectedItemIds(new Set()); resetBanner();};
  
  const toggleSelectItem = (compositeId: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(compositeId)) next.delete(compositeId);
      else next.add(compositeId);
      return next;
    });
  };
  
  if (folderLoading) {
    return <LinkLoadingScreen />;
  }

  if (folderError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white">
        <p className="text-sm text-gray-500">
          폴더를 불러오지 못했어요.
        </p>
      </div>
    );
  }
  
  const handleMoveToFolder = async (folderId: string) => {
    const selectedItems = displayItems.filter((item) => selectedItemIds.has(item.id));
    if (selectedItems.length === 0) return;

    try {
      await Promise.all(
        selectedItems.map((item) =>
          updateFolder({ 
            itemId: (item as any).realId,
            type: item.type as 'AUTO' | 'MANUAL',
            folderId 
          })
        )
      );

      setMoveSheetOpen(false);
      exitEditMode();
      showToast('폴더로 이동했습니다.');
      resetBanner();
    } catch (error) {
      console.error(error);
      alert('아이템 이동 중 오류가 발생했습니다.');
    }
  };

  if (showLinkRegistration) {
    return <LinkRegistrationPage onBack={() => {setShowLinkRegistration(false); resetBanner();}} onComplete={handleLinkComplete} />;
  }

  if (showRegistration) {
    return (
      <WishRegistrationPage
        onBack={() => { setShowRegistration(false); setInitialData(null); resetBanner(); }} 
        onComplete={handleRegistrationComplete}
        initialData={initialData || undefined}
      />
    );
  }

  if (showAddFolder) {
    return (
      <AddFolderPage 
        onBack={() => {setShowAddFolder(false); resetBanner(); }}
        onComplete={handleAddFolderComplete} 
      />
    );
  }

  if (showFolderEdit) {
    return (
      <FolderEditPage 
        folders={moveFolders}
        onBack={() => {setShowFolderEdit(false); resetBanner();}}
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
          <AddFolderButton onClick={() => { dismissBanner(); setShowFolderEdit(true); }} />
        </header>
      </div>

      {!editMode.value && (
        <div className="shrink-0">
          <WishGroupRow groups={groups} selectedId={selectedId} onSelect={select} />
          {hasNextPage && (
            <button
              className="px-5 py-2 text-sm text-gray-500"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage ? "불러오는 중..." : "폴더 더보기"}
            </button>
          )}
        </div>
      )}


      <WishlistPanel editMode={editMode.value} bottomPaddingPx={0}>
        {editMode.value ? (
          <>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-3">
                <PillIconButton Icon={DeletePill} ariaLabel="상품삭제" onClick={() => {dismissBanner(); setDeleteModalOpen(true);}} disabled={!hasSelection} />
                <PillIconButton Icon={MovePill} ariaLabel="폴더로 이동" onClick={() => {dismissBanner(); setMoveSheetOpen(true);}} disabled={!hasSelection} />
              </div>
              <PillIconButton Icon={ClosePill} ariaLabel="닫기" onClick={() => { dismissBanner(); exitEditMode(); }} />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              <WishlistGrid 
                items={displayItems} 
                editMode={editMode.value} 
                selectedIds={selectedItemIds} 
                onToggleSelect={(id) => toggleSelectItem(id)}
              />
              {hasNext && (
                <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
                  {isFetchingNext && <p className="text-xs text-gray-400">불러오는 중...</p>}
                </div>
              )}
              <div className="h-[50px]" />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4 shrink-0">
              <PillIconButton Icon={EditPill} ariaLabel="수정하기" onClick={enterEditMode} />
              <AddIconButton onClick={() => { dismissBanner(); setAddModalOpen(true); }} ariaLabel="위시템 추가" />
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
              <WishlistGrid items={displayItems} onItemClick={handleItemClick}/>
              {hasNext && (
                <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
                  {isFetchingNext && <p className="text-xs text-gray-400">불러오는 중...</p>}
                </div>
              )}
              <div className="h-[50px]" />
            </div>
          </>
        )}
      </WishlistPanel>

      <ConfirmDeleteModal 
        open={deleteModalOpen} 
        title="위시템을 삭제하시겠어요?" 
        description="삭제 시 되돌릴 수 없습니다." 
        onCancel={() => {setDeleteModalOpen(false); resetBanner();}} 
        onConfirm={confirmDeleteSelected}
      />
      <MoveFolderSheet open={moveSheetOpen} folders={moveFolders} onClose={() => setMoveSheetOpen(false)} onAddFolderClick={() => { setMoveSheetOpen(false);setShowAddFolder(true);dismissBanner();}} onSelectFolder={handleMoveToFolder} />
      <AddWishItemModal open={addModalOpen} onClose={() => {setAddModalOpen(false);resetBanner();}} onAddViaLink={() => { dismissBanner(); setAddModalOpen(false); setShowLinkRegistration(true); }} onAddDirectly={() => { dismissBanner(); setAddModalOpen(false); setShowRegistration(true); }} />
      {toastOpen && <Toast message={toastMessage} />}
      {showBanner && (
        <DonaAiBanner
          key={bannerEpoch}
          ref={bannerRef}
          onDismiss={dismissBanner}
        />
      )}
    </div>
  );
}


