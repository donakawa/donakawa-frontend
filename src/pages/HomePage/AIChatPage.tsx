import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';

import type { HeaderControlContext } from '@/layouts/ProtectedLayout';

import HamBar from '@/assets/ham_icon.svg';
import PlusIcon from '@/assets/view_more(green).svg';
import SendIcon from '@/assets/send_icon.svg';
import SearchIcon from '@/assets/search_icon.svg';
import NewChatIcon from '@/assets/view_more(brown05).svg';

import ProgressiveSurvey, { LoadingBubble } from '@/components/ProgressiveSurvey';

import { formatWon, cx } from '@/utils/HomePage/aichat';
import { useAIChatPage, type PickedWishItem } from '@/pages/HomePage/hooks/useAIChat';

export default function AIChatPage() {
  const { setTitle, setRightAction, setLayoutModal } = useOutletContext<HeaderControlContext>();
  const navigate = useNavigate();
  const location = useLocation();

  const page = useAIChatPage({ location, navigate });

  // 모바일 롱프레스
  const longPressTimerRef = useRef<number | null>(null);
  const longPressFiredRef = useRef(false);

  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const startLongPress = (start: () => void) => {
    clearLongPress();
    longPressFiredRef.current = false;

    longPressTimerRef.current = window.setTimeout(() => {
      longPressFiredRef.current = true;
      start();
    }, 520);
  };

  useEffect(() => {
    return () => {
      clearLongPress();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTitle('도나AI 상담실');

    setRightAction({
      rightNode: <img src={HamBar} alt="" className="block h-6 w-6" />,
      ariaLabel: '기록 보기',
      onClick: page.toggleSidebar,
    });

    return () => {
      setTitle('');
      setRightAction(null);
      setLayoutModal(null);
    };
  }, [setTitle, setRightAction, setLayoutModal, page.toggleSidebar]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;

      if (page.isDeleteModalOpen) {
        page.closeDeleteModal();
        return;
      }
      if (page.isSidebarOpen) page.closeSidebar();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [page.isSidebarOpen, page.isDeleteModalOpen, page.closeSidebar, page.closeDeleteModal]);

  function SidebarModal() {
    const [searchDraft, setSearchDraft] = useState<string>('');

    useEffect(() => {
      setSearchDraft(page.search ?? '');
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredHistory = useMemo(() => {
      const q = searchDraft.trim().toLowerCase();
      if (!q) return page.chatHistory;
      return page.chatHistory.filter((item) => (item.title ?? '').toLowerCase().includes(q));
    }, [searchDraft, page.chatHistory]);

    return (
      <div className="absolute inset-0">
        {/* overlay */}
        <button type="button" aria-label="사이드바 닫기" onClick={page.closeSidebar} className="absolute inset-0 z-0" />

        <aside
          onMouseDown={page.handleSidebarMouseDown}
          className="absolute right-0 top-0 z-10 h-full w-4/5 max-w-[320px] bg-white p-4">
          <div className="flex h-full flex-col">
            <div className="my-4">
              <div className="box-border flex h-[41px] w-full items-center gap-[5px] rounded-[100px] bg-secondary-100 px-[18px] shadow-[0px_0px_4px_rgba(0,0,0,0.25)]">
                <div className="flex h-7 w-7 flex-[0_0_28px] items-center justify-center" aria-hidden="true">
                  <img src={SearchIcon} alt="" />
                </div>

                <input
                  placeholder="검색..."
                  value={searchDraft}
                  lang="ko"
                  inputMode="text"
                  onChange={(e) => setSearchDraft(e.target.value)}
                  aria-label="채팅 검색"
                  className="h-full min-w-0 flex-1 border-0 bg-transparent text-[16px] font-medium text-black outline-none placeholder:font-semibold placeholder:text-gray-600"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={page.onNewChat}
              className="my-5 flex w-full cursor-pointer items-center gap-[14px] bg-transparent px-2 py-0 text-[26px] font-bold text-primary-brown-500">
              <span className="flex h-[15px] w-[15px] items-center justify-center" aria-hidden="true">
                <img src={NewChatIcon} alt="" />
              </span>
              <span className="text-[16px] font-medium text-primary-brown-500">새 채팅</span>
            </button>

            <div className="py-[10px] text-[12px] text-gray-600">채팅 기록</div>

            <div
              ref={page.chatListScrollRef}
              className={cx(
                'relative min-h-0 flex-1 overflow-y-auto overflow-x-visible',
                '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]',
                '-mx-4',
              )}>
              {page.deleteTargetId !== null && (
                <div ref={page.deletePopoverRef} className="absolute right-4 z-30" style={{ top: page.deleteTop }}>
                  <button
                    type="button"
                    onClick={page.openDeleteModal}
                    className="h-10 w-[60px] cursor-pointer rounded-[10px] border-[1.5px] border-error bg-white text-[16px] font-medium text-error">
                    삭제
                  </button>
                </div>
              )}

              <div className="flex w-full flex-col">
                {page.isChatHistoryLoading && page.chatHistory.length === 0 ? (
                  <div className="px-4 py-3 text-[12px] text-gray-500">불러오는 중...</div>
                ) : (
                  filteredHistory.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (longPressFiredRef.current) return;
                        void page.openChatRoom(item.id);
                      }}
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        page.openDeletePopoverFromElement(item.id, e.currentTarget);
                      }}
                      onPointerDown={(e) => {
                        if (e.pointerType === 'mouse') return;
                        if (e.isPrimary === false) return;

                        try {
                          e.currentTarget.setPointerCapture(e.pointerId);
                        } catch {}

                        startLongPress(() => {
                          page.openDeletePopoverFromElement(item.id, e.currentTarget);
                        });
                      }}
                      onPointerUp={(e) => {
                        try {
                          e.currentTarget.releasePointerCapture(e.pointerId);
                        } catch {}

                        if (longPressFiredRef.current) longPressFiredRef.current = false;
                        clearLongPress();
                      }}
                      onPointerCancel={(e) => {
                        try {
                          e.currentTarget.releasePointerCapture(e.pointerId);
                        } catch {
                          // ignore
                        }
                        longPressFiredRef.current = false;
                        clearLongPress();
                      }}
                      className={cx(
                        'block w-full cursor-pointer border-0 text-left text-[16px] font-normal',
                        'py-3 px-4',
                        'select-none',
                        item.id === page.activeHistoryId ? 'bg-primary-200' : 'bg-transparent',
                      )}>
                      {item.title}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>

        {page.isDeleteModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="채팅 삭제 확인"
            onClick={page.closeDeleteModal}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(61,43,39,0.8)] px-5">
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex h-[234px] w-full max-w-[335px] flex-col justify-end gap-[10px] rounded-[20px] bg-white py-[33px]">
              <h2 className="m-0 text-center text-[20px] font-semibold">이 채팅을 삭제하시겠습니까?</h2>
              <p className="text-center text-[14px] font-normal text-gray-600">삭제 시 되돌릴 수 없습니다.</p>

              <div className="mt-[22px] flex justify-center gap-[50px]">
                <button
                  type="button"
                  onClick={page.closeDeleteModal}
                  className="w-[110px] cursor-pointer rounded-[100px] border-[1.5px] border-primary-brown-300 bg-white py-2 text-[16px] font-medium text-primary-brown-300">
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => void page.confirmDelete()}
                  className="w-[110px] cursor-pointer rounded-[100px] border-[1.5px] border-primary-brown-300 bg-primary-brown-300 py-2 text-[16px] font-medium text-white">
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}

        {page.toast.open && (
          <div className="pointer-events-none absolute bottom-6 left-1/2 z-[60] -translate-x-1/2" aria-live="polite">
            <div
              className={cx(
                'w-[335px] rounded-[100px] border-[1.5px] border-primary-brown-400 bg-white',
                'flex items-center px-[18px] py-[10px]',
                'text-[12px] font-normal text-black',
                'shadow-[0px_0px_4px_rgba(97,69,64,1)]',
              )}>
              {page.toast.kind === 'delete'
                ? '채팅이 삭제되었습니다.'
                : page.toast.kind === 'sendFail'
                  ? '서버 문제로 채팅 생성에 실패했어요.'
                  : '요청에 실패했어요.'}
            </div>
          </div>
        )}
      </div>
    );
  }

  useEffect(() => {
    if (!page.isSidebarOpen) {
      setLayoutModal(null);
      return;
    }

    setLayoutModal(<SidebarModal />);
    return () => setLayoutModal(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.isSidebarOpen, setLayoutModal]);

  const ProductCardBubble = ({ product }: { product: PickedWishItem }) => {
    const hasImage = Boolean(product.imageUrl && product.imageUrl.trim().length > 0);

    return (
      <div
        className={cx(
          'w-[109px] overflow-hidden rounded-[10px] bg-white',
          'shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]',
        )}>
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

  const UserTextBubble = ({ text }: { text: string }) => (
    <div className="max-w-[80%] rounded-[10px] bg-primary-brown-200 px-4 py-2 text-[14px] font-normal text-white">
      {text}
    </div>
  );

  const SelectedProductPreview = ({ product, onRemove }: { product: PickedWishItem; onRemove: () => void }) => (
    <div className="relative w-[109px]">
      <button
        type="button"
        aria-label="선택한 상품 제거"
        onClick={onRemove}
        className={cx(
          'absolute right-[-12px] top-[-12px] z-20',
          'h-[21px] w-[21px] rounded-full',
          'bg-primary-600 flex items-center justify-center',
          'shadow-[0px_2px_6px_rgba(0,0,0,0.25)]',
        )}>
        <span className="relative block h-[14px] w-[14px]">
          <span className="absolute left-1/2 top-1/2 h-[2px] w-[14px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-white" />
          <span className="absolute left-1/2 top-1/2 h-[2px] w-[14px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-white" />
        </span>
      </button>

      <div className={cx('overflow-hidden rounded-[10px] bg-white', 'shadow-[0px_0px_6px_rgba(0,0,0,0.18)]')}>
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

  return (
    <div className="relative h-[calc(100dvh-56px)] w-full bg-white">
      <div className="flex h-full flex-col">
        <main className="flex-1 overflow-y-auto p-4">
          {page.messages.map((msg) => {
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

          <div ref={page.bottomRef} />
        </main>

        <footer className="flex justify-center pb-4">
          <div
            className={cx(
              'w-[335px] bg-white shadow-[0px_0px_4px_rgba(0,0,0,0.25)] flex flex-col',
              page.pickedWishItem
                ? 'rounded-[24px] px-[14px] pb-[10px] pt-[14px] gap-[12px]'
                : 'h-[41px] rounded-[100px] px-[14px] justify-center',
            )}>
            {page.pickedWishItem && (
              <div className="pt-1">
                <SelectedProductPreview product={page.pickedWishItem} onRemove={page.clearPickedWishItem} />
              </div>
            )}

            <div className="flex items-center gap-[10px]">
              <button
                type="button"
                aria-label="상품 추가"
                onClick={page.goToItemSelection}
                className="flex h-9 w-9 items-center justify-center p-0">
                <img src={PlusIcon} alt="" className="block h-6 w-6" />
              </button>

              <div className="flex-1 text-[16px] font-medium text-gray-600">상품을 추가해보세요.</div>

              <button
                type="button"
                aria-label="전송"
                onClick={() => void page.sendPickedWishItem()}
                disabled={!page.pickedWishItem}
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
