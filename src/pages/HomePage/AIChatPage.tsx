import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import type { HeaderControlContext } from '@/layouts/ProtectedLayout';

import HamBar from '@/assets/ham_icon.svg';
import PlusIcon from '@/assets/view_more(green).svg';
import SendIcon from '@/assets/send_icon.svg';
import SearchIcon from '@/assets/search_icon.svg';
import NewChatIcon from '@/assets/view_more(brown05).svg';

const DELETE_BUTTON_H = 40;

type SelectedProduct = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};

type ChatMessage =
  | { id: string; role: 'user'; kind: 'product'; product: SelectedProduct }
  | { id: string; role: 'assistant'; kind: 'typing' };

const formatWon = (value: number): string => new Intl.NumberFormat('ko-KR').format(value);

export default function AIChatPage() {
  const { setTitle, setRightAction, setLayoutModal } = useOutletContext<HeaderControlContext>();

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [activeHistoryId, setActiveHistoryId] = useState<string>('h1');

  // 우클릭 삭제
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTop, setDeleteTop] = useState<number>(0);

  // 삭제 모달
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // 삭제 토스트
  const [showDeleteToast, setShowDeleteToast] = useState<boolean>(false);
  const toastTimerRef = useRef<number | null>(null);

  const sidebarRef = useRef<HTMLElement | null>(null);
  const deletePopoverRef = useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null);

  const [chatHistory, setChatHistory] = useState<{ id: string; title: string }[]>([
    { id: 'h1', title: '캐시미어 로제 더블 코트' },
    { id: 'h2', title: '레그 워머' },
    { id: 'h3', title: '포근 스웨터' },
  ]);

  const filteredHistory = useMemo(
    () => chatHistory.filter((item) => item.title.toLowerCase().includes(search.toLowerCase())),
    [chatHistory, search],
  );

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setDeleteTargetId(null);
    setIsSidebarOpen(false);
  }, []);

  const onNewChat = useCallback(() => {
    setDeleteTargetId(null);
    setIsSidebarOpen(false);
  }, []);

  const handleHistoryContextMenu =
    (id: string) =>
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
      if (!deleteTargetId) return;

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
      if (!deleteTargetId) return;

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

  const fireDeleteToast = useCallback((): void => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }

    setShowDeleteToast(true);

    toastTimerRef.current = window.setTimeout(() => {
      setShowDeleteToast(false);
      toastTimerRef.current = null;
    }, 2000);
  }, []);

  const confirmDelete = useCallback((): void => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;

    setChatHistory((prev) => prev.filter((it) => it.id !== id));
    setActiveHistoryId((prevActive) => (prevActive === id ? '' : prevActive));

    closeDeleteModal();
    fireDeleteToast();
  }, [pendingDeleteId, closeDeleteModal, fireDeleteToast]);

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

      if (isSidebarOpen) {
        closeSidebar();
      }
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

  const sidebarModalNode = useMemo(() => {
    if (!isSidebarOpen) return null;

    return (
      <div className="absolute inset-0">
        <button type="button" aria-label="사이드바 닫기" onClick={closeSidebar} className="absolute inset-0" />

        <aside
          ref={sidebarRef}
          onMouseDown={handleSidebarMouseDown}
          className="absolute right-0 top-0 h-full w-4/5 max-w-[320px] bg-white p-4">
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

          {deleteTargetId && (
            <div ref={deletePopoverRef} className="absolute right-4 z-30" style={{ top: deleteTop }}>
              <button
                type="button"
                onClick={openDeleteModal}
                className="h-10 w-[60px] cursor-pointer rounded-[10px] border-[1.5px] border-error bg-white text-[16px] font-medium text-error">
                삭제
              </button>
            </div>
          )}

          <div className="flex flex-col">
            {filteredHistory.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveHistoryId(item.id);
                  setDeleteTargetId(null);
                  closeSidebar();
                }}
                onContextMenu={handleHistoryContextMenu(item.id)}
                className={[
                  'cursor-pointer border-0 text-left text-[16px] font-normal',
                  'py-3 px-3',
                  '-mx-4 px-4',
                  item.id === activeHistoryId ? 'bg-primary-200' : 'bg-transparent',
                ].join(' ')}>
                {item.title}
              </button>
            ))}
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
                  onClick={confirmDelete}
                  className="w-[110px] cursor-pointer rounded-[100px] border-[1.5px] border-primary-brown-300 bg-primary-brown-300 py-2 text-[16px] font-medium text-white">
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteToast && (
          <div className="pointer-events-none absolute bottom-6 left-1/2 z-[60] -translate-x-1/2" aria-live="polite">
            <div
              className={[
                'w-[335px] rounded-[100px] border-[1.5px] border-primary-brown-400 bg-white',
                'flex items-center px-[18px] py-[10px]',
                'text-[12px] font-normal text-black',
                'shadow-[0px_0px_4px_rgba(97,69,64,1)]',
              ].join(' ')}>
              채팅이 삭제되었습니다.
            </div>
          </div>
        )}
      </div>
    );
  }, [
    isSidebarOpen,
    closeSidebar,
    handleSidebarMouseDown,
    search,
    onNewChat,
    NewChatIcon,
    SearchIcon,
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
  ]);

  useEffect(() => {
    if (!sidebarModalNode) {
      setLayoutModal(null);
      return;
    }
    setLayoutModal(sidebarModalNode);

    return () => {
      setLayoutModal(null);
    };
  }, [sidebarModalNode, setLayoutModal]);

  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const pickProductTemp = useCallback(() => {
    setSelectedProduct({
      id: 'p1',
      name: '캐시미어 로제 더블 코트',
      price: 238400,
      imageUrl: 'https://images.unsplash.com/photo-1520975682031-a67fbc6fae6a?auto=format&fit=crop&w=600&q=60',
    });
  }, []);

  const sendSelectedProduct = useCallback(() => {
    if (!selectedProduct) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      kind: 'product',
      product: selectedProduct,
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

    setSelectedProduct(null);
  }, [selectedProduct]);

  const TypingBubble = () => (
    <div
      className={[
        'inline-flex items-center justify-center',
        'w-[69px] h-[31px]',
        'rounded-[10px]',
        'bg-[#E6F2E3]',
      ].join(' ')}>
      {' '}
      <span className="inline-flex items-end gap-[6px]">
        <span className="h-[6px] w-[6px] rounded-full bg-[#4E9C64] animate-bounce [animation-delay:0ms]" />
        <span className="h-[6px] w-[6px] rounded-full bg-[#4E9C64] animate-bounce [animation-delay:150ms]" />
        <span className="h-[6px] w-[6px] rounded-full bg-[#4E9C64] animate-bounce [animation-delay:300ms]" />
      </span>
    </div>
  );

  const ProductCardBubble = ({ product }: { product: SelectedProduct }) => {
    return (
      <div
        className={[
          'w-[109px] overflow-hidden rounded-[10px] bg-white',
          'shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]',
        ].join(' ')}>
        <div className="p-2.5">
          <div className="h-[94px] w-full overflow-hidden rounded-[5px] bg-gray-100">
            <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
        <div className="pt-0 p-2.5">
          <div className="text-[12px] font-medium leading-normal text-black">{formatWon(product.price)}</div>
          <div className=" truncate text-[14px] font-normal leading-normal text-black">{product.name}</div>
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
                <div key={msg.id} className="mb-3 flex justify-end">
                  <ProductCardBubble product={msg.product} />
                </div>
              );
            }

            if (msg.role === 'assistant' && msg.kind === 'typing') {
              return (
                <div key={msg.id} className="mb-3 flex justify-start">
                  <TypingBubble />
                </div>
              );
            }

            return null;
          })}

          <div ref={bottomRef} />
        </main>

        <footer className="px-4">
          <div
            className={[
              'h-[41px] w-[335px] rounded-[100px] bg-white',
              'flex items-center gap-[10px] px-[14px]',
              'shadow-[0px_0px_4px_rgba(0,0,0,0.25)]',
            ].join(' ')}>
            <button
              type="button"
              aria-label="상품 추가"
              onClick={pickProductTemp}
              className="flex h-9 w-9 items-center justify-center p-0">
              <img src={PlusIcon} alt="" className="block h-6 w-6" />
            </button>

            <div className="flex-1 text-[16px] font-medium text-gray-600">상품을 추가해보세요.</div>

            <button
              type="button"
              aria-label="전송"
              onClick={sendSelectedProduct}
              disabled={!selectedProduct}
              className="flex h-9 w-9 items-center justify-center p-0 disabled:opacity-50">
              <img src={SendIcon} alt="" className="block h-6 w-6" />
            </button>
          </div>

          {/* 임시 멘트 */}
          {selectedProduct && <div className="mt-2 px-1 text-[12px] text-gray-500">선택됨: {selectedProduct.name}</div>}
        </footer>
      </div>
    </div>
  );
}
