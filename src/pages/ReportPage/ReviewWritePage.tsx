import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

import type { RatingValue, UsageLevel } from '@/types/ReportPage/review';
import type { HeaderControlContext } from '@/layouts/ProtectedLayout';

import MoonIcon from '@/assets/MoonIcon.svg';
import StarFullIcon from '@/assets/star_full.svg';
import StarIcon from '@/assets/star_rare.svg';

const API_URL = import.meta.env.VITE_API_URL as string;

type ApiFailError<EData = unknown> = {
  errorCode: string;
  reason: string;
  data?: EData;
};

type ApiResponseSuccess<T> = {
  resultType: 'SUCCESS';
  error: null;
  data: T;
};

type ApiResponseFail<EData = unknown> = {
  resultType: 'FAIL';
  error: ApiFailError<EData>;
  success: null;
};

type ApiResponse<T, EData = unknown> = ApiResponseSuccess<T> | ApiResponseFail<EData>;

type PendingItemRaw = {
  itemId: number;
  itemType?: 'manual' | 'auto' | string;
  name: string;
  price: number;
  thumbnailUrl?: string | null;
  purchasedAt?: 'MORNING' | 'EVENING' | 'DAWN' | 'NOON' | string;
  tags?: string[];
  purchaseDate?: string;
  createdAt?: string;
};

type GetPendingItemsData =
  | {
      items: PendingItemRaw[];
    }
  | PendingItemRaw[];

type PostReviewRequestBody = {
  satisfaction: number;
  frequency: number;
};

type PostReviewResponseData = {
  reviewId: number;
  itemId: number;
  satisfaction: number;
  frequency: number;
  updatedAt: string;
};

type UiPurchase = {
  itemId: string;
  title: string;
  price: number;
  imageUrl: string | null;
  tags: string[];
  dateText: string;
  dayLabelText: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

async function requestWithOptionalApiPrefix<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const url1 = new URL(path, API_URL).toString();
  try {
    if (method === 'GET') {
      const res = await axios.get<T>(url1, { withCredentials: true });
      return res.data;
    }
    const res = await axios.post<T>(url1, body, {
      withCredentials: true,
      headers: { 'Content-Type': 'application/json' },
    });
    return res.data;
  } catch (e) {
    const err = e as AxiosError;

    if (err.response?.status === 404) {
      const url2 = new URL(`/api${path}`, API_URL).toString();

      if (method === 'GET') {
        const res2 = await axios.get<T>(url2, { withCredentials: true });
        return res2.data;
      }
      const res2 = await axios.post<T>(url2, body, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' },
      });
      return res2.data;
    }

    throw err;
  }
}

function formatDateText(isoLike: string | undefined): string {
  if (!isoLike) return '';
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(isoLike)) return isoLike.replaceAll('-', '.');
    return '';
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

export default function ReviewWritePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { setTitle, setRightAction } = useOutletContext<HeaderControlContext>();

  const purchaseId = params.get('purchaseId');

  const [rating, setRating] = useState<RatingValue>(0);
  const [usage, setUsage] = useState<UsageLevel>(0);

  const [loadingPurchase, setLoadingPurchase] = useState<boolean>(true);
  const [purchaseError, setPurchaseError] = useState<string>('');
  const [purchase, setPurchase] = useState<UiPurchase | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  const isCompleted = rating > 0 && usage > 0;
  const usageRatio = usage <= 1 ? 0 : Math.min(1, (usage - 1) / 4);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      setLoadingPurchase(true);
      setPurchaseError('');

      try {
        const res = await requestWithOptionalApiPrefix<ApiResponse<GetPendingItemsData>>('GET', '/histories/items');

        if (!alive) return;

        if (res.resultType === 'FAIL') {
          setPurchaseError(res.error.reason || '구매 정보를 불러오지 못했어요.');
          setPurchase(null);
          return;
        }

        const data = res.data;
        const list: PendingItemRaw[] = Array.isArray(data) ? data : data.items;

        if (!list || list.length === 0) {
          setPurchaseError('후기 작성 가능한 아이템이 없어요.');
          setPurchase(null);
          return;
        }

        const target = (purchaseId ? list.find((x) => String(x.itemId) === purchaseId) : null) ?? list[0];

        const ui: UiPurchase = {
          itemId: String(target.itemId),
          title: target.name,
          price: target.price,
          imageUrl: target.thumbnailUrl ?? null,
          tags: Array.isArray(target.tags) ? target.tags : [],
          dateText: formatDateText(target.purchaseDate ?? target.createdAt),
          dayLabelText: '',
        };

        setPurchase(ui);
      } catch (e) {
        if (!alive) return;
        const err = e as AxiosError;
        setPurchaseError(err.message || '구매 정보를 불러오는 중 오류가 발생했어요.');
        setPurchase(null);
      } finally {
        if (!alive) return;
        setLoadingPurchase(false);
      }
    };

    void run();

    return () => {
      alive = false;
    };
  }, [purchaseId]);

  const handleDone = async () => {
    if (!isCompleted) return;
    if (!purchase) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const body: PostReviewRequestBody = {
        satisfaction: Number(rating),
        frequency: Number(usage),
      };

      const res = await requestWithOptionalApiPrefix<ApiResponse<PostReviewResponseData>>(
        'POST',
        `/histories/items/${encodeURIComponent(purchase.itemId)}/review`,
        body,
      );

      if (res.resultType === 'FAIL') {
        setSubmitError(res.error.reason || '후기 등록에 실패했어요.');
        return;
      }

      navigate(-1);
    } catch (e) {
      const err = e as AxiosError;
      setSubmitError(err.message || '네트워크 오류가 발생했어요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    setTitle('소비 후기 작성');

    const canSubmit = isCompleted && !isSubmitting && !loadingPurchase && !!purchase && !purchaseError;

    setRightAction({
      rightNode: (
        <span className={cn(canSubmit ? 'text-primary-400' : 'text-gray-400', isSubmitting && 'opacity-60')}>완료</span>
      ),
      onClick: () => {
        if (!canSubmit) return;
        void handleDone();
      },
    });

    return () => {
      setTitle('');
      setRightAction(null);
    };
  }, [setTitle, setRightAction, isCompleted, isSubmitting, loadingPurchase, purchase, purchaseError]);

  if (loadingPurchase) {
    return (
      <div className="w-full max-w-[430px] mx-auto min-h-[100dvh] bg-white flex items-center justify-center text-gray-500">
        구매 정보 불러오는 중…
      </div>
    );
  }

  if (purchaseError || !purchase) {
    return (
      <div className="w-full max-w-[430px] mx-auto min-h-[100dvh] bg-white p-6">
        <p className="text-[14px] text-red-500">{purchaseError || '구매 정보를 찾지 못했어요.'}</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-4 px-4 h-10 rounded-md bg-gray-100 text-[14px]">
          뒤로가기
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-[100dvh] bg-white overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <main className="p-5">
        {/* 구매 정보 */}
        <section className="pb-[18px]">
          <div className="flex items-center gap-[10px] mb-[12px]">
            <div className="text-[14px] font-normal text-primary-brown-400">{purchase.dateText}</div>
            <img src={MoonIcon} alt="" aria-hidden className="h-[30px]" />
          </div>

          <div className="flex gap-[20px]">
            <div className="w-[94px] h-[94px] rounded-[5px] overflow-hidden bg-gray-100">
              {purchase.imageUrl ? (
                <img src={purchase.imageUrl} alt={purchase.title} className="w-full h-full object-cover block" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[12px] text-gray-400">
                  이미지 없음
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div className="text-[16px] font-medium truncate">{purchase.title}</div>
              <div className="text-[18px] font-medium">{purchase.price.toLocaleString('ko-KR')}</div>
              {purchase.dayLabelText ? (
                <div className="text-[16px] font-medium text-gray-600">{purchase.dayLabelText}</div>
              ) : (
                <div className="text-[16px] font-medium text-gray-600">{/* 빈 줄 유지 */}</div>
              )}
            </div>
          </div>

          {purchase.tags.length > 0 && (
            <div className="mt-[14px] flex gap-[10px] flex-wrap">
              {purchase.tags.map((t) => (
                <span
                  key={`${purchase.itemId}-${t}`}
                  className="px-[6px] py-[3px] rounded-full bg-white shadow text-[12px] text-primary-brown-500">
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className="mt-[40px] h-px bg-gray-100" />
        </section>

        <section className="py-[26px]">
          <h2 className="mb-[14px] text-[14px] text-center">구체적인 만족도는 어떤가요?</h2>

          <div className="flex justify-center gap-[14px]">
            {Array.from({ length: 5 }, (_, i) => {
              const score = (i + 1) as Exclude<RatingValue, 0>;
              const filled = score <= rating;

              return (
                <button
                  key={score}
                  type="button"
                  onClick={() => setRating(score)}
                  className="bg-transparent p-0"
                  aria-label={`${score}점`}>
                  <img src={filled ? StarFullIcon : StarIcon} alt="" className="w-[30px] h-[30px]" />
                </button>
              );
            })}
          </div>
        </section>

        {/* 사용 빈도 */}
        <section className="py-[26px]">
          <h2 className="mb-[14px] text-[14px] text-center">구매 후 얼만큼 사용했나요?</h2>

          <div className="relative w-[85%] mx-auto mt-5">
            <div className="absolute top-1/2 left-1/2 w-[90%] h-1 -translate-x-1/2 -translate-y-1/2 bg-gray-100 rounded-full">
              <div className="h-full bg-primary-brown-400 rounded-full" style={{ width: `${usageRatio * 100}%` }} />
            </div>

            <div className="relative flex justify-between">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setUsage(v as UsageLevel)}
                  className={cn('w-5 h-5 rounded-full', v <= usage ? 'bg-primary-brown-400' : 'bg-gray-100')}
                  aria-label={`사용 빈도 ${v}`}
                />
              ))}
            </div>
          </div>

          {/* 제출 에러 */}
          {submitError && <p className="mt-4 text-center text-[12px] text-red-500">{submitError}</p>}

          {/* 제출 중 */}
          {isSubmitting && <p className="mt-2 text-center text-[12px] text-gray-400">등록 중…</p>}
        </section>
      </main>
    </div>
  );
}
