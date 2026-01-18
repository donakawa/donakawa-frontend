import styled from 'styled-components';

export const Page = styled.div`
  width: 100%;
  max-width: 430px;
  margin: 0 auto;
  min-height: 100dvh;
  background: #fff;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const AppBar = styled.header`
  height: 56px;
  display: grid;
  grid-template-columns: 48px 1fr 64px;
  align-items: center;
  padding: 0 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

export const BackButton = styled.button`
  width: 40px;
  height: 40px;
  border: 0;
  background: transparent;
  font-size: 18px;
  cursor: pointer;
`;

export const AppTitle = styled.h1`
  margin: 0;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
`;

export const DoneButton = styled.button<{ $active: boolean }>`
  border: 0;
  background: transparent;
  font-size: 16px;
  font-weight: 600;

  color: ${(p) => (p.$active ? 'var(--color-primary-green-500)' : 'rgba(0, 0, 0, 0.35)')};
  cursor: ${(p) => (p.$active ? 'pointer' : 'default')};
  opacity: ${(p) => (p.$active ? 1 : 0.8)};
`;

export const Content = styled.main`
  padding: 16px;
`;

export const ProductCard = styled.section`
  padding-bottom: 18px;
`;

export const ProductRow = styled.div`
  display: flex;
  gap: 14px;
`;

export const ThumbWrap = styled.div`
  width: 94px;
  height: 94px;
  border-radius: 5px;
  overflow: hidden;
  background: #f4f4f4;
  flex: 0 0 auto;
`;

export const Thumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

export const ProductInfo = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ProductTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ProductPrice = styled.div`
  font-size: 18px;
  font-weight: 500;
`;

export const ProductMeta = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.35);
`;

export const TagLine = styled.div`
  margin-top: 14px;
  display: flex;
  gap: 10px;
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

export const DateRow = styled.div`
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const DateText = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.55);
`;

export const Moon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #ffe6a8 0 55%, #f6c96a 56% 100%);
`;

export const Divider = styled.div`
  margin-top: 18px;
  height: 1px;
  background: rgba(0, 0, 0, 0.08);
`;

export const Section = styled.section`
  padding: 26px 0;
`;

export const SectionTitle = styled.h2`
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 400;
  text-align: center;
`;

export const Stars = styled.div`
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 8px;
`;

export const StarButton = styled.button`
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
`;

export const StarIcon = styled.img`
  width: 30px;
  height: 30px;
  display: block;
`;

export const RangeLabels = styled.div`
  margin: 10px 10px -10px 10px;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.35);
`;

export const UsageBar = styled.div`
  margin-top: 18px;
  position: relative;
  display: flex;
  align-items: center;
  width: 85%;
  margin: 20px auto 0;
  user-select: none;
`;

export const LineTrack = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  height: 4px;
  background: #ededed;
  border-radius: 50px;
  z-index: 0;
`;

export const LineActive = styled.div<{ $ratio: number }>`
  height: 100%;
  width: ${(p) => `${p.$ratio * 100}%`};
  background: #6b4b45;
  border-radius: 3px;
`;

export const DotRow = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const DotButton = styled.button<{ $active: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 0;
  padding: 0;
  background: ${(p) => (p.$active ? '#6b4b45' : '#ededed')};
  cursor: pointer;
`;
