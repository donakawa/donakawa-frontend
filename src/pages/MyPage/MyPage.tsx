// import { useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import * as S from '@/pages/MyPage/MyPage.style';

// import type { Profile, Goal } from '@/types/MyPage/mypage';

// import SettingIcon from '@/assets/setting.svg';
// import ProfileIcon from '@/assets/profile.svg';
// import RightArrow from '@/assets/arrow_right(gray).svg';
// import LeftArrow from '@/assets/arrow_left(gray).svg';

// export default function MyPage() {
//   const navigate = useNavigate();

//   const UserProfile: Profile[] = useMemo(
//     () => [
//       {
//         nickname: '습관성충동구매',
//         email: 'gamjaaaaa@gmail.com',
//         giveupCount: 26,
//         giveupPrice: 459_200,
//       },
//     ],
//     [],
//   );

//   // const navigate = useNavigate();

//   const goToSettingPage = () => {
//     // navigate(`/report/review`);
//   };

//   const goToGoalPage = () => {
//     // navigate(`/report/review`);
//   };

//   return (
//     <>
//       {/* 프로필 */}
//       <S.Page>
//         <S.PageTitle>My Page</S.PageTitle>

//         <S.TopSection>
//           <S.ProfileContent>
//             <S.SetButton type="button" aria-label="수정하기" onClick={goToSettingPage}>
//               <img src={SettingIcon} alt="" />
//             </S.SetButton>
//             <S.MyAccount>
//               <S.ProfileImg src={ProfileIcon} />
//               <S.ProfileNickname></S.ProfileNickname>
//               <S.ProfileEmail></S.ProfileEmail>
//             </S.MyAccount>
//             <S.GiveupInfo>
//               <S.GiveupNum>
//                 <S.GiveupTitle>구매 포기</S.GiveupTitle>
//                 <S.Count>{UserProfile.giveupCount}</S.Count>
//                 <S.Time>회</S.Time>
//               </S.GiveupNum>
//               <S.GiveupWon>
//                 <S.GiveupTitle>아낀 금액</S.GiveupTitle>
//                 <S.Price>{formatWon(UserProfile.giveupPrice)}</S.Price>
//                 <S.Won>원</S.Won>
//               </S.GiveupWon>
//             </S.GiveupInfo>
//           </S.ProfileContent>
//         </S.TopSection>

//         {/* 목표 */}
//         <S.MiddleSection>
//           <S.GoalPart>
//             <S.MiddleTitle>목표</S.MiddleTitle>
//             <S.MiddleGoal>{Goal}</S.MiddleGoal>
//           </S.GoalPart>
//           <S.NavButton type="button" aria-label="목표 수정" onClick={goToGoalPage}>
//             <img src={RightArrow} alt="" />
//           </S.NavButton>
//         </S.MiddleSection>

//         {/* 하단 버튼 */}
//         <S.BottomSection>
//           <S.BottomBtn type="button" aria-label="자세히 보기" onClick={}>
//             <S.BottonSelectButton>구매 완료</S.BottonSelectButton>
//             <img src={RightArrow} alt="" />
//           </S.BottomBtn>
//           <S.BottomBtn type="button" aria-label="자세히 보기" onClick={}>
//             <S.BottonSelectButton>구매 포기</S.BottonSelectButton>
//             <img src={RightArrow} alt="" />
//           </S.BottomBtn>
//         </S.BottomSection>
//       </S.Page>
//     </>
//   );
// }

// function formatWon(value: number): string {
//   return new Intl.NumberFormat('ko-KR').format(value);
// }
