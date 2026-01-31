import React, { useEffect, useMemo, useRef, useState } from 'react';

import type { ChatHistoryItemType, ChatMessageType } from '@/types/HomePage/aichat';

import LeftArrow from '@/assets/arrow_left.svg';
import HamBar from '@/assets/ham_icon.svg';
import PlusIcon from '@/assets/view_more(green).svg';
import SendIcon from '@/assets/send_icon.svg';
import SearchIcon from '@/assets/search_icon.svg';
import NewChatIcon from '@/assets/view_more(brown05).svg';

const DELETE_BUTTON_H = 40;

type Role = 'user' | 'assistant';

export default function AIChatPage() {
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

  const inputRef = useRef<HTMLInputElement | null>(null);
  const sidebarRef = useRef<HTMLElement | null>(null);
  const deletePopoverRef = useRef<HTMLDivElement | null>(null);

  const [chatHistory, setChatHistory] = useState<ChatHistoryItemType[]>([
    { id: 'h1', title: '캐시미어 로제 더블 코트' },
    { id: 'h2', title: '레그 워머' },
    { id: 'h3', title: '포근 스웨터' },
  ]);

  const messages: ChatMessageType[] = useMemo(
    () => [
      { id: 'm1', role: 'assistant', text: '안녕하세요! 무엇을 도와드릴까요?' },
      { id: 'm2', role: 'user', text: '코트 구매 고민 중이야.' },
    ],
    [],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;

      if (isDeleteModalOpen) {
        setIsDeleteModalOpen(false);
        setPendingDeleteId(null);
        return;
      }

      if (isSidebarOpen) {
        setDeleteTargetId(null);
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, isDeleteModalOpen]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, []);

  const filteredHistory = chatHistory.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));

  const onNewChat = () => {
    setDeleteTargetId(null);
    setIsSidebarOpen(false);
    // eslint-disable-next-line no-console
  };

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

  const handleSidebarMouseDown = (e: React.MouseEvent<HTMLElement>): void => {
    if (!deleteTargetId) return;

    const pop = deletePopoverRef.current;
    const target = e.target as Node;

    if (pop && pop.contains(target)) return;
    setDeleteTargetId(null);
  };

  const openDeleteModal = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.stopPropagation();

    if (!deleteTargetId) return;

    setPendingDeleteId(deleteTargetId);
    setIsDeleteModalOpen(true);

    setDeleteTargetId(null);
  };

  const closeDeleteModal = (): void => {
    setIsDeleteModalOpen(false);
    setPendingDeleteId(null);
  };

  const fireDeleteToast = (): void => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }

    setShowDeleteToast(true);

    toastTimerRef.current = window.setTimeout(() => {
      setShowDeleteToast(false);
      toastTimerRef.current = null;
    }, 2000);
  };

  const confirmDelete = (): void => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;

    setChatHistory((prev) => prev.filter((it) => it.id !== id));
    setActiveHistoryId((prevActive) => (prevActive === id ? '' : prevActive));

    closeDeleteModal();
    fireDeleteToast();
  };

  const bubbleBg = (role: Role) => (role === 'user' ? 'bg-gray-50' : 'bg-primary-200');
  const rowJustify = (role: Role) => (role === 'user' ? 'justify-end' : 'justify-start');

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white">
      <div className="flex h-full flex-col">
        <header className="flex h-14 items-center justify-between px-4">
          <button type="button" aria-label="뒤로가기" className="flex h-10 w-10 items-center justify-center p-0">
            <img src={LeftArrow} alt="뒤로가기" className="block h-6 w-6" />
          </button>

          <h1 className="m-0 text-center text-[20px] font-semibold">도나AI 상담실</h1>

          <button
            type="button"
            aria-label="기록 보기"
            onClick={() => setIsSidebarOpen(true)}
            className="flex h-10 w-10 items-center justify-center p-0">
            <img src={HamBar} alt="기록 보기" className="block h-6 w-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`mb-3 flex ${rowJustify(msg.role as Role)}`}>
              <div
                className={`max-w-[70%] rounded-[10px] px-[14px] py-[10px] text-[14px] ${bubbleBg(msg.role as Role)}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </main>

        <footer className="px-4 pb-5 pt-5">
          <div
            className={[
              'h-[41px] w-[335px] rounded-[100px] bg-white',
              'flex items-center gap-[10px] px-[14px]',
              'shadow-[0px_0px_4px_rgba(0,0,0,0.25)]',
            ].join(' ')}>
            <button type="button" aria-label="상품 추가" className="flex h-9 w-9 items-center justify-center p-0">
              <img src={PlusIcon} alt="" className="block h-6 w-6" />
            </button>

            <input
              ref={inputRef}
              placeholder="상품을 추가해보세요."
              aria-label="상품 추가 입력"
              className="h-full flex-1 border-0 bg-transparent text-[16px] font-medium text-black outline-none placeholder:font-medium placeholder:text-gray-600"
            />

            <button type="button" aria-label="전송" className="flex h-9 w-9 items-center justify-center p-0">
              <img src={SendIcon} alt="" className="block h-6 w-6" />
            </button>
          </div>
        </footer>

        {isSidebarOpen && (
          <button
            type="button"
            aria-label="오버레이 닫기"
            onClick={() => {
              setDeleteTargetId(null);
              setIsSidebarOpen(false);
            }}
            className="absolute inset-0 z-10 bg-[rgba(61,43,39,0.8)]"
          />
        )}

        <aside
          ref={sidebarRef}
          onMouseDown={handleSidebarMouseDown}
          className={[
            'absolute right-0 top-0 z-20 h-full w-4/5 max-w-[320px] bg-white p-4',
            'transition-transform duration-200 ease-out',
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}>
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
                  setIsSidebarOpen(false);
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
    </div>
  );
}
