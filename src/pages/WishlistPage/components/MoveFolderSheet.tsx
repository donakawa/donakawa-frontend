import { useEffect } from 'react';
import FolderList from './FolderList';

export type FolderItem = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  folders: FolderItem[];
  onClose: () => void;
  onSelectFolder?: (folderId: string) => void;
  onAddFolderClick?: () => void;
};

export default function MoveFolderSheet({
  open,
  folders,
  onClose,
  onSelectFolder,
  onAddFolderClick,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = originalOverflow; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[999] pointer-events-none overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <button
          type="button"
          className="pointer-events-auto w-full h-full bg-black/30"
          aria-label="close"
          onClick={onClose}
        />
      </div>

      <div className="absolute inset-0 flex justify-center items-end pointer-events-none">
        <div className="pointer-events-auto w-full rounded-t-[18px] bg-white shadow-[0_-6px_20px_rgba(0,0,0,0.15)] pb-[max(16px,env(safe-area-inset-bottom))] h-[66vh] flex flex-col">
          {/* 시트 헤더 */}
          <div className="relative flex items-center justify-center h-14 px-4 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2 active:scale-[0.98]"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <h2 className="text-[20px] font-semibold text-black">폴더 이동</h2>
          </div>

          <div className="px-4 pt-2 pb-2 flex-1 overflow-y-auto no-scrollbar">
            <FolderList
              folders={folders}
              showAddButton={true}
              onAddClick={onAddFolderClick}
              onFolderClick={onSelectFolder}
            />
          </div>
        </div>
      </div>
    </div>
  );
}