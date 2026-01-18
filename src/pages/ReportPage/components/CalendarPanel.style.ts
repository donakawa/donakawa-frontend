import styled from 'styled-components';

export const Wrap = styled.div`
  padding: 40px 16px 0;
  //   height: 100vh;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 30px;
  background: var(--color-secondary-100);
  box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25);
`;

export const CalendarTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const CalendarIcon = styled.img`
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;

  display: grid;
  place-items: center;

  color: var(--color-gray-700);
  font-size: 22px;
  line-height: 1;

  &:active {
    transform: scale(0.98);
  }
`;

export const MonthText = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-black);
`;

export const Elementrow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 4px;
`;

export const ElementAmount = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-primary-brown-400);
`;

export const ElementCount = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: var(--color-gray-500);
`;

export const Week = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 8px 0;
  gap: 0;
`;

export const Weekday = styled.div`
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-black);
`;

export const CalendarGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
`;

export const DayCellButton = styled.button<{ $selected: boolean; $muted: boolean }>`
  border: 0;
  background: transparent;
  padding: 0;
  cursor: pointer;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  height: 44px;

  .num {
    width: 28px;
    height: 28px;
    border-radius: 100px;
    display: grid;
    place-items: center;

    font-weight: 400;
    background: ${({ $selected }) => ($selected ? '#6E9E7A' : 'transparent')};
    color: ${({ $selected, $muted }) => ($selected ? '#fff' : $muted ? 'rgba(0,0,0,0.25)' : 'var(--color-gray-600)')};
  }

  .dots {
    margin-top: 4px;
    display: flex;
    gap: 3px;
    height: 6px;
  }

  .dot {
    width: 4px;
    height: 4px;
    border-radius: 100px;
    background: var(--color-primary-brown-300);
  }

  &:disabled {
    cursor: default;
  }
`;

export const BottomSheet = styled.div`
  margin: 0 -16px;
  width: calc(100% + 32px);

  background: var(--color-primary-100);
  border-radius: 20px 20px 0 0;
  border: 1px solid rgba(0, 0, 0, 0.05);

  box-shadow: 0px -1px 8px rgba(0, 0, 0, 0.05);
  //   box-shadow: 0px 0px 4px 0px rgba(0, 0, 0, 0.25);
  // 위 그림자가 더 자연스러운 것 같아용...

  padding: 14px 14px 10px;

  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 220px;
`;

export const Handle = styled.div`
  width: 46px;
  height: 5px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.12);
  margin: 0 auto 12px;
`;

export const PurchaseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  max-height: 340px;
  overflow-y: auto;

  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const PurchaseCard = styled.div`
  display: grid;
  grid-template-columns: 94px 1fr;
  column-gap: 12px;
  padding: 12px 8px;

  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

export const Thumb = styled.div`
  width: 94px;
  height: 94px;
  border-radius: 5px;
  background: var(--color-gray-100);
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.18);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export const Price = styled.div`
  margin-top: 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-black);
`;

export const Title = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: var(--color-black);

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const InfoCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;

  font-size: 13px;
  font-weight: 500;
  color: var(--color-black);
`;

export const Label = styled.div`
  min-width: 60px;
  color: var(--color-black);
  font-weight: 400;
  font-size: 12px;
`;

export const TagLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
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

export const SubText = styled.div`
  color: var(--color-primary-brown-400);
  font-size: 12px;
  font-weight: 400;
`;

export const ReviewLink = styled.button`
  margin-top: 8px;
  width: fit-content;
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;

  color: var(--color-gray-600);
  font-size: 12px;
  font-weight: 400;

  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

export const RightChevron = styled.span`
  font-size: 18px;
`;

export const NavButton = styled.button`
  width: 30px;
  height: 30px;
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;

  display: inline-flex;
  align-items: center;
  justify-content: center;
`;
