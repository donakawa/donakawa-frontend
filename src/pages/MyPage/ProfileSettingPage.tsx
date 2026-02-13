import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import type { HeaderControlContext } from '@/layouts/ProtectedLayout';
import { getMe, pickPrimaryProvider } from '@/apis/auth';

import RightArrow from '@/assets/arrow_right.svg';
import CheckIcon from '@/assets/circle_check.svg';

type ConnectedProvider = 'google' | 'none';

type SettingProfile = {
  email: string;
  connectedProvider: ConnectedProvider;
  hasPassword: boolean;
};

const DEFAULT_PROFILE: SettingProfile = {
  email: '',
  connectedProvider: 'none',
  hasPassword: true,
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
        const me = await getMe();

        if (!mounted) return;

        const primary = pickPrimaryProvider(me.providers);
        const connectedProvider: ConnectedProvider = primary === 'google' ? 'google' : 'none';
        const hasPassword =
          typeof (me as { hasPassword?: unknown }).hasPassword === 'boolean'
            ? (me as { hasPassword: boolean }).hasPassword
            : true;

        setProfile({
          email: me.email,
          connectedProvider,
          hasPassword,
        });
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

  const goNickname = () => navigate('/mypage/setting/nickname');
  const goPassword = () => navigate('/mypage/setting/password');
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
              className="w-full border-0 bg-transparent cursor-pointer flex items-center justify-between gap-3 active:translate-y-[0.5px]">
              <div className="text-[14px] font-[400] text-black">닉네임 변경</div>
              <img src={RightArrow} alt="" className="w-2 h-[13px] block opacity-75" />
            </button>

            <button
              type="button"
              onClick={goPassword}
              className="w-full border-0 bg-transparent cursor-pointer flex items-center justify-between gap-3 active:translate-y-[0.5px]">
              <div className="text-[14px] font-[400] text-black">
                {profile.hasPassword ? '비밀번호 변경' : '비밀번호 설정'}
              </div>
              <img src={RightArrow} alt="" className="w-2 h-[13px] block opacity-75" />
            </button>

            <button
              type="button"
              aria-label="소셜 연동"
              className="w-full border-0 bg-transparent cursor-pointer flex items-center justify-between gap-3 active:translate-y-[0.5px]">
              <div className="flex items-center gap-2">
                <div className="text-[14px] font-[400] text-black">소셜 연동</div>

                <div className="flex items-center gap-2">
                  {profile.connectedProvider === 'google' ? (
                    <img src={CheckIcon} alt="연동됨" className="w-4 h-4 mt-[3px] block" />
                  ) : (
                    <div aria-hidden className="w-5 h-5" />
                  )}
                  <div className="text-[13px] font-[400] text-gray-600">{profile.email || ''}</div>
                </div>
              </div>

              <img src={RightArrow} alt="" className="w-2 h-[13px] block opacity-75" />
            </button>
          </div>
        </section>

        {/* 고객지원 */}
        <section className="flex flex-col gap-[10px]">
          <div className="text-[12px] font-[400] text-gray-600 pl-[2px]">고객지원</div>

          <div className="rounded-[20px] bg-white shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col gap-[15px] px-4 py-[18px]">
            <a
              href="https://honored-maraca-63d.notion.site/2ff788909b8d80158057fa727e7c7c81"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="이용약관"
              className="w-full border-0 bg-transparent cursor-pointer flex items-center justify-between gap-3 active:translate-y-[0.5px]">
              <div className="text-[14px] font-[400] text-black">이용약관</div>
              <img src={RightArrow} alt="" className="w-2 h-[13px] block opacity-75" />
            </a>

            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSc-REPQjPA0QxHmvytaIiydk8gZAJuR3dJax4ZDrm9X5_Hz9Q/viewform"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="의견 보내기"
              className="w-full border-0 bg-transparent cursor-pointer flex items-center justify-between gap-3 active:translate-y-[0.5px]">
              <div className="text-[14px] font-[400] text-black">의견 보내기</div>
              <img src={RightArrow} alt="" className="w-2 h-[13px] block opacity-75" />
            </a>

            <button
              type="button"
              onClick={goWithdrawal}
              className="w-full border-0 bg-transparent cursor-pointer flex items-center justify-between gap-3 active:translate-y-[0.5px]">
              <div className="text-[14px] font-[400] text-error">회원 탈퇴</div>
              <img src={RightArrow} alt="" className="w-2 h-[13px] block opacity-75" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
