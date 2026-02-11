import { useCallback, useEffect, useRef, useState } from 'react';
import type { Location, NavigateFunction } from 'react-router-dom';

import {
  createChat,
  deleteChatRoom,
  getChatRoomDetail,
  getChatRooms,
  type ChatItemType,
  type ChatRoomListItem,
} from '@/apis/AIChatPage/aichat';

const DELETE_BUTTON_H = 40;

export type PickedWishItem = {
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

export type ChatMessage =
  | { id: string; role: 'user'; kind: 'product'; product: PickedWishItem }
  | { id: string; role: 'user'; kind: 'text'; text: string }
  | { id: string; role: 'assistant'; kind: 'typing' }
  | { id: string; role: 'assistant'; kind: 'survey'; chatId: number };

type ToastKind = 'delete' | 'sendFail';

export function useAIChatPage(args: { location: Location; navigate: NavigateFunction }) {
  const { location, navigate } = args;

  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pickedWishItem, setPickedWishItem] = useState<PickedWishItem | null>(null);

  const [chatHistory, setChatHistory] = useState<ChatRoomListItem[]>([]);
  const [isChatHistoryLoading, setIsChatHistoryLoading] = useState<boolean>(false);
  const [activeHistoryId, setActiveHistoryId] = useState<number | null>(null);

  const [search, setSearch] = useState<string>('');

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteTop, setDeleteTop] = useState<number>(0);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const [toast, setToast] = useState<{ open: boolean; kind: ToastKind | null }>({ open: false, kind: null });
  const toastTimerRef = useRef<number | null>(null);

  const sidebarRef = useRef<HTMLElement | null>(null);
  const deletePopoverRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const fireToast = useCallback((kind: ToastKind) => {
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }

    setToast({ open: true, kind });

    toastTimerRef.current = window.setTimeout(() => {
      setToast({ open: false, kind: null });
      toastTimerRef.current = null;
    }, 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
        toastTimerRef.current = null;
      }
    };
  }, []);

  const fetchChatRooms = useCallback(async (): Promise<void> => {
    setIsChatHistoryLoading(true);
    try {
      const rooms = await getChatRooms();
      setChatHistory(rooms);

      if (rooms.length > 0 && activeHistoryId === null) {
        setActiveHistoryId(rooms[0].id);
      }
    } catch {
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

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

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
          imageUrl: '',
          type: 'MANUAL',
        };

        const restored: ChatMessage[] = [
          { id: `restore-product-${chatId}`, role: 'user', kind: 'product', product: restoredProduct },
        ];

        const sortedAnswers = [...(detail.answers ?? [])].sort((a, b) => a.step - b.step);
        for (const ans of sortedAnswers) {
          restored.push({
            id: `restore-answer-${chatId}-${ans.step}`,
            role: 'user',
            kind: 'text',
            text: ans.selectedOption,
          });
        }

        restored.push({ id: `restore-survey-${chatId}`, role: 'assistant', kind: 'survey', chatId });
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

  const goToItemSelection = useCallback(() => {
    const from = location.pathname + location.search;
    navigate('/home/items/select', { state: { from } });
  }, [navigate, location.pathname, location.search]);

  const clearPickedWishItem = useCallback((): void => {
    setPickedWishItem(null);
  }, []);

  const sendPickedWishItem = useCallback(async (): Promise<void> => {
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
        return [{ id: chat.id, title: sendingItem.name, createdAt: new Date().toISOString() }, ...prev];
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
      fireToast('sendFail');
    }
  }, [pickedWishItem, fetchChatRooms, fireToast]);

  return {
    sidebarRef,
    deletePopoverRef,
    bottomRef,

    isSidebarOpen,
    search,
    setSearch,

    messages,
    pickedWishItem,

    chatHistory,
    isChatHistoryLoading,
    activeHistoryId,

    deleteTargetId,
    deleteTop,
    isDeleteModalOpen,

    toast,

    toggleSidebar,
    closeSidebar,
    onNewChat,

    openChatRoom,
    handleHistoryContextMenu,
    handleSidebarMouseDown,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,

    goToItemSelection,
    clearPickedWishItem,
    sendPickedWishItem,
  };
}
