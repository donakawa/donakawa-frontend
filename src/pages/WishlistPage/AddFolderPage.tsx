import { useState } from 'react';

interface Props {
  onBack: () => void;
  onComplete: (folderName: string) => void;
}

export default function AddFolderPage({ onBack, onComplete }: Props) {
  const [folderName, setFolderName] = useState('');

  const handleAddFolder = () => {
    if (!folderName.trim()) return;
    onComplete(folderName);
  };

  return (
    <div className="absolute inset-0 z-[100] bg-white flex flex-col">
      {/* 헤더 부분 */}
      <header className="flex items-center justify-between px-5 h-[56px] shrink-0">
        <button onClick={onBack} className="p-2 -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-[18px] font-bold text-black">폴더 추가</h1>
        <div className="w-[44px]" />
      </header>

      <main className="px-5 pt-12 flex-1 flex flex-col items-center">
        <div className="w-full relative">
          <input
            type="text"
            value={folderName}
            // 8자 제한
            onChange={(e) => setFolderName(e.target.value.slice(0, 8))}
            placeholder="폴더명을 입력해 주세요."
            className={`w-full h-[52px] px-4 rounded-[8px] border outline-none transition-all ${
              folderName.length > 0 ? 'border-[color:var(--color-primary-500)]' : 'border-[color:var(--color-gray-300)]'
            } placeholder:text-[color:var(--color-gray-300)]`}
          />
          
          {/* 글자 수 표시 및 체크 아이콘 */}
          <div className="flex items-center justify-end mt-2 gap-1 text-[14px]">
            {folderName.length > 0 && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-1">
                <path d="M20 6L9 17L4 12" stroke="#111111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            <span className="font-medium text-black">{folderName.length}</span>
            <span className="text-[color:var(--color-gray-300)]">/8</span>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="mt-[60px] w-full flex justify-center">
          <button
            onClick={handleAddFolder}
            disabled={!folderName.trim()}
            className={`w-[335px] h-[52px] rounded-[12px] text-[16px] font-bold transition-colors ${
              folderName.trim() ? 'bg-[color:var(--color-primary-500)] text-white' : 'bg-[color:var(--color-gray-300)] text-white'
            }`}
          >
            폴더 추가하기
          </button>
        </div>
      </main>
    </div>
  );
}