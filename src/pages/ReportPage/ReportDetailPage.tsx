import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import type { ReportDetailProduct, PurchaseDecision } from '@/types/ReportPage/detail';

import LeftArrow from '@/assets/arrow_left(white).svg';
import SampleImage from '@/assets/sample2.svg';
import DonaAI from '@/assets/dona_glass.svg';

type Props = {
  enableMock?: boolean;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function ReportDetailPage({ enableMock = true }: Props) {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const purchaseId: string = params.get('purchaseId') ?? '1';

  const products: ReportDetailProduct[] = useMemo(
    () => [
      {
        id: '1',
        title: '캐시미어 로제 더블 숏 코트[BLACK]',
        priceWon: 238_400,
        daysAfterSaved: 7,
        memo: '스트레스 받을 땐 새 옷이 최고야. 나를 위한 위시!!',
        memoLimit: 30,
        storeName: '무신사',
        storeSubText: '사이트로 이동',
        imageUrl: SampleImage,
      },
    ],
    [],
  );

  const product = products.find((p) => p.id === purchaseId) ?? products[0];

  const [decision, setDecision] = useState<PurchaseDecision | null>(null);
  const [memo, setMemo] = useState<string>(product.memo);

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState<boolean>(false);

  const memoCountText = `${memo.length} / ${product.memoLimit}`;

  const onClickBack = () => navigate(-1);

  const onClickDecision = (next: PurchaseDecision) => {
    if (next === 'CONFIRM') {
      setIsPurchaseModalOpen(true);
      return;
    }

    setDecision('CANCEL');
    console.log('purchase decision:', 'CANCEL', { purchaseId: product.id });
  };

  const closePurchaseModal = () => {
    setIsPurchaseModalOpen(false);
  };

  const confirmPurchased = () => {
    setIsPurchaseModalOpen(false);

    setDecision('CONFIRM');
    console.log('purchase decision:', 'CONFIRM', { purchaseId: product.id });
  };

  const onClickStore = () => {
    console.log('go to store');
  };

  useEffect(() => {
    if (!isPurchaseModalOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePurchaseModal();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isPurchaseModalOpen]);

  return (
    <div className="w-full min-h-screen bg-white text-black">
      <main className="w-full bg-secondary-100 flex flex-col gap-3">
        <section className="bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]">
          <section className="relative w-full overflow-hidden bg-white">
            <header className="absolute top-0 left-0 right-0 h-[64px] pt-3 px-3 grid grid-cols-[40px_1fr_40px] items-center z-10 text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]">
              <button
                type="button"
                aria-label="뒤로가기"
                onClick={onClickBack}
                className="w-10 h-10 border-0 bg-transparent p-0 flex items-center justify-center cursor-pointer">
                <img src={LeftArrow} alt="뒤로가기" className="block" />
              </button>

              <div aria-hidden className="w-10 h-10" />
            </header>

            <img
              src={enableMock ? product.imageUrl : product.imageUrl}
              alt="상품 이미지"
              loading="lazy"
              className="w-full h-full object-cover block"
            />

            <div className="absolute left-4 right-4 bottom-[14px] flex items-center justify-end gap-3">
              <button
                type="button"
                className="px-[14px] py-[6px] rounded-full bg-white text-primary-500 text-[12px] font-normal cursor-pointer">
                정보 수정
              </button>
            </div>
          </section>

          <section className="px-[18px] py-[14px]">
            <div className="flex items-center mb-[6px]">
              <span className="text-[12px] font-normal text-gray-600">담은 지 +{product.daysAfterSaved}일</span>
            </div>

            <h2 className="text-[18px] font-semibold text-[rgba(0,0,0,0.85)]">{product.title}</h2>

            <div className="flex items-baseline gap-[6px] mb-[14px]">
              <span className="text-[20px] font-semibold text-black">{formatWon(product.priceWon)}</span>
              <span className="text-[14px] font-normal text-black">원</span>
            </div>

            <div className={cn('flex justify-center', decision ? 'gap-0' : 'gap-[30px]')}>
              {decision === null ? (
                <>
                  <button
                    type="button"
                    onClick={() => onClickDecision('CONFIRM')}
                    className="h-9 w-[144px] rounded-full border-[1.5px] border-primary-brown-200 bg-white text-[16px] font-medium text-primary-brown-200 cursor-pointer">
                    구매 결정
                  </button>

                  <button
                    type="button"
                    onClick={() => onClickDecision('CANCEL')}
                    className="h-9 w-[144px] rounded-full border-[1.5px] border-primary-brown-200 bg-white text-[16px] font-medium text-primary-brown-200 cursor-pointer">
                    구매 포기
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => console.log('already decided:', decision)}
                  className="h-9 w-[144px] rounded-full border-0 bg-primary-brown-200 text-white text-[16px] font-medium cursor-pointer active:translate-y-[1px]">
                  {decision === 'CONFIRM' ? '구매 결정' : '구매 포기'}
                </button>
              )}
            </div>
          </section>
        </section>

        <section className="bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]">
          <section className="p-[18px]">
            <div className="relative rounded-[6px] border-[1.5px] border-primary-400 bg-white p-[14px]">
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value.slice(0, product.memoLimit))}
                placeholder="메모를 입력해 주세요"
                aria-label="메모 입력"
                className="w-full min-h-[44px] border-0 outline-none resize-none text-[16px] font-normal text-black placeholder:text-gray-600 placeholder:font-semibold"
              />
              <div
                aria-label="메모 글자수"
                className="absolute right-3 bottom-[10px] text-[14px] font-normal text-gray-600">
                {memoCountText}
              </div>
            </div>
          </section>

          <section className="px-[18px] py-4">
            <button
              type="button"
              onClick={onClickStore}
              className="w-full h-[74px] rounded-full cursor-pointer bg-secondary-100 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] flex items-center justify-between px-[18px]">
              <div className="flex items-center gap-3">
                <div aria-hidden className="w-[38px] h-[38px] rounded-full bg-gray-300" />

                <div className="flex flex-col gap-1 items-start">
                  <div className="text-[14px] font-normal text-black">{product.storeName}</div>
                  <div className="text-[12px] font-normal text-black">{product.storeSubText}</div>
                </div>
              </div>

              <span aria-hidden className="text-[26px] font-black text-black">
                ›
              </span>
            </button>
          </section>

          <section className="px-[18px] py-4">
            <div
              className={[
                'w-full rounded-[16px]',
                'bg-primary-200',
                'px-[18px] pt-[18px] pb-[18px]',
                'flex items-end justify-between',
              ].join(' ')}>
              <div className="flex flex-col items-start gap-3">
                <div className="text-[12px] font-[400] text-primary-500">내게 필요한 소비일까?</div>
                <h3 className="m-0 font-['Galmuri11',sans-serif] text-[16px] font-[700] leading-[1.5] text-black">
                  구매가 고민될 때,
                  <br />
                  도나AI와 상담은 어때요?
                </h3>
              </div>

              <img
                src={DonaAI}
                alt="도나 AI"
                className="w-[71px] h-[67px] object-contain shrink-0"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </section>
        </section>
      </main>

      {isPurchaseModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="구매 상태 확인"
          onClick={closePurchaseModal}
          className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 mx-auto w-full max-w-[375px] bg-[rgba(61,43,39,0.8)]" />

          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-[335px] bg-white rounded-[20px] px-5 pt-10 pb-8">
            <div className="text-center text-[20px] font-semibold mb-2">상품을 구매하셨나요?</div>

            <p className="text-center text-[14px] font-[400] text-gray-500 leading-[1.5] mb-6">
              구매 결정 당시 상황에 대해 알아보고,
              <br />
              상품은 구매한 아이템으로 들어가게 돼요.
            </p>

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={closePurchaseModal}
                className="h-11 w-[128px] rounded-[100px] border-[1.5px] border-primary-brown-300 bg-white text-[16px] font-[500] text-primary-brown-300">
                취소
              </button>

              <button
                type="button"
                onClick={confirmPurchased}
                className="h-11 w-[128px] rounded-[100px] bg-primary-brown-300 text-white text-[16px] font-[500] border-0">
                구매했어요
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatWon(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}
