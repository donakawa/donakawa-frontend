import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import type { RatingValue, UsageLevel, ReviewWritePurchase } from '@/types/ReportPage/review';

import StarfullIcon from '@/assets/star_full.svg';
import StarIcon from '@/assets/star_rare.svg';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function ReviewWritePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const purchaseId: string = params.get('purchaseId') ?? '1';

  const purchases: ReviewWritePurchase[] = useMemo(
    () => [
      {
        id: '1',
        title: '캐시미어 로제 더블 하프코트',
        price: 238_400,
        dayLabel: 23,
        imageUrl: '',
        tags: ['세일 중', '기분 전환'],
        dateText: '2026.01.10',
        timeLabel: '저녁',
      },
      {
        id: '2',
        title: '캐시미어 로제 더블 하프코트',
        price: 238_400,
        dayLabel: 23,
        imageUrl: '',
        tags: ['세일 중', '기분 전환'],
        dateText: '2026.01.10',
        timeLabel: '저녁',
      },
    ],
    [],
  );

  const purchase: ReviewWritePurchase = useMemo(() => {
    const found = purchases.find((p) => p.id === purchaseId);
    return found ?? purchases[0];
  }, [purchases, purchaseId]);

  const [rating, setRating] = useState<RatingValue>(0);
  const [usage, setUsage] = useState<UsageLevel>(0);

  const isCompleted: boolean = rating > 0 && usage > 0;
  const usageRatio: number = usage <= 1 ? 0 : Math.min(1, (usage - 1) / 4);

  const handleBack = (): void => {
    navigate(-1);
  };

  const handleDone = (): void => {
    if (!isCompleted) return;
    // API 연결 자리
    navigate(-1);
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-[100dvh] bg-white overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <header className="h-[56px] grid grid-cols-[48px_1fr_64px] items-center px-2 border-b border-b-[rgba(0,0,0,0.06)]">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={handleBack}
          className="w-10 h-10 border-0 bg-transparent text-[18px] cursor-pointer">
          ←
        </button>

        <h1 className="m-0 text-center text-[20px] font-semibold">소비 후기 작성</h1>

        <button
          type="button"
          onClick={handleDone}
          disabled={!isCompleted}
          className={cn(
            'border-0 bg-transparent text-[16px] font-semibold',
            isCompleted
              ? 'text-[var(--color-primary-green-500)] cursor-pointer opacity-100'
              : 'text-gray-600 cursor-default opacity-80',
          )}>
          완료
        </button>
      </header>

      <main className="p-4">
        <section className="pb-[18px]">
          <div className="flex gap-[14px]">
            <div className="w-[94px] h-[94px] rounded-[5px] overflow-hidden bg-white flex-none">
              <img src={purchase.imageUrl} alt={purchase.title} className="w-full h-full object-cover block" />
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-1">
              <div className="text-[16px] font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {purchase.title}
              </div>
              <div className="text-[18px] font-medium">{purchase.price.toLocaleString('ko-KR')}</div>
              <div className="text-[16px] font-medium text-gray-600">구매한 지 {purchase.dayLabel}DAY+</div>
            </div>
          </div>

          <div className="mt-[14px] flex gap-[10px] flex-wrap">
            {purchase.tags.map((t: string) => (
              <span
                key={`${purchase.id}-${t}`}
                className="px-[6px] py-[3px] rounded-full bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] text-[12px] font-normal text-[var(--color-primary-brown-500)]">
                #{t}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-[10px]">
            <div className="text-[14px] font-normal text-primary-brown-400">{purchase.dateText}</div>

            <div
              aria-hidden
              className="w-7 h-7 rounded-full"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #ffe6a8 0 55%, #f6c96a 56% 100%)',
              }}
            />
          </div>

          <div className="mt-[18px] h-px bg-gray-100" />
        </section>

        <section className="py-[26px]">
          <h2 className="m-0 mb-[14px] text-[14px] font-normal text-center">구체적인 만족도는 어떤가요?</h2>

          <div className="flex justify-center gap-[14px] mt-2">
            {Array.from({ length: 5 }, (_, i) => {
              const score = (i + 1) as RatingValue;

              const isFilled = rating > 0 && score <= rating;
              const iconSrc = isFilled ? StarfullIcon : StarIcon;

              return (
                <button
                  key={`star-${score}`}
                  type="button"
                  aria-label={`${score}점`}
                  onClick={() => setRating(score)}
                  className="border-0 p-0 bg-transparent cursor-pointer">
                  <img src={iconSrc} alt="" className="w-[30px] h-[30px] block" />
                </button>
              );
            })}
          </div>
        </section>

        <section className="py-[26px]">
          <h2 className="m-0 mb-[14px] text-[14px] font-normal text-center">구매 후 얼만큼 사용했나요?</h2>

          <div className="mx-[10px] mt-[10px] mb-[-10px] flex justify-between text-[12px] font-normal text-gray-600">
            <span>거의 안 씀</span>
            <span>매우 자주</span>
          </div>

          <div className="relative select-none w-[85%] mx-auto mt-5 flex items-center">
            <div className="absolute top-1/2 left-1/2 w-[90%] h-1 -translate-x-1/2 -translate-y-1/2 bg-gray-100 rounded-[50px] z-0">
              <div className="h-full bg-primary-brown-400 rounded-[3px]" style={{ width: `${usageRatio * 100}%` }} />
            </div>

            <div className="relative z-[1] flex justify-between w-full">
              {[1, 2, 3, 4, 5].map((v) => {
                const active = v <= usage;
                return (
                  <button
                    key={v}
                    type="button"
                    aria-label={`${v}단계`}
                    onClick={() => setUsage(v as UsageLevel)}
                    className={cn(
                      'w-5 h-5 rounded-full border-0 p-0 cursor-pointer',
                      active ? 'bg-primary-brown-400' : 'bg-gray-100',
                    )}
                  />
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
