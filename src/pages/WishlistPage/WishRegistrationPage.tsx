import { useState, useMemo, useRef } from 'react';
import RegistrationInput from './components/RegistrationInput';
import DefaultLogo from '@/assets/default_logo.svg?react';
import EditPhotoIcon from '@/assets/edit_photo.svg?react';
import BackIcon from '@/assets/back.svg?react';
import type { WishItemData } from './types/WishItemData';
import ReasonModal from './components/modals/ReasonModal';

interface Props {
  onBack: () => void;
  onComplete: (data: WishItemData & { reason: string }) => void;
  initialData?: WishItemData;
}

export default function WishRegistrationPage({ onBack, onComplete, initialData }: Props) {
  const [image, setImage] = useState<string | null>(initialData?.image || null);
  const [store, setStore] = useState(initialData?.store || '');
  const [name, setName] = useState(initialData?.name || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [brand, setBrand] = useState(initialData?.brand || '');
  const [reason, setReason] = useState('');

  // 린트 에러 방지: useEffect 대신 초기값에서 처리
  const [showReasonModal, setShowReasonModal] = useState(!!initialData);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const isComplete = useMemo(() => {
    return name && price && brand && reason;
  }, [name, price, brand, reason]);

  return (
    <div className="absolute inset-0 z-[100] bg-white flex flex-col">
      <header className="flex items-center justify-between px-5 h-[56px] shrink-0">
        <button onClick={onBack} className="p-2 -ml-2">
          <BackIcon className="w-6 h-6" />
        </button>
        <h2 className="text-[18px] font-bold text-black">위시템 등록</h2>
        <button
          onClick={() => onComplete({ name, price, brand, store, image: image || '', reason })}
          disabled={!isComplete}
          className={`text-[16px] font-medium transition-colors ${
            isComplete ? 'text-primary-500' : 'text-gray-300'
          }`}
        >
          저장
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center pt-4 pb-10 px-5 overflow-hidden">
        <div className="relative w-[160px] h-[160px] rounded-[10px] bg-gray-100 overflow-hidden shrink-0 mb-5">
          {image && <img src={image} alt="preview" className="w-full h-full object-cover" />}
          <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*"/>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute right-3 bottom-3 w-[33px] h-[33px] bg-white rounded-full flex items-center justify-center shadow-sm"
          >
            <EditPhotoIcon className="w-[21px] h-[21px] text-primary-500" />
          </button>
        </div>

        <div className="w-[242px] mb-8 shrink-0">
          <div className="flex items-center gap-4 h-[34px] mb-2">
            <div className="w-[34px] h-[34px] bg-gray-300 rounded-full shrink-0 flex items-center justify-center overflow-hidden">
              <DefaultLogo className="w-full h-full" />
            </div>
            <input
              value={store}
              onChange={(e) => setStore(e.target.value)}
              placeholder="저장할 스토어를 입력해주세요."
              className="flex-1 bg-transparent outline-none text-[16px] text-black placeholder:text-gray-600"
            />
          </div>
          <div className={`w-full border-b-2 transition-colors ${store ? 'border-primary-500' : 'border-gray-600'}`} />
        </div>

        <div className="w-full flex flex-col items-center gap-5">
          <RegistrationInput value={name} onChange={setName} placeholder="상품명" />
          <RegistrationInput value={price} onChange={setPrice} placeholder="가격" />
          <RegistrationInput value={brand} onChange={setBrand} placeholder="브랜드" />
          <RegistrationInput
            value={reason}
            onChange={setReason}
            placeholder="위시로 담은 이유"
            maxLength={30}
            multiline={true} 
          />
        </div>
      </main>

      <ReasonModal
        open={showReasonModal} 
        onClose={() => setShowReasonModal(false)} 
      />
    </div>
  );
}