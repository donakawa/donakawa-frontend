import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PurchaseReasonModal from './components/PurchaseReasonModal';
import SuccessModal from './components/SuccessContent';
import ConfirmDeleteModal from './components/modals/ConfirmDeleteModal';
import { getWishlistItemDetail, buyWishlistItem, dropWishlistItem } from '@/apis/WishlistPage/wishlistItems';
import WishRegistrationPage from './WishRegistrationPage';
import DefaultPhotoBig from '@/assets/default_item_photo_big.svg';
import DefaultPhoto from '@/assets/default_item_photo.svg';

export default function WishItemDetailPage() {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') as 'AUTO' | 'MANUAL';

  const [item, setItem] = useState<any>(null);
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (itemId && type) {
      getWishlistItemDetail(itemId, type).then((res) => {
        if (res.resultType === 'SUCCESS') setItem(res.data);
      });
    }
  }, [itemId, type]);

  const daysAfterSaved = useMemo(() => {
    if (!item?.addedAt) return 0;
    const addedDate = new Date(item.addedAt);
    const today = new Date();
    addedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(today.getTime() - addedDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }, [item?.addedAt]);

  if(!item) return null;

if (isEditing) {
    return (
      <WishRegistrationPage
        isEdit={true}
        itemId={itemId}
        itemType={type}
        initialData={{
          name: item.name,
          price: item.price,
          store: item.platform,
          brand: item.brand,
          reason: item.reason,
          url: item.productUrl,
          image: item.photoUrl
        }}
        onBack={() => setIsEditing(false)}
        onComplete={() => {
          setIsEditing(false);
          window.location.reload(); 
        }}
      />
    );
  }
  
  const onClickBack = () => navigate(-1);

  const handleConfirmDecision = () => setIsReasonOpen(true);

  const handleCancelDecision = () => {
    setIsDropModalOpen(true);
  };

  const confirmDropItem = async () => {
    try {
      if (!itemId || !type) return;
      await dropWishlistItem(itemId, type); 
      
      setIsDropModalOpen(false);
      navigate('/wishlist');
    } catch (error: any) {
      console.error("구매 포기 실패:", error);
      alert(error.response?.data?.error?.message || "구매 포기 처리 중 오류가 발생했습니다.");
    }
  };

  //구매 결정(기록 완료) 핸들러
  const handleRecordComplete = async (modalData: any) => {
    try {
      if (!itemId || !type) return;
      const payload = {
        type: type,
        date: modalData.date,
        purchasedAt: modalData.purchasedAt, 
        reasonId: modalData.reasonId,
        reason: modalData.reason
      };
      await buyWishlistItem(itemId, payload);
      setIsReasonOpen(false);
      setIsSuccessOpen(true);
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "구매 결정 중 오류가 발생했습니다.");
    }
  };

  const handleFinalComplete = () => {
    setIsSuccessOpen(false);
    navigate('/report/review'); //구매 상세페이지로 수정
  };

  if (!item) return null;

  return (
    <div className="w-full min-h-screen bg-white text-[#111]">
      <main className="w-full bg-[rgba(255,255,230,1)] flex flex-col gap-3 min-h-screen">
        <section className="bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]">
          <section className="relative w-full aspect-square overflow-hidden bg-[#eee]">
            <header className="absolute top-0 left-0 right-0 h-[64px] pt-3 px-3 z-10">
              <button type="button" onClick={onClickBack} className="w-8 h-8 border-0 bg-transparent cursor-pointer text-[26px] leading-none text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]">‹</button>
            </header>
            <img src={item?.photoUrl || DefaultPhotoBig} alt={item.name} className="w-full h-full object-cover" />
            <div className="absolute left-4 right-4 bottom-[14px] flex items-center justify-end gap-3">
              <button type="button" onClick={() => setIsEditing(true)} className="px-[14px] py-[6px] rounded-full bg-white text-[rgba(104,171,110,1)] text-[12px] font-normal cursor-pointer shadow-sm border-0">정보 수정</button>
            </div>
          </section>

          <section className="px-[18px] py-[14px]">
            <div className="flex items-center mb-[6px]">
              <span className="text-[12px] leading-[150%] font-normal text-[#999999]">담은 지 +{daysAfterSaved}일</span>
            </div>
            <h2 className="text-[18px] font-semibold text-[rgba(0,0,0,0.85)] mb-1 leading-tight">{item.name}</h2>
            <div className="flex items-baseline gap-[6px] mb-[14px]">
              <span className="text-[20px] font-semibold text-[rgba(0,0,0,0.9)]">{item.price.toLocaleString()}</span>
              <span className="text-[14px] font-normal text-[rgba(0,0,0,0.6)]">원</span>
            </div>

            <div className="flex justify-center gap-[30px] pt-4 border-t border-gray-100">
              <button type="button" onClick={handleConfirmDecision} className="h-9 w-[144px] rounded-full border-[1.5px] border-[rgba(164,121,113,1)] bg-white text-[16px] font-medium text-[rgba(164,121,113,1)] cursor-pointer active:translate-y-[1px]">구매 결정</button>
              <button type="button" onClick={handleCancelDecision} className="h-9 w-[144px] rounded-full border-[1.5px] border-[rgba(164,121,113,1)] bg-white text-[16px] font-medium text-[rgba(164,121,113,1)] cursor-pointer active:translate-y-[1px]">구매 포기</button>
            </div>
          </section>
        </section>

        <section className="bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] flex-1">
          <section className="p-[18px]">
            <div className="text-[12px] text-gray-400 mb-2 px-1 font-medium">내가 담았던 이유</div>
            <div className="relative rounded-[6px] border-[1.5px] border-[rgba(143,188,147,1)] shadow-[0px_0px_4px_0px_rgba(104,171,110,1)] bg-white p-[14px] min-h-[80px]">
              <p className="text-[16px] font-normal text-[rgba(0,0,0,0.82)] leading-[150%]">{item.reason || "입력된 이유가 없습니다."}</p>
            </div>
          </section>

          <section className="px-[18px] py-4">
            <button type="button" onClick={() => window.open(item.productUrl, '_blank')} className="w-full h-[74px] rounded-full cursor-pointer bg-[rgba(255,255,230,1)] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] flex items-center justify-between px-[18px] border-0">
              <div className="flex items-center gap-3">
                <div aria-hidden className="w-[38px] h-[38px] rounded-full bg-[rgba(0,0,0,0.12)]" />
                <div className="flex flex-col gap-1 items-start text-left">
                  <div className="text-[14px] font-normal text-[rgba(0,0,0,0.85)]">{item.platform}</div>
                  <div className="text-[12px] font-normal text-[rgba(0,0,0,0.35)]">사이트로 이동</div>
                </div>
              </div>
              <span className="text-[26px] font-black text-[rgba(0,0,0,0.5)]">›</span>
            </button>
          </section>

          <section className="px-[18px] py-4 pb-10">
            <div className="w-full rounded-[16px] bg-[#cfe0c6] text-[rgba(47,77,52,0.95)] px-[18px] pt-[18px] pb-[22px] flex flex-col items-start gap-4 text-left">
              <div className="text-[12px] font-normal text-[rgba(104,171,110,1)]">내게 필요한 소비일까?</div>
              <h3 className="m-0 font-['Galmuri11',sans-serif] text-[24px] font-bold leading-none text-[rgba(0,0,0,0.9)]">도나AI</h3>
            </div>
          </section>
        </section>
      </main>

      <PurchaseReasonModal 
        isOpen={isReasonOpen} 
        onClose={() => setIsReasonOpen(false)} 
        onComplete={handleRecordComplete} 
        itemType={type}
      />
      <SuccessModal isOpen={isSuccessOpen} onClose={handleFinalComplete} productImage={item.photoUrl || DefaultPhoto} productName={item.name} price={item.price.toLocaleString()} />
      
      <ConfirmDeleteModal 
        open={isDropModalOpen}
        title="구매를 포기하시겠어요?"
        description="포기한 아이템은 위시리스트에서 삭제됩니다."
        onCancel={() => setIsDropModalOpen(false)}
        onConfirm={confirmDropItem}
      />
    </div>
  );
}