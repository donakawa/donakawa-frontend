import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';

import type { HeaderControlContext } from '@/layouts/ProtectedLayout';
import { getMe } from '@/apis/auth';

import RightArrow from '@/assets/arrow_right.svg';
import CheckIcon from '@/assets/circle_check.svg';

type SettingProfile = {
  email: string;
  hasPassword: boolean;
  connected: {
    google: boolean;
    kakao: boolean;
  };
};

const DEFAULT_PROFILE: SettingProfile = {
  email: '',
  hasPassword: true,
  connected: { google: false, kakao: false },
};

function getConnectErrorMessage(code: string) {
  switch (code) {
    case 'A004':
      return '인증 정보가 없습니다. 다시 로그인해 주세요.';
    case 'A018':
      return '연동 세션이 만료되었습니다. 다시 시도해 주세요.';
    case 'A019':
      return '계정 이메일이 일치하지 않습니다. 같은 이메일로 연동해 주세요.';
    case 'U001':
      return '사용자 정보를 찾을 수 없습니다.';
    case 'U013':
      return '이미 연동된 소셜 계정입니다.';
    default:
      return `연동에 실패했어요. (error: ${code})`;
  }
}

export default function MyPageSettingPage() {
  const { setTitle } = useOutletContext<HeaderControlContext>();
  const navigate = useNavigate();
  const location = useLocation();

  const [profile, setProfile] = useState<SettingProfile>(DEFAULT_PROFILE);

  const API_BASE = useMemo(() => {
    const v = import.meta.env.VITE_API_URL as string | undefined;
    return (v ?? '').replace(/\/+$/, '');
  }, []);

  useEffect(() => {
    setTitle('설정');
    return () => setTitle('');
  }, [setTitle]);

  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    const connect = qs.get('connect');
    const provider = qs.get('provider');
    const error = qs.get('error');

    if (!connect) return;

    if (connect === 'success' && provider) {
      window.alert(`${provider === 'google' ? '구글' : provider === 'kakao' ? '카카오' : provider} 연동이 완료됐어요!`);
      navigate('/mypage/setting', { replace: true });
      return;
    }

    if (connect === 'failed') {
      const msg = getConnectErrorMessage(error ?? 'UNKNOWN');
      window.alert(msg);
      navigate('/mypage/setting', { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    let mounted = true;

    const fetchMe = async () => {
      try {
        const me = await getMe();
        if (!mounted) return;

        const providers = (me.providers ?? []).map((p) => String(p).toLowerCase());
        const connectedGoogle = providers.includes('google');
        const connectedKakao = providers.includes('kakao');

        const hasPassword =
          typeof (me as { hasPassword?: unknown }).hasPassword === 'boolean'
            ? (me as { hasPassword: boolean }).hasPassword
            : true;

        setProfile({
          email: me.email,
          hasPassword,
          connected: {
            google: connectedGoogle,
            kakao: connectedKakao,
          },
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

  const startConnect = (provider: 'google' | 'kakao') => {
    if (provider === 'google' && profile.connected.google) return;
    if (provider === 'kakao' && profile.connected.kakao) return;

    const url = `${API_BASE}/auth/connect/${provider}`;
    window.location.assign(url);
  };

  const ConnectedBadge = ({ connected }: { connected: boolean }) => (
    <span className="flex items-center gap-2">
      {connected ? (
        <img src={CheckIcon} alt="연동됨" className="w-4 h-4 mt-[2px] block" />
      ) : (
        <span className="w-4 h-4" />
      )}
    </span>
  );

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
              aria-label="구글 연동"
              onClick={() => startConnect('google')}
              disabled={profile.connected.google}
              className={[
                'w-full border-0 bg-transparent flex items-center justify-between gap-3',
                profile.connected.google
                  ? 'cursor-not-allowed opacity-60'
                  : 'cursor-pointer active:translate-y-[0.5px]',
              ].join(' ')}>
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-[14px] font-[400] text-black">구글 연동</div>
                  <ConnectedBadge connected={profile.connected.google} />
                </div>

                {profile.connected.google && (
                  <div className="text-[13px] font-[400] text-gray-600 truncate max-w-[180px] text-right">
                    {profile.email}
                  </div>
                )}
              </div>

              <img src={RightArrow} alt="" className="w-2 h-[13px] block opacity-75" />
            </button>

            <button
              type="button"
              aria-label="카카오 연동"
              onClick={() => startConnect('kakao')}
              disabled={profile.connected.kakao}
              className={[
                'w-full border-0 bg-transparent flex items-center justify-between gap-3',
                profile.connected.kakao ? 'cursor-not-allowed opacity-60' : 'cursor-pointer active:translate-y-[0.5px]',
              ].join(' ')}>
              <div className="flex items-center justify-between w-full gap-3">
                <div className="flex items-center gap-2">
                  <div className="text-[14px] font-[400] text-black">카카오 연동</div>
                  <ConnectedBadge connected={profile.connected.kakao} />
                </div>

                {profile.connected.kakao && (
                  <div className="text-[13px] font-[400] text-gray-600 truncate max-w-[180px] text-right">
                    {profile.email}
                  </div>
                )}
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
