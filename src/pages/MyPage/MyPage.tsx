import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import type { ApiResponse } from '@/apis/auth';
import type { Profile } from '@/types/MyPage/mypage';

import { LOCAL_STORAGE_KEY } from '@/constants/key';

import { getAuthMe } from '@/apis/MyPage/auth';
import { getWishlistAnalytics } from '@/apis/WishlistPage/analytics';

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
  nickname: '',
  email: '',
  goal: '',
  giveupCount: 0,
  giveupPrice: 0,
  isLoading: true,
};

type ApiFailedErrorCode = 'A004' | 'A005' | 'A006' | 'U001';

function isAuthFail(code?: string): code is 'A004' | 'A005' | 'A006' {
  return code === 'A004' || code === 'A005' || code === 'A006';
}

export default function MyPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [state, setState] = useState<ProfileState>(DEFAULT_STATE);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const goToSettingPage = () => navigate('/mypage/setting');
  const goToGoalPage = () => navigate('/mypage/goal');
  const goToCompleted = () => navigate('/report/review');
  const goToGiveup = () => navigate('/report/giveup');

  const forceToLogin = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY.accessToken);
    localStorage.removeItem(LOCAL_STORAGE_KEY.refreshToken);
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    let mounted = true;

    const fetchMeAndAnalytics = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        const [meRes, analyticsRes] = await Promise.all([getAuthMe(), getWishlistAnalytics()]);
        if (!mounted) return;

        // 1) /auth/me 실패면 기존과 동일하게 auth fail 처리
        if (meRes.resultType !== 'SUCCESS') {
          const code = (meRes.error?.errorCode ?? '') as ApiFailedErrorCode;
          const reason = meRes.error?.reason ?? '사용자 정보를 불러오지 못했어요.';

          if (isAuthFail(code) || code === 'U001') {
            alert(reason);
            forceToLogin();
            return;
          }

          alert(reason);
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }

        const me = meRes.data;

        // 2) analytics는 실패해도 마이페이지는 뜨게(0 처리)
        const dropped =
          analyticsRes.resultType === 'SUCCESS' ? analyticsRes.data.droppedItems : { totalCount: 0, totalPrice: 0 };

        setState((prev) => ({
          ...prev,
          nickname: me.nickname ?? '',
          email: me.email ?? '',
          goal: me.goal ?? '',
          giveupCount: dropped.totalCount ?? 0,
          giveupPrice: dropped.totalPrice ?? 0,
          isLoading: false,
        }));
      } catch (err: unknown) {
        if (!mounted) return;

        const e = err as {
          response?: { data?: { error?: { errorCode?: string; reason?: string }; reason?: string } };
          message?: string;
        };

        const code = (e?.response?.data?.error?.errorCode ?? '') as ApiFailedErrorCode;
        const reason =
          e?.response?.data?.error?.reason ||
          e?.response?.data?.reason ||
          e?.message ||
          '사용자 정보를 불러오는 중 오류가 발생했어요.';

        if (isAuthFail(code) || code === 'U001') {
          alert(reason);
          forceToLogin();
          return;
        }

        alert(reason);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchMeAndAnalytics();

    return () => {
      mounted = false;
    };
  }, [location.key]);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);

      // 기존 코드 유지: 로그아웃은 컴포넌트에서 instance.post로 하던 방식 그대로 쓰려면
      // auth.ts에 logout 함수 만들고 싶으면 그때 분리하면 됨.
      const { instance } = await import('@/apis/axios');
      const res = await instance.post<ApiResponse<null>>('/auth/logout');

      if (res.data.resultType === 'SUCCESS') {
        forceToLogin();
        return;
      }

      const code = (res.data.error?.errorCode ?? '') as ApiFailedErrorCode;
      const reason = res.data.error?.reason ?? '로그아웃에 실패했어요.';
      alert(reason);

      if (isAuthFail(code)) {
        forceToLogin();
      }
    } catch (err: unknown) {
      const e = err as {
        response?: { data?: { error?: { errorCode?: string; reason?: string }; reason?: string } };
        message?: string;
      };

      const code = (e?.response?.data?.error?.errorCode ?? '') as ApiFailedErrorCode;
      const reason =
        e?.response?.data?.error?.reason || e?.response?.data?.reason || e?.message || '로그아웃 중 오류가 발생했어요.';

      alert(reason);

      if (isAuthFail(code)) {
        forceToLogin();
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

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
              {state.isLoading ? '불러오는 중…' : userProfile.nickname || '-'}
            </div>
            <div className="text-[12px] font-[400] text-gray-600 text-center">
              {state.isLoading ? '' : userProfile.email || '-'}
            </div>
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
            {state.isLoading ? '불러오는 중…' : goal || '-'}
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

      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="mt-2 w-full py-4 text-center text-[14px] font-[400] text-gray-400 disabled:opacity-60">
        {isLoggingOut ? '로그아웃 중…' : '로그아웃'}
      </button>
    </div>
  );
}

function formatWon(value: number): string {
  return new Intl.NumberFormat('ko-KR').format(value);
}
