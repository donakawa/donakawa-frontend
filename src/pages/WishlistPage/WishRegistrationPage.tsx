import { useState, useMemo, useRef } from 'react';
import RegistrationInput from './components/RegistrationInput';
import DefaultLogo from '@/assets/default_logo.svg?react';
import EditPhotoIcon from '@/assets/edit_photo.svg?react';
import BackIcon from '@/assets/back.svg?react';
import ReasonModal from './components/modals/ReasonModal';
import { useCreateWishlistItem } from '@/queries/WishlistPage/useCreateWishlistItem';
import { 
  createWishlistItemFromCache, 
  updateWishlistItemReason, 
  updateManualWishlistItem 
} from '@/apis/WishlistPage/wishlistItems';
import { useQueryClient } from '@tanstack/react-query';
import DefaultPhoto from '@/assets/default_photo.svg';

interface Props {
  onBack: () => void;
  onComplete: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
  itemId?: string;
  itemType?: 'AUTO' | 'MANUAL';
}

export default function WishRegistrationPage({ 
  onBack, 
  onComplete, 
  initialData, 
  isEdit, 
  itemId, 
  itemType 
}: Props) {
  const [image, setImage] = useState<string | null>(
    initialData?.image || initialData?.imageUrl || DefaultPhoto 
  );
  const [store, setStore] = useState(initialData?.store || initialData?.platformName || '');
  const [name, setName] = useState(initialData?.name || initialData?.productName || '');
  const [price, setPrice] = useState(initialData?.price ? String(initialData.price) : '');
  const [brand, setBrand] = useState(initialData?.brand || initialData?.brandName || '');
  const [reason, setReason] = useState(initialData?.reason || '');
  const [url, setUrl] = useState(initialData?.url || initialData?.productUrl || '');

  const [showReasonModal, setShowReasonModal] = useState(!!initialData && !isEdit);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rawFile, setRawFile] = useState<File | null>(null); 
  
  const queryClient = useQueryClient();
  const { mutateAsync: registerItem } = useCreateWishlistItem();
  
  const isAutoMode = !!(initialData as any)?.cacheId || (isEdit && itemType === 'AUTO');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRawFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const isComplete = useMemo(() => {
    return name && price && brand && reason && store && url;
  }, [name, price, brand, reason, store, url]);

  const toNumericPrice = (value: string) => {
    const numeric = Number(value.replace(/[^0-9]/g, ""));
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const handleSave = async () => {
    try {
      // EDIT MODE
      if (isEdit && itemId && itemType) {
        if (itemType === "AUTO") {
          // AUTO는 reason만 수정
          await updateWishlistItemReason(itemId, { reason, type: "AUTO" });
        } else {
          const numericPrice = toNumericPrice(price);

          await updateManualWishlistItem(itemId, {
            productName: name,
            price: numericPrice,
            storeName: store,
            brandName: brand,
            url,
            file: rawFile || undefined,
          });

          await updateWishlistItemReason(itemId, { reason, type: "MANUAL" });
        }
      }
      // CREATE MODE
      else {
        if ((initialData as any)?.cacheId) {
          await createWishlistItemFromCache((initialData as any).cacheId, reason);
        } else {
          const numericPrice = toNumericPrice(price);
          await registerItem({
            productName: name,
            price: numericPrice,
            storeName: store,
            brandName: brand,
            reason,
            file: rawFile || undefined,
            url,
          });
        }
      }

      // 캐시 갱신
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["wishlistItems"] }),
        queryClient.invalidateQueries({ queryKey: ["wishlistFolderItems"] }),
      ]);

      onComplete({ name, reason, isEdit: !!isEdit });
    } catch (error) {
      alert("처리에 실패했습니다.");
    }
  };

  const disabledWrapper = "w-full pointer-events-none select-none opacity-50 grayscale filter brightness-95 contrast-75";

  return (
    <div className="absolute inset-0 z-[100] bg-white flex flex-col">
      <header className="flex items-center justify-between px-5 h-[56px] shrink-0 border-b border-gray-50">
        <button type="button" onClick={onBack} className="p-2 -ml-2"><BackIcon className="w-6 h-6" /></button>
        <h2 className="text-[18px] font-bold text-black">{isEdit ? '위시템 수정' : '위시템 등록'}</h2>
        <button
          onClick={handleSave}
          disabled={!isComplete}
          className={`text-[16px] font-medium transition-colors ${isComplete ? 'text-primary-500' : 'text-gray-300'}`}
        >
          저장
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center pt-4 pb-10 px-5 overflow-y-auto no-scrollbar">
        <div className="relative w-[160px] h-[160px] rounded-[10px] bg-gray-100 overflow-hidden shrink-0 mb-5">
          {image && <img src={image || DefaultPhoto} alt="preview" className="w-full h-full object-cover" />}
          {!isAutoMode && (
            <>
              <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*"/>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute right-3 bottom-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border-0">
                <EditPhotoIcon className="w-5 h-5 text-primary-500" />
              </button>
            </>
          )}
        </div>

        <div className={`w-[242px] mb-8 shrink-0 ${isAutoMode ? "opacity-30 pointer-events-none grayscale" : ""}`}>
          <div className="flex items-center gap-4 h-[34px] mb-2">
            <div className="w-[34px] h-[34px] bg-gray-300 rounded-full shrink-0 flex items-center justify-center overflow-hidden"><DefaultLogo className="w-full h-full" /></div>
            <input value={store} onChange={(e) => setStore(e.target.value)} readOnly={isAutoMode} className="flex-1 bg-transparent outline-none text-[16px] text-black" placeholder="저장할 스토어" />
          </div>
          <div className={`w-full border-b-2 ${isAutoMode ? 'border-gray-200' : (store ? 'border-primary-500' : 'border-gray-600')}`} />
        </div>

        <div className="w-full flex flex-col items-center gap-5">
          <div className={isAutoMode ? disabledWrapper : "w-full"}>
            <RegistrationInput value={name} onChange={setName} placeholder="상품명" />
          </div>
          <div className={isAutoMode ? disabledWrapper : "w-full"}>
            <RegistrationInput value={url} onChange={setUrl} placeholder="상품 URL" />
          </div>
          <div className={isAutoMode ? disabledWrapper : "w-full"}>
            <RegistrationInput value={String(price)} onChange={setPrice} placeholder="가격" />
          </div>
          <div className={isAutoMode ? disabledWrapper : "w-full"}>
            <RegistrationInput value={brand} onChange={setBrand} placeholder="브랜드" />
          </div>
          <RegistrationInput value={reason} onChange={setReason} placeholder="위시로 담은 이유" maxLength={30} multiline={true} />
        </div>
      </main>

      <ReasonModal open={showReasonModal} onClose={() => setShowReasonModal(false)} />
    </div>
  );
}