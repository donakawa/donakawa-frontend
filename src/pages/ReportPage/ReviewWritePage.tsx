import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

import type { RatingValue, UsageLevel } from '@/types/ReportPage/review';
import type { HeaderControlContext } from '@/layouts/ProtectedLayout';

import { getTimeIcon } from '@/utils/ReportPage/timeIcon';

import DefaultImg from '@/assets/default_item_photo.svg?url';
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

type HistoryItemRaw = {
  id?: string | number;
  reviewId?: number;
  itemId: number;
  itemName: string;
  price: number;
  imageUrl: string | null;
  purchaseReasons: string[];
  purchasedAt: string;
  purchasedAtTime?: 'DAWN' | 'EVENING' | 'NOON' | 'MORNING' | 'NIGHT' | string;
  itemType?: 'AUTO' | 'MANUAL' | 'auto' | 'manual' | string;

  satisfaction?: number;
  frequency?: number;
  updatedAt?: string;
};

type GetItemsData = {
  items: HistoryItemRaw[];
};

type PostReviewRequestBody = {
  itemType: 'AUTO' | 'MANUAL';
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
  timeLabel?: string;
  itemType?: 'AUTO' | 'MANUAL';
};

type Mode = 'NOT_WRITTEN' | 'WRITTEN';

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
  if (/^\d{4}-\d{2}-\d{2}$/.test(isoLike)) return isoLike.replaceAll('-', '.');

  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return '';

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

function parseDateOrNull(isoLike: string | undefined): Date | null {
  if (!isoLike) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(isoLike)) {
    const [y, m, d] = isoLike.split('-').map((v) => Number(v));
    if (!y || !m || !d) return null;
    const dd = new Date(y, m - 1, d);
    if (!Number.isNaN(dd.getTime())) return dd;
  }

  const d = new Date(isoLike);
  if (!Number.isNaN(d.getTime())) return d;
  return null;
}

function daysSince(isoLike: string | undefined): number | null {
  const d = parseDateOrNull(isoLike);
  if (!d) return null;

  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  return Math.max(0, days);
}

function normalizeTimeLabel(raw: unknown): string {
  const t = typeof raw === 'string' ? raw : '';
  const upper = t.toUpperCase();

  if (upper === 'NIGHT') return 'EVENING';
  if (upper === 'DAWN' || upper === 'EVENING') return upper;
  if (t === '새벽' || t === '저녁') return t;

  return 'EVENING';
}

function normalizeItemType(raw: unknown): 'AUTO' | 'MANUAL' | undefined {
  const t = typeof raw === 'string' ? raw : '';
  const upper = t.toUpperCase();
  if (upper === 'AUTO') return 'AUTO';
  if (upper === 'MANUAL') return 'MANUAL';
  return undefined;
}

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function toRatingValue(raw: unknown): RatingValue {
  if (typeof raw !== 'number' || Number.isNaN(raw)) return 0;
  const v = clampInt(Math.round(raw), 1, 5);
  return v as Exclude<RatingValue, 0>;
}

function toUsageLevel(raw: unknown): UsageLevel {
  if (typeof raw !== 'number' || Number.isNaN(raw)) return 0;
  const v = clampInt(Math.round(raw), 1, 5);
  return v as UsageLevel;
}

function getHistoryKey(x: HistoryItemRaw): string {
  if (x.id !== undefined && x.id !== null && String(x.id) !== '') return String(x.id);
  if (typeof x.reviewId === 'number') return String(x.reviewId);
  return String(x.itemId);
}

export default function ReviewWritePage(): React.JSX.Element {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTitle, setRightAction } = useOutletContext<HeaderControlContext>();

  const historyIdParam = searchParams.get('historyId');
  const purchasedIdParam = searchParams.get('purchasedId');
  const targetKey = historyIdParam ?? purchasedIdParam;

  const [mode, setMode] = useState<Mode>('NOT_WRITTEN');

  const [rating, setRating] = useState<RatingValue>(0);
  const [usage, setUsage] = useState<UsageLevel>(0);

  const [loadingPurchase, setLoadingPurchase] = useState<boolean>(true);
  const [purchaseError, setPurchaseError] = useState<string>('');
  const [purchase, setPurchase] = useState<UiPurchase | null>(null);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  const isReadOnly = mode === 'WRITTEN';
  const isCompleted = rating > 0 && usage > 0;

  const usageRatio = useMemo(() => {
    return usage <= 1 ? 0 : Math.min(1, (usage - 1) / 4);
  }, [usage]);

  useEffect(() => {
    let alive = true;

    const buildUi = (target: HistoryItemRaw): UiPurchase => {
      const d = daysSince(target.purchasedAt);
      const dayLabelText = d === null ? '' : `구매한 지 ${d}DAY+`;

      return {
        itemId: String(target.itemId),
        title: target.itemName || '상품명',
        price: typeof target.price === 'number' ? target.price : 0,
        imageUrl: target.imageUrl || null,
        tags: Array.isArray(target.purchaseReasons) ? target.purchaseReasons : [],
        dateText: formatDateText(target.purchasedAt),
        dayLabelText,
        timeLabel: normalizeTimeLabel(target.purchasedAtTime),
        itemType: normalizeItemType(target.itemType),
      };
    };

    const findByTargetKey = (list: HistoryItemRaw[], key: string): HistoryItemRaw | undefined => {
      const byItemId = list.find((x) => String(x.itemId) === key);
      if (byItemId) return byItemId;
      return list.find((x) => getHistoryKey(x) === key);
    };

    const run = async () => {
      setLoadingPurchase(true);
      setPurchaseError('');
      setSubmitError('');
      setPurchase(null);

      try {
        const notWrittenRes = await requestWithOptionalApiPrefix<ApiResponse<GetItemsData>>(
          'GET',
          '/histories/items?reviewStatus=NOT_WRITTEN',
        );
        if (!alive) return;

        if (notWrittenRes.resultType === 'FAIL') {
          setPurchaseError(notWrittenRes.error.reason || '구매 정보를 불러오지 못했어요.');
          return;
        }

        const notWrittenList = notWrittenRes.data.items ?? [];

        if (!targetKey) {
          if (notWrittenList.length === 0) {
            setPurchaseError('후기 작성 가능한 아이템이 없어요.');
            return;
          }
          const first = notWrittenList[0];
          setMode('NOT_WRITTEN');
          setRating(0);
          setUsage(0);
          setPurchase(buildUi(first));
          return;
        }

        const foundNotWritten = findByTargetKey(notWrittenList, String(targetKey));
        if (foundNotWritten) {
          setMode('NOT_WRITTEN');
          setRating(0);
          setUsage(0);
          setPurchase(buildUi(foundNotWritten));
          return;
        }

        const writtenRes = await requestWithOptionalApiPrefix<ApiResponse<GetItemsData>>(
          'GET',
          '/histories/items?reviewStatus=WRITTEN',
        );
        if (!alive) return;

        if (writtenRes.resultType === 'FAIL') {
          setPurchaseError(writtenRes.error.reason || '구매 정보를 불러오지 못했어요.');
          return;
        }

        const writtenList = writtenRes.data.items ?? [];
        const foundWritten = findByTargetKey(writtenList, String(targetKey));

        if (!foundWritten) {
          setPurchaseError('해당 소비 기록을 후기 목록에서 찾지 못했어요.');
          return;
        }

        setMode('WRITTEN');
        setRating(toRatingValue(foundWritten.satisfaction));
        setUsage(toUsageLevel(foundWritten.frequency));
        setPurchase(buildUi(foundWritten));
      } catch (e) {
        if (!alive) return;
        const err = e as AxiosError;
        setPurchaseError(err.message || '구매 정보를 불러오는 중 오류가 발생했어요.');
      } finally {
        if (!alive) return;
        setLoadingPurchase(false);
      }
    };

    void run();

    return () => {
      alive = false;
    };
  }, [targetKey]);

  const handleDone = async () => {
    if (isReadOnly) return;
    if (!isCompleted) return;
    if (!purchase) return;
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const body: PostReviewRequestBody = {
        itemType: purchase.itemType ?? 'AUTO',
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
    setTitle(isReadOnly ? '작성한 소비 후기' : '소비 후기 작성');

    if (isReadOnly) {
      setRightAction(null);
      return () => {
        setTitle('');
        setRightAction(null);
      };
    }

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
  }, [setTitle, setRightAction, isReadOnly, isCompleted, isSubmitting, loadingPurchase, purchase, purchaseError]);

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

  const { src: timeIconSrc, alt: timeIconAlt } = getTimeIcon(purchase.timeLabel);

  return (
    <div className="w-full max-w-[375px] mx-auto min-h-[100dvh] bg-white overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <main className="p-5">
        {isReadOnly && (
          <div className="mb-4 px-3 py-2 rounded-md bg-gray-50 text-[12px] text-gray-600">
            이미 작성된 후기예요. (읽기 전용)
          </div>
        )}

        <section className="pb-[18px]">
          <div className="flex items-center gap-[10px] mb-[12px]">
            <div className="text-[14px] font-normal text-primary-brown-400">{purchase.dateText}</div>
            <img src={timeIconSrc} alt={timeIconAlt} className="h-[30px]" />
          </div>

          <div className="flex gap-[20px]">
            <div className="w-[94px] h-[94px] rounded-[5px] overflow-hidden bg-gray-100 relative">
              {purchase.imageUrl ? (
                <img
                  src={purchase.imageUrl ?? DefaultImg}
                  alt={purchase.title}
                  className="w-full h-full object-cover block"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[12px] text-gray-400">
                  이미지 없음
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div className="text-[16px] font-medium truncate">{purchase.title}</div>
              <div className="text-[18px] font-medium">{purchase.price.toLocaleString('ko-KR')}원</div>
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
                  className="px-[6px] py-[3px] rounded-full bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] text-[12px] text-primary-brown-500">
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
                  onClick={() => {
                    if (isReadOnly) return;
                    setRating(score);
                  }}
                  disabled={isReadOnly}
                  className={cn('bg-transparent p-0', isReadOnly && 'cursor-default')}
                  aria-label={`${score}점`}>
                  <img
                    src={filled ? StarFullIcon : StarIcon}
                    alt=""
                    className={cn('w-[30px] h-[30px]', !filled && 'opacity-60', isReadOnly && 'opacity-80')}
                  />
                </button>
              );
            })}
          </div>
        </section>

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
                  onClick={() => {
                    if (isReadOnly) return;
                    setUsage(v as UsageLevel);
                  }}
                  disabled={isReadOnly}
                  className={cn(
                    'w-5 h-5 rounded-full',
                    v <= usage ? 'bg-primary-brown-400' : 'bg-gray-100',
                    isReadOnly && 'cursor-default',
                  )}
                  aria-label={`사용 빈도 ${v}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-[12px] flex justify-between text-[12px] text-gray-400 w-[85%] mx-auto">
            <span>거의 안 씀</span>
            <span>매우 자주</span>
          </div>

          {submitError && <p className="mt-4 text-center text-[12px] text-red-500">{submitError}</p>}
          {isSubmitting && <p className="mt-2 text-center text-[12px] text-gray-400">등록 중…</p>}
        </section>
      </main>
    </div>
  );
}
