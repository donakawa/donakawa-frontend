export type PurchaseDecision = 'CONFIRM' | 'CANCEL';

export type ReportDetailProduct = {
  id: string;
  title: string;
  priceWon: number;
  daysAfterSaved: number;
  memo: string;
  memoLimit: number;
  storeName: string;
  storeSubText: string;
  imageUrl: string;
  // 필요시 추가
  // storeUrl?: string;
};
