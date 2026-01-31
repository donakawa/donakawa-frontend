import { useState } from 'react';
import RegistrationInput from './components/RegistrationInput';
import LinkLoadingScreen from './LinkLoadingScreen';
import type { WishItemData } from './types/WishItemData';

interface Props {
  onBack: () => void;
  onComplete: (data: WishItemData) => void;
}

export default function LinkRegistrationPage({ onBack, onComplete }: Props) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = () => {
    if (!url) return;
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      onComplete({
        name: '캐시미어 로제 더블 숏 코트[BLACK]',
        price: '238,400 원',
        brand: '슬로우앤드',
        store: '무신사',
        image: 'https://placehold.co/300x300/png' 
      });
    }, 3000);
  };

  if (isLoading) return <LinkLoadingScreen />;

  return (
    <div className="absolute inset-0 z-[100] bg-white flex flex-col">
      <header className="flex items-center justify-between px-5 h-[56px] shrink-0">
        <button onClick={onBack} className="p-2 -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <h1 className="text-[18px] font-bold">위시템 등록</h1>
        <div className="w-[44px]" />
      </header>

      <main className="px-5 pt-12 flex-1 flex flex-col items-center">
        <RegistrationInput value={url} onChange={setUrl} placeholder="URL" />
        <p className="w-full text-right text-[12px] text-[#CECECE] mt-2 px-1">
          무신사, 29CM, 브랜드 공식몰에서 불러오기 가능
        </p>

        <div className="mt-30 w-full">
          <button
            onClick={handleRegister}
            disabled={!url}
            className={`w-[335px] h-[52px] rounded-[12px] text-[16px] font-bold transition-colors ${
              url ? 'bg-[color:var(--color-primary-500)] text-white' : 'bg-[#CECECE] text-white'
            }`}
          >
            등록하기
          </button>
        </div>
      </main>
    </div>
  );
}