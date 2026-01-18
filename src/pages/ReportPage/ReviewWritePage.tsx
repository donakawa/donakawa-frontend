import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import * as S from '@/pages/ReportPage/ReviewWritePage.style';

import type { RatingValue, UsageLevel, ReviewWritePurchase } from '@/types/ReportPage/review';

import StarfullIcon from '@/assets/star_full.svg';
import StarIcon from '@/assets/star_rare.svg';

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
    <S.Page>
      <S.AppBar>
        <S.BackButton type="button" aria-label="뒤로가기" onClick={handleBack}>
          ←
        </S.BackButton>

        <S.AppTitle>소비 후기 작성</S.AppTitle>

        <S.DoneButton type="button" onClick={handleDone} $active={isCompleted} disabled={!isCompleted}>
          완료
        </S.DoneButton>
      </S.AppBar>

      <S.Content>
        <S.ProductCard>
          <S.ProductRow>
            <S.ThumbWrap>
              <S.Thumb src={purchase.imageUrl} alt={purchase.title} />
            </S.ThumbWrap>

            <S.ProductInfo>
              <S.ProductTitle>{purchase.title}</S.ProductTitle>
              <S.ProductPrice>{purchase.price.toLocaleString('ko-KR')}</S.ProductPrice>
              <S.ProductMeta>구매한 지 {purchase.dayLabel}DAY+</S.ProductMeta>
            </S.ProductInfo>
          </S.ProductRow>

          <S.TagLine>
            {purchase.tags.map((t: string) => (
              <S.Tag key={`${purchase.id}-${t}`}>#{t}</S.Tag>
            ))}
          </S.TagLine>

          <S.DateRow>
            <S.DateText>{purchase.dateText}</S.DateText>
            <S.Moon aria-hidden />
          </S.DateRow>

          <S.Divider />
        </S.ProductCard>

        {/* 별점 */}
        <S.Section>
          <S.SectionTitle>구체적인 만족도는 어떤가요?</S.SectionTitle>

          <S.Stars>
            {Array.from({ length: 5 }, (_, i) => {
              const score = (i + 1) as RatingValue;

              const isDefault = rating === 0;
              const isFilled = rating > 0 && score <= rating;
              const iconSrc = isFilled ? StarfullIcon : StarIcon;

              return (
                <S.StarButton
                  key={`star-${score}`}
                  type="button"
                  aria-label={`${score}점`}
                  onClick={() => setRating(score)}>
                  <S.StarIcon src={iconSrc} alt="" data-default={isDefault} />
                </S.StarButton>
              );
            })}
          </S.Stars>
        </S.Section>

        {/* 사용 빈도 */}
        <S.Section>
          <S.SectionTitle>구매 후 얼만큼 사용했나요?</S.SectionTitle>

          <S.RangeLabels>
            <span>거의 안 씀</span>
            <span>매우 자주</span>
          </S.RangeLabels>

          <S.UsageBar>
            <S.LineTrack>
              <S.LineActive $ratio={usageRatio} />
            </S.LineTrack>

            <S.DotRow>
              {[1, 2, 3, 4, 5].map((v) => (
                <S.DotButton
                  key={v}
                  $active={v <= usage}
                  onClick={() => setUsage(v as UsageLevel)}
                  aria-label={`${v}단계`}
                />
              ))}
            </S.DotRow>
          </S.UsageBar>
        </S.Section>
      </S.Content>
    </S.Page>
  );
}
