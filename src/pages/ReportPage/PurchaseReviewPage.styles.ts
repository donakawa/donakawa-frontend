import styled from 'styled-components';

export const Page = styled.div`
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  background: #fff;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
`;

export const AppBar = styled.header`
  height: 56px;
  display: grid;
  grid-template-columns: 48px 1fr 48px;
  align-items: center;
  padding: 0 8px;
`;

export const BackButton = styled.button`
  width: 40px;
  height: 40px;
  border: 0;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
`;

export const Title = styled.h1`
  margin: 0;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
`;

export const RightSlot = styled.div`
  width: 40px;
  height: 40px;
`;

export const TopTabs = styled.div`
  height: 48px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: stretch;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

export const TabButton = styled.button<{ isActive: boolean }>`
  border: 0;
  background: transparent;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  color: ${(p) => (p.isActive ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.20)')};
`;

export const SectionHint = styled.div`
  padding: 16px;
  font-size: 14px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.45);

  strong {
    font-weight: 900;
    color: rgba(0, 0, 0, 0.9);
  }
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
`;

export const ViewStage = styled.div`
  position: relative;
  flex: 1 1 auto;
  overflow: hidden;
`;

export const ViewPanel = styled.section<{ isActive: boolean }>`
  position: absolute;
  inset: 0;
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
  padding-bottom: 86px;

  opacity: ${(p) => (p.isActive ? 1 : 0)};
  transform: ${(p) => (p.isActive ? 'translateX(0)' : 'translateX(10px)')};
  pointer-events: ${(p) => (p.isActive ? 'auto' : 'none')};
`;

export const Card = styled.div`
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

export const Row = styled.div`
  display: flex;
  gap: 14px;
`;

export const ThumbWrap = styled.div`
  width: 88px;
  height: 88px;
  border-radius: 5px;
  overflow: hidden;
  background: #f4f4f4;
  flex-shrink: 0;
`;

export const Thumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const Info = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const TitleText = styled.div`
  font-size: 16px;
  font-weight: 500;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const TitleLine = TitleText;

export const Price = styled.div`
  font-size: 16px;
  font-weight: 500;
`;

export const CompletedCard = styled.div`
  padding: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

export const CompletedRow = styled.div`
  display: flex;
  gap: 21px;
`;

export const CompletedLeft = styled.div`
  width: 94px;
  flex: 0 0 auto;
`;

export const CompletedText = styled.div`
  margin-top: 6px;
`;

export const CompletedPrice = styled.div`
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 4px;
`;

export const CompletedTitle = styled.div`
  font-size: 14px;
  font-weight: 400;
  line-height: 1.3;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CompletedRight = styled.div`
  flex: 1 1 auto;
  padding: 3px 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const Meta = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.45);
`;

export const TagLine = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const Tag = styled.span`
  padding: 3px 6px;
  border-radius: 100px;
  background: var(--color-white);
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25);
  font-size: 12px;
  font-weight: 400;
  color: var(--color-primary-brown-500);
`;

export const StarRow = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
`;

export const StarIcon = styled.img`
  width: 18px;
  height: 18px;
  display: block;
`;

export const PrimaryButton = styled.button`
  margin-top: 14px;
  width: 100%;
  height: 36px;

  border: none;
  border-radius: 5px;

  background: #93b993;
  color: #fff;

  font-size: 16px;
  font-weight: 500;

  cursor: pointer;
`;
