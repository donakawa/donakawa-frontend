import styled from 'styled-components';

export const Page = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #ffffff;
  color: #111;
`;

export const PageTitle = styled.h1`
  font-family: 'Galmuri11', sans-serif;
  margin: 0;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.25);
`;

export const TopSection = styled.div``;

export const ProfileContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SetButton = styled.div``;

export const MyAccount = styled.div`
  display: flex;
  width: 124px;

  flex-direction: column;
  align-content: center;

  gap: 8px;
`;

export const ProfileImg = styled.img`
  width: 100%;
`;

export const ProfileNickname = styled.div`
  font-size: 16px;
  font-weight: 400;
  text-align: center;
`;

export const ProfileEmail = styled.div`
  font-size: 12px;
  font-weight: 400;
  text-align: center;
`;

export const GiveupInfo = styled.div`
  display: flex;
  justify-content: space-between;
  //   gap: 14px;
`;
