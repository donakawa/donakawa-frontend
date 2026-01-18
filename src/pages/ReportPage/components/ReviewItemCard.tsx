import { useNavigate } from 'react-router-dom';

import type { ReviewItemCardProps } from '@/types/ReportPage/review';
import * as S from '@/pages/ReportPage/PurchaseReviewPage.styles';

import StarFullIcon from '@/assets/star_full.svg';
import StarIcon from '@/assets/star_line.svg';

export default function ReviewItemCard({ item, onOpenClick }: ReviewItemCardProps) {
  const navigate = useNavigate();

  const isCompleted = 'rating' in item;

  const goToWritePage = () => {
    navigate(`/report/review/write?purchaseId=${encodeURIComponent(item.id)}`);
  };

  const handleCompletedClick = () => {
    onOpenClick?.(item.id);
  };

  //   작성된 후기
  if (isCompleted) {
    return (
      <S.CompletedCard onClick={handleCompletedClick} role={onOpenClick ? 'button' : undefined}>
        <S.CompletedRow>
          <S.CompletedLeft>
            <S.ThumbWrap>
              <S.Thumb src={item.imageUrl} alt={item.title} />
            </S.ThumbWrap>

            <S.CompletedText>
              <S.CompletedPrice>{item.price.toLocaleString('ko-KR')}</S.CompletedPrice>
              <S.CompletedTitle>{item.title}</S.CompletedTitle>
            </S.CompletedText>
          </S.CompletedLeft>

          <S.CompletedRight>
            <S.TagLine>
              {item.tags.map((t) => (
                <S.Tag key={`${item.id}-${t}`}>#{t}</S.Tag>
              ))}
            </S.TagLine>

            <S.StarRow aria-label={`별점 ${item.rating}점 / 5점`}>
              {Array.from({ length: 5 }, (_, i) => {
                const filled = i < item.rating;
                return (
                  <S.StarIcon
                    key={`${item.id}-star-${i}`}
                    src={filled ? StarFullIcon : StarIcon}
                    alt={filled ? '채워진 별' : '비워진 별'}
                  />
                );
              })}
            </S.StarRow>
          </S.CompletedRight>
        </S.CompletedRow>
      </S.CompletedCard>
    );
  }

  //   후기 작성
  return (
    <S.Card>
      <S.Row>
        <S.ThumbWrap>
          <S.Thumb src={item.imageUrl} alt={item.title} />
        </S.ThumbWrap>

        <S.Info>
          <S.TitleText>{item.title}</S.TitleText>
          <S.Price>{item.price.toLocaleString('ko-KR')}</S.Price>
          <S.Meta>구매한 지 {item.daylabel}DAY+</S.Meta>
        </S.Info>
      </S.Row>

      <S.PrimaryButton type="button" onClick={goToWritePage}>
        소비 후기 작성
      </S.PrimaryButton>
    </S.Card>
  );
}
