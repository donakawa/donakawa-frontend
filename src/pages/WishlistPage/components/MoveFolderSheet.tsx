import { useEffect } from 'react';

import AddFolder2Icon from '@/assets/add_folder2.svg?react';
import FolderIcon from '@/assets/folder.svg?react';

export type FolderItem = {
  id: string;
  name: string;
};

type Props = {
  open: boolean;
  folders: FolderItem[];
  onClose: () => void;
  onSelectFolder?: (folderId: string) => void;
};

export default function MoveFolderSheet({
  open,
  folders,
  onClose,
  onSelectFolder,
}: Props) {
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
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
        <div
          className={[
            'pointer-events-auto w-full',
            'rounded-t-[18px] bg-white',
            'shadow-[0_-6px_20px_rgba(0,0,0,0.15)]',
            'pb-[max(16px,env(safe-area-inset-bottom))]',
            'h-[66vh]', 
            'flex flex-col',
          ].join(' ')}
        >
          <div className="relative flex items-center justify-center h-14 px-4 shrink-0 border-b border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2 active:scale-[0.98]"
              aria-label="back"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18L9 12L15 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <h2 className="text-[20px] font-semibold text-gray-900">
              폴더 이동
            </h2>
          </div>

          <div className="px-4 pt-4 pb-2 flex-1 overflow-y-auto no-scrollbar">
            <ul className="space-y-1">
              <li>
                <button
                  type="button"
                  className="w-full flex items-center gap-4 rounded-[12px] px-2 py-2 text-left active:scale-[0.99] text-gray-900"
                >
                  <div className="w-[60px] h-[60px] rounded-[10px] bg-[#CFE7C9] flex items-center justify-center shrink-0">
                    <AddFolder2Icon className="w-[34px] h-[34px]" />
                  </div>
                  <span className="text-[14px] font-medium">폴더 추가</span>
                </button>
              </li>

              {folders.map((f) => (
                <li key={f.id}>
                  <button
                    type="button"
                    onClick={() => onSelectFolder?.(f.id)}
                    className="w-full flex items-center gap-4 rounded-[12px] px-2 py-2 text-left active:scale-[0.99] text-gray-900"
                  >
                    <div className="w-[60px] h-[60px] rounded-[10px] overflow-hidden shrink-0 bg-gray-100">
                      <FolderIcon className="w-full h-full pointer-events-none object-cover" />
                    </div>
                    <span className="text-[14px] truncate">{f.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}