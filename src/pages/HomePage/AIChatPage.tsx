// src/pages/HomePage/AIChatPage.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';

import type { HeaderControlContext } from '@/layouts/ProtectedLayout';

import HamBar from '@/assets/ham_icon.svg';
import PlusIcon from '@/assets/view_more(green).svg';
import SendIcon from '@/assets/send_icon.svg';
import SearchIcon from '@/assets/search_icon.svg';
import NewChatIcon from '@/assets/view_more(brown05).svg';

import ProgressiveSurvey, { LoadingBubble } from '@/components/ProgressiveSurvey';

import {
  createChat,
  deleteChatRoom,
  getChatRoomDetail,
  getChatRooms,
  type ChatItemType,
  type ChatRoomListItem,
} from '@/apis/HomePage/aichat';

const DELETE_BUTTON_H = 40;

type PickedWishItem = {
  wishItemId: number;
  name: string;
  price: number;
  imageUrl: string;
  type: ChatItemType;
};

type LocationState = {
  from?: string;
  pickedWishItem?: PickedWishItem;
};

type ChatMessage =
  | { id: string; role: 'user'; kind: 'product'; product: PickedWishItem }
  | { id: string; role: 'user'; kind: 'text'; text: string } // ✅ 과거 선택 복원용
  | { id: string; role: 'assistant'; kind: 'typing' }
  | { id: string; role: 'assistant'; kind: 'survey'; chatId: number };

const formatWon = (value: number): string => new Intl.NumberFormat('ko-KR').format(value);

export default function AIChatPage() {
  const { setTitle, setRightAction, setLayoutModal } = useOutletContext<HeaderControlContext>();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');

  const [activeHistoryId, setActiveHistoryId] = useState<number | null>(null);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteTop, setDeleteTop] = useState<number>(0);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const [showDeleteToast, setShowDeleteToast] = useState<boolean>(false);
  const [showSendFailToast, setShowSendFailToast] = useState<boolean>(false);

  const toastTimerRef = useRef<number | null>(null);

  const sidebarRef = useRef<HTMLElement | null>(null);
  const deletePopoverRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pickedWishItem, setPickedWishItem] = useState<PickedWishItem | null>(null);

  const [chatHistory, setChatHistory] = useState<ChatRoomListItem[]>([]);
  const [isChatHistoryLoading, setIsChatHistoryLoading] = useState<boolean>(false);

  const fetchChatRooms = useCallback(async (): Promise<void> => {
    setIsChatHistoryLoading(true);
    try {
      const rooms = await getChatRooms();
      setChatHistory(rooms);

      if (rooms.length > 0 && activeHistoryId === null) {
        setActiveHistoryId(rooms[0].id);
      }
    } catch {
      // ignore
    } finally {
      setIsChatHistoryLoading(false);
    }
  }, [activeHistoryId]);

  useEffect(() => {
    void fetchChatRooms();
  }, [fetchChatRooms]);

  useEffect(() => {
    if (!isSidebarOpen) return;
    void fetchChatRooms();
  }, [isSidebarOpen, fetchChatRooms]);

  useEffect(() => {
    const state = (location.state ?? null) as LocationState | null;
    const picked = state?.pickedWishItem;
    if (!picked) return;
    if (!picked.type) return;

    setPickedWishItem(picked);
    window.history.replaceState({}, document.title);
  }, [location.state]);

  const filteredHistory = useMemo(
    () => chatHistory.filter((item) => item.title.toLowerCase().includes(search.toLowerCase())),
    [chatHistory, search],
  );

  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => {
    setDeleteTargetId(null);
    setIsSidebarOpen(false);
  }, []);

  const onNewChat = useCallback(() => {
    setDeleteTargetId(null);
    setIsSidebarOpen(false);
    setMessages([]);
    setPickedWishItem(null);
    setActiveHistoryId(null);
  }, []);

  // ✅ 채팅방 클릭 → 상세 조회해서 "기록 복원"
  const openChatRoom = useCallback(
    async (chatId: number): Promise<void> => {
      setActiveHistoryId(chatId);
      setDeleteTargetId(null);
      closeSidebar();

      try {
        const detail = await getChatRoomDetail(chatId);

        const restoredProduct: PickedWishItem = {
          wishItemId: detail.wishItem.id,
          name: detail.wishItem.name,
          price: detail.wishItem.price,
          imageUrl: '', // 상세 응답에 image 없음(있으면 여기 매핑)
          type: 'MANUAL', // 서버에서 type이 없으면 임시 값
        };

        const restored: ChatMessage[] = [];
        restored.push({
          id: `restore-product-${chatId}`,
          role: 'user',
          kind: 'product',
          product: restoredProduct,
        });

        const sortedAnswers = [...(detail.answers ?? [])].sort((a, b) => a.step - b.step);
        for (const ans of sortedAnswers) {
          restored.push({
            id: `restore-answer-${chatId}-${ans.step}`,
            role: 'user',
            kind: 'text',
            text: ans.selectedOption,
          });
        }

        restored.push({
          id: `restore-survey-${chatId}`,
          role: 'assistant',
          kind: 'survey',
          chatId,
        });

        setMessages(restored);
      } catch {
        setMessages([{ id: `restore-survey-${chatId}`, role: 'assistant', kind: 'survey', chatId }]);
      }
    },
    [closeSidebar],
  );

  const handleHistoryContextMenu =
    (id: number) =>
    (e: React.MouseEvent<HTMLButtonElement>): void => {
      e.preventDefault();

      const sidebarEl = sidebarRef.current;
      if (!sidebarEl) return;

      if (deleteTargetId === id) {
        setDeleteTargetId(null);
        return;
      }

      const itemRect = e.currentTarget.getBoundingClientRect();
      const sidebarRect = sidebarEl.getBoundingClientRect();
      const top = itemRect.top - sidebarRect.top + sidebarEl.scrollTop + (itemRect.height - DELETE_BUTTON_H) / 2;

      setDeleteTargetId(id);
      setDeleteTop(top);
    };

  const handleSidebarMouseDown = useCallback(
    (e: React.MouseEvent<HTMLElement>): void => {
      if (deleteTargetId === null) return;

      const pop = deletePopoverRef.current;
      const target = e.target as Node;

      if (pop && pop.contains(target)) return;
      setDeleteTargetId(null);
    },
    [deleteTargetId],
  );

  const openDeleteModal = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>): void => {
      e.stopPropagation();
      if (deleteTargetId === null) return;

      setPendingDeleteId(deleteTargetId);
      setIsDeleteModalOpen(true);
      setDeleteTargetId(null);
    },
    [deleteTargetId],
  );

  const closeDeleteModal = useCallback((): void => {
    setIsDeleteModalOpen(false);
    setPendingDeleteId(null);
  }, []);

  const fireToast = useCallback((type: 'delete' | 'sendFail'): void => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }

    if (type === 'delete') setShowDeleteToast(true);
    if (type === 'sendFail') setShowSendFailToast(true);

    toastTimerRef.current = window.setTimeout(() => {
      setShowDeleteToast(false);
      setShowSendFailToast(false);
      toastTimerRef.current = null;
    }, 2000);
  }, []);

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (pendingDeleteId === null) return;
    const id = pendingDeleteId;

    try {
      await deleteChatRoom(id);

      setChatHistory((prev) => prev.filter((it) => it.id !== id));
      setActiveHistoryId((prevActive) => (prevActive === id ? null : prevActive));

      setMessages((prev) => {
        const hasThis = prev.some((m) => (m.kind === 'survey' ? m.chatId === id : false));
        return hasThis ? [] : prev;
      });

      closeDeleteModal();
      fireToast('delete');
    } catch {
      closeDeleteModal();
    }
  }, [pendingDeleteId, closeDeleteModal, fireToast]);

  useEffect(() => {
    setTitle('도나AI 상담실');

    setRightAction({
      rightNode: <img src={HamBar} alt="" className="block h-6 w-6" />,
      ariaLabel: '기록 보기',
      onClick: toggleSidebar,
    });

    return () => {
      setTitle('');
      setRightAction(null);
      setLayoutModal(null);
    };
  }, [setTitle, setRightAction, setLayoutModal, toggleSidebar]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;

      if (isDeleteModalOpen) {
        closeDeleteModal();
        return;
      }
      if (isSidebarOpen) closeSidebar();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, isDeleteModalOpen, closeSidebar, closeDeleteModal]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isSidebarOpen) {
      setLayoutModal(null);
      return;
    }

    const node = (
      <div className="absolute inset-0">
        <button type="button" aria-label="사이드바 닫기" onClick={closeSidebar} className="absolute inset-0" />

        <aside
          ref={sidebarRef}
          onMouseDown={handleSidebarMouseDown}
          className="absolute right-0 top-0 h-full w-4/5 max-w-[320px] bg-white p-4">
          <div className="flex h-full flex-col">
            <div className="my-4">
              <div className="box-border flex h-[41px] w-full items-center gap-[5px] rounded-[100px] bg-secondary-100 px-[18px] shadow-[0px_0px_4px_rgba(0,0,0,0.25)]">
                <div className="flex h-7 w-7 flex-[0_0_28px] items-center justify-center" aria-hidden="true">
                  <img src={SearchIcon} alt="" />
                </div>

                <input
                  placeholder="검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="채팅 검색"
                  className="h-full min-w-0 flex-1 border-0 bg-transparent text-[16px] font-medium text-black outline-none placeholder:font-semibold placeholder:text-gray-600"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={onNewChat}
              className="my-5 flex w-full cursor-pointer items-center gap-[14px] bg-transparent px-2 py-0 text-[26px] font-bold text-primary-brown-500">
              <span className="flex h-[15px] w-[15px] items-center justify-center" aria-hidden="true">
                <img src={NewChatIcon} alt="" />
              </span>
              <span className="text-[16px] font-medium text-primary-brown-500">새 채팅</span>
            </button>

            <div className="py-[10px] text-[12px] text-gray-600">채팅 기록</div>

            {deleteTargetId !== null && (
              <div ref={deletePopoverRef} className="absolute right-4 z-30" style={{ top: deleteTop }}>
                <button
                  type="button"
                  onClick={openDeleteModal}
                  className="h-10 w-[60px] cursor-pointer rounded-[10px] border-[1.5px] border-error bg-white text-[16px] font-medium text-error">
                  삭제
                </button>
              </div>
            )}

            {/* ✅ 리스트: 스크롤 + 배경을 양끝까지 먹게 */}
            <div
              className={[
                'min-h-0 flex-1 overflow-y-auto',
                '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
                '-mx-4',
              ].join(' ')}>
              <div className="flex w-full flex-col">
                {isChatHistoryLoading && filteredHistory.length === 0 ? (
                  <div className="px-4 py-3 text-[12px] text-gray-500">불러오는 중...</div>
                ) : (
                  filteredHistory.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => void openChatRoom(item.id)}
                      onContextMenu={handleHistoryContextMenu(item.id)}
                      className={[
                        'block w-full', // ✅ 핵심: 배경이 양끝까지 차게
                        'cursor-pointer border-0 text-left text-[16px] font-normal',
                        'py-3',
                        'px-4',
                        item.id === activeHistoryId ? 'bg-primary-200' : 'bg-transparent',
                      ].join(' ')}>
                      {item.title}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>

        {isDeleteModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="채팅 삭제 확인"
            onClick={closeDeleteModal}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(61,43,39,0.8)] px-5">
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex h-[234px] w-full max-w-[335px] flex-col justify-end gap-[10px] rounded-[20px] bg-white py-[33px]">
              <h2 className="m-0 text-center text-[20px] font-semibold">이 채팅을 삭제하시겠습니까?</h2>
              <p className="text-center text-[14px] font-normal text-gray-600">삭제 시 되돌릴 수 없습니다.</p>

              <div className="mt-[22px] flex justify-center gap-[50px]">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="w-[110px] cursor-pointer rounded-[100px] border-[1.5px] border-primary-brown-300 bg-white py-2 text-[16px] font-medium text-primary-brown-300">
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => void confirmDelete()}
                  className="w-[110px] cursor-pointer rounded-[100px] border-[1.5px] border-primary-brown-300 bg-primary-brown-300 py-2 text-[16px] font-medium text-white">
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}

        {(showDeleteToast || showSendFailToast) && (
          <div className="pointer-events-none absolute bottom-6 left-1/2 z-[60] -translate-x-1/2" aria-live="polite">
            <div
              className={[
                'w-[335px] rounded-[100px] border-[1.5px] border-primary-brown-400 bg-white',
                'flex items-center px-[18px] py-[10px]',
                'text-[12px] font-normal text-black',
                'shadow-[0px_0px_4px_rgba(97,69,64,1)]',
              ].join(' ')}>
              {showDeleteToast ? '채팅이 삭제되었습니다.' : '서버 문제로 채팅 생성에 실패했어요.'}
            </div>
          </div>
        )}
      </div>
    );

    setLayoutModal(node);

    return () => {
      setLayoutModal(null);
    };
  }, [
    isSidebarOpen,
    setLayoutModal,
    closeSidebar,
    handleSidebarMouseDown,
    search,
    onNewChat,
    deleteTargetId,
    deleteTop,
    openDeleteModal,
    filteredHistory,
    activeHistoryId,
    handleHistoryContextMenu,
    closeDeleteModal,
    isDeleteModalOpen,
    confirmDelete,
    showDeleteToast,
    showSendFailToast,
    isChatHistoryLoading,
    openChatRoom,
  ]);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const goToItemSelection = useCallback(() => {
    const from = location.pathname + location.search;
    navigate('/home/items/select', { state: { from } });
  }, [navigate, location.pathname, location.search]);

  const clearPickedWishItem = useCallback((): void => {
    setPickedWishItem(null);
  }, []);

  const sendPickedWishItem = useCallback(async () => {
    if (!pickedWishItem) return;

    const sendingItem = pickedWishItem;
    setPickedWishItem(null);

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      kind: 'product',
      product: sendingItem,
    };

    const typingMsg: ChatMessage = {
      id: `t-${Date.now() + 1}`,
      role: 'assistant',
      kind: 'typing',
    };

    setMessages((prev) => {
      const withoutTyping = prev.filter((m) => !(m.role === 'assistant' && m.kind === 'typing'));
      return [...withoutTyping, userMsg, typingMsg];
    });

    try {
      const chat = await createChat({
        type: sendingItem.type,
        wishItemId: sendingItem.wishItemId,
      });

      setMessages((prev) => prev.filter((m) => !(m.role === 'assistant' && m.kind === 'typing')));

      setChatHistory((prev) => {
        const exists = prev.some((r) => r.id === chat.id);
        if (exists) return prev;
        const nowIso = new Date().toISOString();
        return [{ id: chat.id, title: sendingItem.name, createdAt: nowIso }, ...prev];
      });
      setActiveHistoryId(chat.id);

      setMessages((prev) => [
        ...prev,
        { id: `s-${chat.id}-${Date.now()}`, role: 'assistant', kind: 'survey', chatId: chat.id },
      ]);

      void fetchChatRooms();
    } catch {
      setMessages((prev) => prev.filter((m) => !(m.role === 'assistant' && m.kind === 'typing')));
      setPickedWishItem(sendingItem);
      setShowSendFailToast(true);
    }
  }, [pickedWishItem, fetchChatRooms]);

  const ProductCardBubble = ({ product }: { product: PickedWishItem }) => {
    const hasImage = Boolean(product.imageUrl && product.imageUrl.trim().length > 0);

    return (
      <div
        className={[
          'w-[109px] overflow-hidden rounded-[10px] bg-white',
          'shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]',
        ].join(' ')}>
        <div className="p-2.5">
          <div className="h-[94px] w-full overflow-hidden rounded-[5px] bg-gray-100">
            {hasImage ? (
              <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full" />
            )}
          </div>
        </div>
        <div className="p-2.5 pt-0">
          <div className="text-[12px] font-medium leading-normal text-black">{formatWon(product.price)}</div>
          <div className="truncate text-[14px] font-normal leading-normal text-black">{product.name}</div>
        </div>
      </div>
    );
  };

  const UserTextBubble = ({ text }: { text: string }) => {
    return (
      <div className="max-w-[80%] rounded-[18px] bg-primary-brown-200 px-4 py-2 text-[14px] font-medium text-black">
        {text}
      </div>
    );
  };

  const SelectedProductPreview = ({ product, onRemove }: { product: PickedWishItem; onRemove: () => void }) => {
    return (
      <div className="relative w-[109px]">
        <button
          type="button"
          aria-label="선택한 상품 제거"
          onClick={onRemove}
          className={[
            'absolute right-[-12px] top-[-12px] z-20',
            'h-[21px] w-[21px] rounded-full',
            'bg-primary-600',
            'flex items-center justify-center',
            'shadow-[0px_2px_6px_rgba(0,0,0,0.25)]',
          ].join(' ')}>
          <span className="relative block h-[14px] w-[14px]">
            <span className="absolute left-1/2 top-1/2 h-[2px] w-[14px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" />
            <span className="absolute left-1/2 top-1/2 h-[2px] w-[14px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-white" />
          </span>
        </button>

        <div className={['overflow-hidden rounded-[10px] bg-white', 'shadow-[0px_0px_6px_rgba(0,0,0,0.18)]'].join(' ')}>
          <div className="p-2.5">
            <div className="flex h-[94px] w-full items-center justify-center overflow-hidden rounded-[5px] bg-gray-100">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full" />
              )}
            </div>
          </div>

          <div className="px-2.5 pb-2.5">
            <div className="text-[12px] font-medium leading-normal text-black">{formatWon(product.price)}</div>
            <div className="truncate text-[14px] font-normal leading-normal text-black">{product.name}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative h-[calc(100dvh-56px)] w-full bg-white">
      <div className="flex h-full flex-col">
        <main className="flex-1 overflow-y-auto p-4">
          {messages.map((msg) => {
            if (msg.role === 'user' && msg.kind === 'product') {
              return (
                <div key={msg.id} className="mb-5 flex justify-end">
                  <ProductCardBubble product={msg.product} />
                </div>
              );
            }

            if (msg.role === 'user' && msg.kind === 'text') {
              return (
                <div key={msg.id} className="mb-3 flex justify-end">
                  <UserTextBubble text={msg.text} />
                </div>
              );
            }

            if (msg.role === 'assistant' && msg.kind === 'typing') {
              return (
                <div key={msg.id} className="mb-3 flex justify-start">
                  <LoadingBubble />
                </div>
              );
            }

            if (msg.role === 'assistant' && msg.kind === 'survey') {
              return (
                <div key={msg.id} className="mb-3 flex justify-start">
                  <ProgressiveSurvey chatId={msg.chatId} />
                </div>
              );
            }

            return null;
          })}

          <div ref={bottomRef} />
        </main>

        <footer className="flex justify-center pb-4">
          <div
            className={[
              'w-[335px] bg-white',
              pickedWishItem ? 'rounded-[24px] px-[14px] pb-[10px] pt-[14px]' : 'h-[41px] rounded-[100px] px-[14px]',
              'shadow-[0px_0px_4px_rgba(0,0,0,0.25)]',
              'flex flex-col',
              pickedWishItem ? 'gap-[12px]' : 'justify-center',
            ].join(' ')}>
            {pickedWishItem && (
              <div className="pt-1">
                <SelectedProductPreview product={pickedWishItem} onRemove={clearPickedWishItem} />
              </div>
            )}

            <div className="flex items-center gap-[10px]">
              <button
                type="button"
                aria-label="상품 추가"
                onClick={goToItemSelection}
                className="flex h-9 w-9 items-center justify-center p-0">
                <img src={PlusIcon} alt="" className="block h-6 w-6" />
              </button>

              <div className="flex-1 text-[16px] font-medium text-gray-600">상품을 추가해보세요.</div>

              <button
                type="button"
                aria-label="전송"
                onClick={() => void sendPickedWishItem()}
                disabled={!pickedWishItem}
                className="flex h-9 w-9 items-center justify-center p-0 disabled:opacity-50">
                <img src={SendIcon} alt="" className="block h-6 w-6" />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
