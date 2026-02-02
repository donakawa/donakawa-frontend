import { useState } from "react";
import PurchaseReasonModal from "./components/PurchaseReasonModal";
import SuccessModal from "./components/SuccessContent";

export default function WishlistPage() {
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);

  const handleRecordComplete = () => {
    setIsReasonOpen(false); // 이유 모달 닫기
    setIsSuccessOpen(true); // 성공 모달 열기
  };

  return (
    <>
      <button onClick={() => setIsReasonOpen(true)}>기록하기</button>
      
      <PurchaseReasonModal
        isOpen={isReasonOpen} 
        onClose={() => setIsReasonOpen(false)} 
        onComplete={handleRecordComplete} 
      />
      
      <SuccessModal
        isOpen={isSuccessOpen} 
        onClose={() => setIsSuccessOpen(false)} 
      />
    </>
  );
};
