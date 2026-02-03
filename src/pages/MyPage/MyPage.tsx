import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import type { ApiResponse, MeData } from '@/apis/MyPage/auth';
import type { Profile } from '@/types/MyPage/mypage';

import { axiosInstance } from '@/apis/axios';

import SettingIcon from '@/assets/setting.svg';
import ProfileIcon from '@/assets/profile.svg';
import RightArrow from '@/assets/arrow_right.svg';
import GrayRightArrow from '@/assets/arrow_right(gray).svg';

type ProfileState = {
  nickname: string;
  email: string;
  goal: string;
  giveupCount: number;
  giveupPrice: number;
  isLoading: boolean;
};

const DEFAULT_STATE: ProfileState = {
  nickname: '습관성충동구매',
  email: 'example@example.com',
  goal: '자기개발',
  giveupCount: 26,
  giveupPrice: 459_200,
  isLoading: true,
};

export default function MyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [state, setState] = useState<ProfileState>(DEFAULT_STATE);

  const goToSettingPage = () => navigate('/mypage/setting');
  const goToGoalPage = () => navigate('/mypage/goal');
  const goToCompleted = () => navigate('/mypage/completed');
  const goToGiveup = () => navigate('/mypage/giveup');

  useEffect(() => {
    let mounted = true;

    const fetchMe = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        const res = await axiosInstance.get<ApiResponse<MeData>>('/auth/me');

        if (!mounted) return;

        if (res.data.resultType === 'SUCCESS') {
          const me = res.data.data;

          setState((prev) => ({
            ...prev,
            nickname: me.nickname,
            email: me.email,
            goal: me.goal,
            isLoading: false,
          }));
        } else {
          setState((prev) => ({ ...prev, isLoading: false }));
        }
      } catch {
        if (!mounted) return;
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchMe();

    return () => {
      mounted = false;
    };
  }, [location.key]);

  const userProfile: Profile = useMemo(
    () => ({
      nickname: state.nickname,
      email: state.email,
      giveupCount: state.giveupCount,
      giveupPrice: state.giveupPrice,
    }),
    [state.nickname, state.email, state.giveupCount, state.giveupPrice],
  );

  const goal = state.goal;

  return (
    <div className="w-full min-h-screen bg-white text-black p-5 flex flex-col gap-4">
      <h1 className="font-['Galmuri11',_sans-serif] text-[20px] font-[700] text-black">My Page</h1>

      <section className="mt-2">
        <div className="relative rounded-[20px] bg-white px-[33px] pt-[52px] pb-5 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]">
          <button
            type="button"
            aria-label="설정"
            onClick={goToSettingPage}
            className="absolute right-[14px] top-[14px] grid h-9 w-9 cursor-pointer place-items-center border-0 bg-transparent p-0">
            <img src={SettingIcon} alt="" className="h-[22px] w-[22px]" />
          </button>

          <div className="flex flex-col items-center gap-[6px] pt-[10px]">
            <div className="grid h-[124px] w-[124px] place-items-center overflow-hidden rounded-[50px] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
              <img src={ProfileIcon} alt="프로필" className="h-full w-full object-cover" />
            </div>

            <div className="mt-[6px] text-[16px] font-[400] text-center">
              {state.isLoading ? '불러오는 중…' : userProfile.nickname}
            </div>
            <div className="text-[12px] font-[400] text-gray-600 text-center">{userProfile.email}</div>
          </div>

          <div className="mt-5 grid grid-cols-[1fr_1px_1fr] items-center gap-[14px]">
            <div className="flex flex-col items-center gap-[6px]">
              <div className="text-[12px] text-gray-600">구매 포기</div>
              <div className="flex items-baseline">
                <div className="text-[20px] font-[600]">{userProfile.giveupCount}</div>
                <div className="text-[20px] font-[600]">회</div>
              </div>
            </div>

            <div aria-hidden className="h-[42px] w-[1px] bg-black/12" />

            <div className="flex flex-col items-center gap-[6px]">
              <div className="text-[12px] text-gray-600">아낀 금액</div>
              <div className="flex items-baseline">
                <div className="text-[20px] font-[600]">{formatWon(userProfile.giveupPrice)}</div>
                <div className="text-[20px] font-[600]">원</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="h-[82px] rounded-[50px] bg-secondary-100 px-[22px] py-[9px] shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="text-[12px] font-[400] text-gray-600">목표</div>
          <div className="w-fit rounded-[50px] bg-primary-100 px-[10px] py-[5px] text-[14px] font-[700] border-2 border-primary-400">
            {goal}
          </div>
        </div>

        <button
          type="button"
          aria-label="목표 수정"
          onClick={goToGoalPage}
          className="grid h-6 w-6 cursor-pointer place-items-center border-0 bg-transparent p-0">
          <img src={RightArrow} alt="" className="h-[13px] w-2" />
        </button>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <button
          type="button"
          aria-label="구매 완료 상세"
          onClick={goToCompleted}
          className="flex items-center justify-between rounded-[50px] bg-primary-100 px-5 py-3 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] cursor-pointer">
          <div className="text-[16px] font-[500]">구매 완료</div>
          <img src={GrayRightArrow} alt="" className="h-[13px] w-2" />
        </button>

        <button
          type="button"
          aria-label="구매 포기 상세"
          onClick={goToGiveup}
          className="flex items-center justify-between rounded-[50px] bg-primary-100 px-5 py-3 shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] cursor-pointer">
          <div className="text-[16px] font-[500]">구매 포기</div>
          <img src={GrayRightArrow} alt="" className="h-[13px] w-2" />
        </button>
      </section>
    </div>
  );
}

function formatWon(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}
