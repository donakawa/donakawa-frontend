import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import type { ReportDetailProduct, PurchaseDecision } from '@/types/ReportPage/Detail';

import SampleImage from '@/assets/sample2.svg';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

type Props = {
  enableMock?: boolean;
};

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

  const memoCountText = `${memo.length} / ${product.memoLimit}`;

  const onClickBack = () => navigate(-1);

  const onClickDecision = (next: PurchaseDecision) => {
    setDecision(next);
    console.log('purchase decision:', next, { purchaseId: product.id });
  };

  const onClickStore = () => {
    console.log('go to store');
  };

  return (
    <div className="w-full min-h-screen bg-white text-[#111]">
      <main className="w-full bg-[rgba(255,255,230,1)] flex flex-col gap-3">
        <section className="bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]">
          <section className="relative w-full overflow-hidden bg-[#eee]">
            <header className="absolute top-0 left-0 right-0 h-[64px] pt-3 px-3 grid grid-cols-[40px_1fr_40px] items-center z-10 text-white [text-shadow:0_1px_6px_rgba(0,0,0,0.35)]">
              <button
                type="button"
                onClick={onClickBack}
                aria-label="뒤로가기"
                className="w-8 h-8 border-0 bg-transparent cursor-pointer text-[26px] leading-none text-white">
                ‹
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
                className="px-[14px] py-[6px] rounded-full bg-white text-[rgba(104,171,110,1)] text-[12px] font-normal cursor-pointer">
                정보 수정
              </button>
            </div>
          </section>

          <section className="px-[18px] py-[14px]">
            <div className="flex items-center mb-[6px]">
              <span className="text-[12px] font-normal text-[rgba(0,0,0,0.35)]">
                담은 지 +{product.daysAfterSaved}일
              </span>
            </div>

            <h2 className="text-[18px] font-semibold text-[rgba(0,0,0,0.85)]">{product.title}</h2>

            <div className="flex items-baseline gap-[6px] mb-[14px]">
              <span className="text-[20px] font-semibold text-[rgba(0,0,0,0.9)]">{formatWon(product.priceWon)}</span>
              <span className="text-[14px] font-normal text-[rgba(0,0,0,0.6)]">원</span>
            </div>

            <div className={cn('flex justify-center', decision ? 'gap-0' : 'gap-[30px]')}>
              {decision === null ? (
                <>
                  <button
                    type="button"
                    onClick={() => onClickDecision('CONFIRM')}
                    className="h-9 w-[144px] rounded-full border-[1.5px] border-[rgba(164,121,113,1)] bg-white text-[16px] font-medium text-[rgba(164,121,113,1)] cursor-pointer">
                    구매 결정
                  </button>

                  <button
                    type="button"
                    onClick={() => onClickDecision('CANCEL')}
                    className="h-9 w-[144px] rounded-full border-[1.5px] border-[rgba(164,121,113,1)] bg-white text-[16px] font-medium text-[rgba(164,121,113,1)] cursor-pointer">
                    구매 포기
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => onClickDecision(decision)}
                  className="h-9 w-[144px] rounded-full border-0 bg-[rgba(164,121,113,1)] text-white text-[16px] font-medium cursor-pointer active:translate-y-[1px]">
                  {decision === 'CONFIRM' ? '구매 결정' : '구매 포기'}
                </button>
              )}
            </div>
          </section>
        </section>

        <section className="bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]">
          <section className="p-[18px]">
            <div className="relative rounded-[6px] border-[1.5px] border-[rgba(143,188,147,1)] shadow-[0px_0px_4px_0px_rgba(104,171,110,1)] bg-white p-[14px]">
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value.slice(0, product.memoLimit))}
                placeholder="메모를 입력해 주세요"
                aria-label="메모 입력"
                className="w-full min-h-[44px] border-0 outline-none resize-none text-[16px] font-normal text-[rgba(0,0,0,0.82)] placeholder:text-[rgba(0,0,0,0.28)] placeholder:font-semibold"
              />
              <div
                aria-label="메모 글자수"
                className="absolute right-3 bottom-[10px] text-[14px] font-normal text-[rgba(0,0,0,0.35)]">
                {memoCountText}
              </div>
            </div>
          </section>

          <section className="px-[18px] py-4">
            <button
              type="button"
              onClick={onClickStore}
              className="w-full h-[74px] rounded-full cursor-pointer bg-[rgba(255,255,230,1)] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] flex items-center justify-between px-[18px]">
              <div className="flex items-center gap-3">
                <div aria-hidden className="w-[38px] h-[38px] rounded-full bg-[rgba(0,0,0,0.12)]" />

                <div className="flex flex-col gap-1 items-start">
                  <div className="text-[14px] font-normal text-[rgba(0,0,0,0.85)]">{product.storeName}</div>
                  <div className="text-[12px] font-normal text-[rgba(0,0,0,0.35)]">{product.storeSubText}</div>
                </div>
              </div>

              <span aria-hidden className="text-[26px] font-black text-[rgba(0,0,0,0.5)]">
                ›
              </span>
            </button>
          </section>

          <section className="px-[18px] py-4">
            <div className="w-full rounded-[16px] bg-[#cfe0c6] text-[rgba(47,77,52,0.95)] px-[18px] pt-[18px] pb-[22px] flex flex-col items-start gap-4">
              <div className="text-[12px] font-normal text-[rgba(104,171,110,1)]">내게 필요한 소비일까?</div>
              <h3 className="m-0 font-['Galmuri11',sans-serif] text-[24px] font-bold leading-none text-[rgba(0,0,0,0.9)]">
                도나AI
              </h3>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

function formatWon(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}
