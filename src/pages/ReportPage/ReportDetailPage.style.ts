import styled from 'styled-components';

export const Page = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #ffffff;
  color: #111;
`;

export const TopBar = styled.header`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;

  height: 64px;
  padding: 12px 12px 0;

  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;

  z-index: 10;

  color: #fff;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.35);
`;

export const BackButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;

  font-size: 26px;
  line-height: 1;
  color: #fff;
`;

export const TopTitle = styled.h1`
  margin: 0;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.25);
`;

export const TopRightSpacer = styled.div``;

export const Body = styled.main`
  width: 100%;
  background: rgba(255, 255, 230, 1);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const FullCard = styled.section`
  background: #ffffff;
  //   overflow: hidden;
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25);
`;

export const Hero = styled.section`
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #eee;
`;

export const HeroImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const HeroOverlay = styled.div`
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 14px;

  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
`;

export const HeroHint = styled.p`
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
`;

export const HeroEditButton = styled.button`
  padding: 6px 14px;
  border-radius: 50px;
  background: #fff;
  color: rgba(104, 171, 110, 1);
  font-size: 12px;
  font-weight: 400;
  cursor: pointer;
`;

export const Info = styled.section`
  padding: 14px 18px;
`;

export const MetaRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
`;

export const MetaText = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.35);
`;

export const ProductTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
`;

export const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 14px;
`;

export const Price = styled.span`
  font-size: 20px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.9);
`;

export const Won = styled.span`
  font-size: 14px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.6);
`;

export const Actions = styled.div<{ $mode: 'dual' | 'single' }>`
  display: flex;
  justify-content: center;
  gap: ${(p) => (p.$mode === 'dual' ? '30px' : '0')};
`;

export const FilledButton = styled.button<{ $decision: 'CONFIRM' | 'CANCEL' }>`
  height: 36px;
  width: 144px;
  border-radius: 100px;
  border: none;
  cursor: pointer;
  background: rgba(164, 121, 113, 1);
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;

  &:active {
    transform: translateY(1px);
  }
`;

export const OutlineButton = styled.button`
  height: 36px;
  width: 144px;
  border-radius: 100px;
  border: 1.5px solid rgba(164, 121, 113, 1);
  background: #ffffff;

  font-size: 16px;
  font-weight: 500;
  color: rgba(164, 121, 113, 1);

  cursor: pointer;
`;

export const MemoSection = styled.section`
  //   padding: 6px 18px 12px;
  padding: 18px;
`;

export const MemoBox = styled.div`
  position: relative;
  border-radius: 6px;
  border: 1.5px solid rgba(143, 188, 147, 1);
  box-shadow: 0px 0px 4px 0px rgba(104, 171, 110, 1);
  background: #ffffff;
  padding: 14px;
`;

export const MemoInput = styled.textarea`
  width: 100%;
  min-height: 44px;
  border: none;
  outline: none;
  resize: none;

  font-size: 16px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.82);

  &::placeholder {
    color: rgba(0, 0, 0, 0.28);
    font-weight: 600;
  }
`;

export const MemoCount = styled.div`
  position: absolute;
  right: 12px;
  bottom: 10px;
  font-size: 14px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.35);
`;

export const StoreSection = styled.section`
  //   padding: 6px 18px 14px;
  padding: 16px 18px;
`;

export const StoreCard = styled.button`
  width: 100%;
  height: 74px;
  border-radius: 50px;
  cursor: pointer;

  background: rgba(255, 255, 230, 1);
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25);

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 18px;
`;

export const StoreLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const StoreIcon = styled.div`
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.12);
`;

export const StoreTextBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
`;

export const StoreName = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.85);
`;

export const StoreSub = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.35);
`;

export const Chevron = styled.span`
  font-size: 26px;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.5);
`;

export const NextSection = styled.section`
  //   padding: 6px 18px 24px;
  padding: 16px 18px;
`;

export const NextPlaceholder = styled.div`
  width: 100%;
  border-radius: 16px;
  background: #cfe0c6;
  color: rgba(47, 77, 52, 0.95);

  padding: 18px 18px 22px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
`;

export const NextBadge = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: rgba(104, 171, 110, 1);
  margin: 0;
  padding: 0;
`;

export const NextTitle = styled.h3`
  font-family: 'Galmuri11', sans-serif;
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
  color: rgba(0, 0, 0, 0.9);
`;
