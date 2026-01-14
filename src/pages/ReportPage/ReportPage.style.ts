import styled from 'styled-components';

export const Page = styled.div`
  width: 100%;
  min-height: 100%;
  background: var(--color-primary-100);
  color: var(--color-gray-1000);
`;

export const Body = styled.div`
  padding: 40px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25);
`;

export const TopTabs = styled.div`
  display: flex;
  gap: 10px;
  padding: 12px 16px 0px;
  background: var(--color-white);
`;

export const TabButton = styled.button<{ isActive: boolean }>`
  font-family: 'Galmuri11', sans-serif;
  font-weight: 700;
  font-size: 20px;
  padding: 7px 12px;
  border-radius: 10px 10px 0 0;
  clip-path: inset(-10px -10px 0px -10px);
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25);
  border-bottom: ${({ isActive }) => (isActive ? '1px solid var(--color-white)' : '1px solid var(--color-gray-200)')};
  background: ${({ isActive }) => (isActive ? 'var(--color-primary-100)' : 'var(--color-white)')};
  color: ${({ isActive }) => (isActive ? 'var(--color-primary-brown-500)' : 'var(--color-gray-200)')};

  transition: background 120ms ease, border-color 120ms ease, transform 120ms ease;
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const SectionTitle = styled.div`
  width: fit-content;
  padding: 4px 10px;
  border-radius: 50px;
  border: 1.5px solid var(--color-primary-600);
  background: var(--color-white);
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25);
  font-size: 12px;
  font-weight: 500;
`;

export const Card = styled.div`
  background: var(--color-white);
  border-radius: 18px;
  border: 1px solid var(--color-gray-100);
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25);
  padding: 20px 16px;

  --label-col: 78px;
  --value-col: 1fr;
  --gap-col: 18px;
`;

export const ContentLine = styled.div`
  display: grid;
  grid-template-columns: var(--label-col) var(--value-col);
  column-gap: var(--gap-col);
  align-items: center;
  padding: 6px 0;
`;

export const ContentTitle = styled.div`
  color: var(--color-gray-600);
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
  padding-left: 15px;
`;

export const ContentValue = styled.div`
  color: var(--color-black);
  font-size: 16px;
  font-weight: 500;
`;

export const TagLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
`;

export const Tag = styled.div`
  padding: 3px 6px;
  border-radius: 100px;
  background: var(--color-white);
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25);
  font-size: 12px;
  font-weight: 400;
  color: var(--color-primary-brown-500);
`;

export const ReasonStars = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-left: calc(var(--label-col) + var(--gap-col));
`;

export const StarWrap = styled.div`
  display: inline-flex;
  gap: 4px;
  align-items: center;
`;

export const StarIcon = styled.img`
  width: 18px;
  height: 18px;
  display: block;
`;

export const DottedLine = styled.div`
  height: 1px;
  margin: 30px 0;
  background-image: linear-gradient(to right, var(--color-primary-brown-200) 60%, rgba(255, 255, 255, 0) 0%);
  background-size: 23px 1px;
  background-repeat: repeat-x;
`;

export const TotalTitle = styled.div`
  color: var(--color-primary-600);
  font-weight: 500;
  font-size: 16px;
  margin-bottom: 16px;
`;

export const TotalText = styled.div`
  color: var(--color-black);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.4;
`;

export const Slot = styled.div`
  display: flex;
  gap: 8px;
  padding-bottom: 10px;
`;

export const SlotButton = styled.button<{ $active: boolean }>`
  padding: 6px 12px;
  border-radius: 50px;
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25);
  background: ${({ $active }) => ($active ? 'var(--color-primary-brown-400)' : 'var(--color-white)')};
  color: ${({ $active }) => ($active ? 'var(--color-white)' : 'var(--color-gray-1000)')};
  font-weight: 500;
  font-size: 12px;

  transition: background 120ms ease, border-color 120ms ease, transform 120ms ease;

  &:active {
    transform: scale(0.98);
  }
`;

export const ChartWrap = styled.div`
  position: relative;
`;

export const GridOverlay = styled.div`
  pointer-events: none;
  position: absolute;
  top: -5px;
  left: 44px;
  right: 0;
  bottom: 5px;
  display: grid;
  grid-template-rows: repeat(5, 1fr);
`;

export const GridLine = styled.div`
  align-self: center;
  height: 1px;

  background-image: linear-gradient(to right, rgba(0, 0, 0, 0.12) 40%, transparent 0);
  background-size: 12px 1px;
  background-repeat: repeat-x;
`;

export const Chart = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 10px;
  padding-top: 6px;
`;

export const YAxis = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-bottom: 18px;
`;

export const YAxisLine = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr;
  align-items: center;
  gap: 8px;
`;

export const YAxisLabel = styled.div`
  color: var(--color-gray-600);
  font-size: 12px;
  font-weight: 400;
`;

export const YAxisGridLine = styled.div`
  height: 1px;
  background: var(--color-gray-100);
`;

export const Bars = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  padding-right: 6px;
  z-index: 1;
`;

export const BarCol = styled.div`
  width: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

export const BarSet = styled.div`
  width: 22px;
  height: 170px;
  overflow: hidden;

  display: flex;
  align-items: flex-end;
`;

export const Bar = styled.div`
  width: 100%;
  border-radius: 100px 100px 0 0;
  background: var(--color-primary-600);
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25);
`;

export const BarLabel = styled.div`
  color: var(--color-gray-600);
  font-size: 12px;
  font-weight: 400;
`;

export const PSSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 2px;
`;

export const PSSectionTitle = styled.div`
  color: var(--color-black);
  font-weight: 400;
  font-size: 12px;
`;

export const PSIcon = styled.img`
  width: 7px;
  height: 13px;
  display: block;
`;

export const PSItemList = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 8px 16px 2px;
  margin-left: -16px;
  margin-right: -16px;
  scrollbar-width: none;
`;

export const PSItemCard = styled.div`
  min-width: 94px;
  max-width: 94px;
`;

export const ItemSet = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const ItemDay = styled.div`
  color: var(--color-gray-600);
  font-size: 12px;
  font-weight: 500;
`;

export const ItemImg = styled.div`
  width: 94px;
  height: 94px;
  border-radius: 5px;
  background: var(--color-gray-100);
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25);
`;

export const ItemPrice = styled.div`
  color: var(--color-black);
  font-size: 12px;
  font-weight: 500;
`;

export const ItemTitle = styled.div`
  color: var(--color-black);
  font-size: 12px;
  font-weight: 500;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
