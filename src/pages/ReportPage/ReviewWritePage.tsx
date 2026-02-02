import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useOutletContext } from 'react-router-dom';

import type { RatingValue, UsageLevel, ReviewWritePurchase } from '@/types/ReportPage/review';
import type { HeaderControlContext } from '@/layouts/ProtectedLayout';

import MoonIcon from '@/assets/달.svg';
import StarfullIcon from '@/assets/star_full.svg';
import StarIcon from '@/assets/star_rare.svg';
import Sample from '@/assets/sample.svg';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export default function ReviewWritePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const { setTitle, setRightAction } = useOutletContext<HeaderControlContext>();

  const purchaseId: string = params.get('purchaseId') ?? '1';

  const purchases: ReviewWritePurchase[] = useMemo(
    () => [
      {
        id: '1',
        title: '캐시미어 로제 더블 하프코트',
        price: 238_400,
        dayLabel: 23,
        imageUrl: Sample,
        tags: ['세일 중', '기분 전환'],
        dateText: '2026.01.10',
        timeLabel: '저녁',
      },
      {
        id: '2',
        title: '캐시미어 로제 더블 하프코트',
        price: 238_400,
        dayLabel: 23,
        imageUrl: Sample,
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

  const handleDone = (): void => {
    if (!isCompleted) return;
    navigate(-1);
  };

  useEffect(() => {
    setTitle('소비 후기 작성');

    setRightAction({
      rightNode: '완료',
      onClick: handleDone,
    });

    return () => {
      setTitle('');
      setRightAction(null);
    };
  }, [setTitle, setRightAction, isCompleted]);

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-[100dvh] bg-white overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <main className="p-5">
        <section className="pb-[18px]">
          <div className="flex items-center gap-[10px] mb-[12px]">
            <div className="text-[14px] font-normal text-primary-brown-400">{purchase.dateText}</div>
            <img src={MoonIcon} alt="" aria-hidden className="h-[30px]" />
          </div>

          <div className="flex gap-[20px]">
            <div className="w-[94px] h-[94px] rounded-[5px] overflow-hidden bg-white flex-none">
              <img src={purchase.imageUrl} alt={purchase.title} className="w-full h-full object-cover block" />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between gap-1">
              <div className="text-[16px] font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                {purchase.title}
              </div>
              <div className="text-[18px] font-medium">{purchase.price.toLocaleString('ko-KR')}</div>
              <div className="text-[16px] font-medium text-gray-600">구매한 지 {purchase.dayLabel}DAY+</div>
            </div>
          </div>

          <div className="mt-[14px] flex gap-[10px] flex-wrap">
            {purchase.tags.map((t) => (
              <span
                key={`${purchase.id}-${t}`}
                className="px-[6px] py-[3px] rounded-full bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] text-[12px] text-[var(--color-primary-brown-500)]">
                #{t}
              </span>
            ))}
          </div>

          <div className="mt-[40px] h-px bg-gray-100" />
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
