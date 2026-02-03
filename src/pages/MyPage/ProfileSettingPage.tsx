import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import type { HeaderControlContext } from '@/layouts/ProtectedLayout';
import type { ApiResponse, MeData } from '@/apis/auth';

import { axiosInstance } from '@/apis/axios';

import RightArrow from '@/assets/arrow_right.svg';
import CheckIcon from '@/assets/circle_check.svg';

type ConnectedProvider = 'google' | 'none';

type SettingProfile = {
  email: string;
  connectedProvider: ConnectedProvider;
};

const DEFAULT_PROFILE: SettingProfile = {
  email: '',
  connectedProvider: 'none',
};

export default function MyPageSettingPage() {
  const { setTitle } = useOutletContext<HeaderControlContext>();

  useEffect(() => {
    setTitle('설정');
    return () => setTitle('');
  }, [setTitle]);

  const navigate = useNavigate();

  const [profile, setProfile] = useState<SettingProfile>(DEFAULT_PROFILE);

  useEffect(() => {
    let mounted = true;

    const fetchMe = async () => {
      try {
        const res = await axiosInstance.get<ApiResponse<MeData>>('/auth/me');

        if (!mounted) return;

        if (res.data.resultType === 'SUCCESS') {
          const me = res.data.data;

          const provider: ConnectedProvider = me.provider === 'google' ? 'google' : 'none';

          setProfile({
            email: me.email,
            connectedProvider: provider,
          });
        } else {
          setProfile(DEFAULT_PROFILE);
        }
      } catch {
        if (!mounted) return;
        setProfile(DEFAULT_PROFILE);
      }
    };

    fetchMe();

    return () => {
      mounted = false;
    };
  }, []);

  const goBack = () => navigate(-1);

  const goNickname = () => navigate('/mypage/setting/nickname');
  const goPassword = () => navigate('/mypage/setting/password');
  const goGoogle = () => navigate('/mypage/setting/google');
  const goWithdrawal = () => navigate('/mypage/setting/withdrawal');

  return (
    <div className="w-full min-h-screen bg-white text-black">
      <main className="px-4 pt-3 pb-6 flex flex-col gap-[22px]">
        {/* 내 계정 관리 */}
        <section className="flex flex-col gap-[10px]">
          <div className="text-[12px] font-[400] text-gray-600 pl-[2px]">내 계정 관리</div>

          <div className="rounded-[20px] bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col gap-[15px] px-4 py-[18px]">
            <button
              type="button"
              onClick={goNickname}
              aria-label="닉네임 변경"
              className="w-full border-0 bg-transparent cursor-pointer flex items-center justify-between gap-3 active:translate-y-[0.5px]">
              <div className="flex items-center gap-2">
                <div className="text-[14px] font-[400] text-black">닉네임 변경</div>
              </div>
              <div className="grid place-items-center">
                <img src={RightArrow} alt="닉네임 변경" className="w-2 h-[13px] block opacity-75" />
              </div>
            </button>

            <button
              type="button"
              onClick={goPassword}
              aria-label="비밀번호 변경"
              className="w-full border-0 bg-transparent cursor-pointer flex items-center justify-between gap-3 active:translate-y-[0.5px]">
              <div className="flex items-center gap-2">
                <div className="text-[14px] font-[400] text-black">비밀번호 변경</div>
              </div>
              <div className="grid place-items-center">
                <img src={RightArrow} alt="" className="w-2 h-[13px] block opacity-75" />
              </div>
            </button>

            <button
              type="button"
              onClick={goGoogle}
              aria-label="구글 연동"
              className="w-full border-0 bg-transparent cursor-pointer flex items-center justify-between gap-3 active:translate-y-[0.5px]">
              <div className="flex items-center gap-2">
                <div className="text-[14px] font-[400] text-black">구글 연동</div>

                <div className="flex items-center gap-2">
                  {profile.connectedProvider === 'google' ? (
                    <img src={CheckIcon} alt="연동됨" className="w-4 h-4 mt-[3px] block" />
                  ) : (
                    <div aria-hidden className="w-5 h-5" />
                  )}

                  {/* 이메일이 없으면(비로그인/실패) 표시 안 하거나 placeholder를 둘 수 있음 */}
                  <div className="text-[13px] font-[400] text-gray-600">{profile.email || ''}</div>
                </div>
              </div>

              <div className="grid place-items-center">
                <img src={RightArrow} alt="" className="w-2 h-[13px] block opacity-75" />
              </div>
            </button>
          </div>
        </section>

        {/* 고객지원 */}
        <section className="flex flex-col gap-[10px]">
          <div className="text-[12px] font-[400] text-gray-600 pl-[2px]">고객지원</div>

          <div className="rounded-[20px] bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col gap-[15px] px-4 py-[18px]">
            <button
              type="button"
              aria-label="이용약관"
              className="w-full border-0 bg-transparent cursor-pointer flex items-center justify-between gap-3 active:translate-y-[0.5px]">
              <div className="flex items-center gap-2">
                <div className="text-[14px] font-[400] text-black">이용약관</div>
              </div>
              <div className="grid place-items-center">
                <img src={RightArrow} alt="" className="w-2 h-[13px] block opacity-75" />
              </div>
            </button>

            <button
              type="button"
              aria-label="의견 보내기"
              className="w-full border-0 bg-transparent cursor-pointer flex items-center justify-between gap-3 active:translate-y-[0.5px]">
              <div className="flex items-center gap-2">
                <div className="text-[14px] font-[400] text-black">의견 보내기</div>
              </div>
              <div className="grid place-items-center">
                <img src={RightArrow} alt="" className="w-2 h-[13px] block opacity-75" />
              </div>
            </button>

            <button
              type="button"
              onClick={goWithdrawal}
              aria-label="회원 탈퇴"
              className="w-full border-0 bg-transparent cursor-pointer flex items-center justify-between gap-3 active:translate-y-[0.5px]">
              <div className="flex items-center gap-2">
                <div className="text-[14px] font-[400] text-error">회원 탈퇴</div>
              </div>
              <div className="grid place-items-center">
                <img src={RightArrow} alt="" className="w-2 h-[13px] block opacity-75" />
              </div>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
