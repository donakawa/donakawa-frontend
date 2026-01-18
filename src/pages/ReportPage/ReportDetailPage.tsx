import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import * as S from '@/pages/ReportPage/ReportDetailPage.style';
import type { ReportDetailProduct, PurchaseDecision } from '@/types/ReportPage/Detail';

import SampleImage from '@/assets/sample2.svg';

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
    <S.Page>
      <S.Body>
        <S.FullCard>
          <S.Hero>
            <S.TopBar>
              <S.BackButton type="button" onClick={onClickBack} aria-label="뒤로가기">
                ‹
              </S.BackButton>
              <S.TopRightSpacer aria-hidden />
            </S.TopBar>

            <S.HeroImage src={enableMock ? product.imageUrl : product.imageUrl} alt="상품 이미지" loading="lazy" />

            <S.HeroOverlay>
              <S.HeroEditButton type="button">정보 수정</S.HeroEditButton>
            </S.HeroOverlay>
          </S.Hero>

          <S.Info>
            <S.MetaRow>
              <S.MetaText>담은 지 +{product.daysAfterSaved}일</S.MetaText>
            </S.MetaRow>

            <S.ProductTitle>{product.title}</S.ProductTitle>

            <S.PriceRow>
              <S.Price>{formatWon(product.priceWon)}</S.Price>
              <S.Won>원</S.Won>
            </S.PriceRow>

            <S.Actions $mode={decision ? 'single' : 'dual'}>
              {decision === null ? (
                <>
                  <S.OutlineButton type="button" onClick={() => onClickDecision('CONFIRM')}>
                    구매 결정
                  </S.OutlineButton>
                  <S.OutlineButton type="button" onClick={() => onClickDecision('CANCEL')}>
                    구매 포기
                  </S.OutlineButton>
                </>
              ) : (
                <S.FilledButton type="button" $decision={decision} onClick={() => onClickDecision(decision)}>
                  {decision === 'CONFIRM' ? '구매 결정' : '구매 포기'}
                </S.FilledButton>
              )}
            </S.Actions>
          </S.Info>
        </S.FullCard>

        <S.FullCard>
          <S.MemoSection>
            <S.MemoBox>
              <S.MemoInput
                value={memo}
                onChange={(e) => setMemo(e.target.value.slice(0, product.memoLimit))}
                placeholder="메모를 입력해 주세요"
                aria-label="메모 입력"
              />
              <S.MemoCount aria-label="메모 글자수">{memoCountText}</S.MemoCount>
            </S.MemoBox>
          </S.MemoSection>

          <S.StoreSection>
            <S.StoreCard type="button" onClick={onClickStore}>
              <S.StoreLeft>
                <S.StoreIcon aria-hidden />
                <S.StoreTextBox>
                  <S.StoreName>{product.storeName}</S.StoreName>
                  <S.StoreSub>{product.storeSubText}</S.StoreSub>
                </S.StoreTextBox>
              </S.StoreLeft>

              <S.Chevron aria-hidden>›</S.Chevron>
            </S.StoreCard>
          </S.StoreSection>

          <S.NextSection>
            <S.NextPlaceholder>
              <S.NextBadge>내게 필요한 소비일까?</S.NextBadge>
              <S.NextTitle>도나AI</S.NextTitle>
            </S.NextPlaceholder>
          </S.NextSection>
        </S.FullCard>
      </S.Body>
    </S.Page>
  );
}

function formatWon(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}
