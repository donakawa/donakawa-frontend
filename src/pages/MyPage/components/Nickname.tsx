import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import type { AxiosError } from 'axios';

import type { HeaderControlContext } from '@/layouts/ProtectedLayout';
import type { ApiResponse, MeData, NicknamePatchData, NicknameUiState } from '@/apis/auth';

import { axiosInstance } from '@/apis/axios';

import CheckIcon from '@/assets/check_blue.svg';
import ErrorIcon from '@/assets/check_red.svg';

const MAX_LEN = 10;

export default function NicknameSettingPage() {
  const { setTitle } = useOutletContext<HeaderControlContext>();
  const navigate = useNavigate();

  useEffect(() => {
    setTitle('닉네임 변경');
    return () => setTitle('');
  }, [setTitle]);

  const [originalNickname, setOriginalNickname] = useState<string>('');
  const [isMeLoading, setIsMeLoading] = useState<boolean>(true);

  const [value, setValue] = useState<string>('');
  const [uiState, setUiState] = useState<NicknameUiState>('idle');
  const [helperText, setHelperText] = useState<string>('');

  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchMe = async () => {
      try {
        setIsMeLoading(true);

        const res = await axiosInstance.get<ApiResponse<MeData>>('/auth/me');

        if (!mounted) return;

        if (res.data.resultType === 'SUCCESS') {
          setOriginalNickname(res.data.data.nickname);
        } else {
          setOriginalNickname('');
        }
      } catch {
        if (!mounted) return;
        setOriginalNickname('');
      } finally {
        if (!mounted) return;
        setIsMeLoading(false);
      }
    };

    fetchMe();
    return () => {
      mounted = false;
    };
  }, []);

  const length = value.length;
  const trimmed = value.trim();

  const isEmpty = trimmed.length === 0;
  const isOver = length > MAX_LEN;
  const isSame = originalNickname.length > 0 && trimmed === originalNickname;

  const computedState: NicknameUiState = useMemo(() => {
    if (uiState === 'done') return 'done';
    if (uiState === 'dup') return 'dup';
    if (uiState === 'auth') return 'auth';
    if (uiState === 'server') return 'server';

    if (isEmpty) return 'idle';
    if (isOver) return 'over';
    if (isSame) return 'same';
    return 'ok';
  }, [uiState, isEmpty, isOver, isSame]);

  const canSubmit = computedState === 'ok';

  const onChange = (v: string) => {
    setValue(v);

    if (uiState !== 'idle') setUiState('idle');
    if (helperText) setHelperText('');
  };

  const showDoneToastAndGoBack = () => {
    setUiState('done');

    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      navigate(-1);
    }, 2000);
  };

  const onSubmit = async () => {
    if (!canSubmit) {
      if (computedState === 'idle') setHelperText('닉네임을 입력해주세요.');
      if (computedState === 'over') setHelperText('닉네임은 10자 이하이어야 합니다.');
      if (computedState === 'same') setHelperText('현재 닉네임과 동일합니다.');
      return;
    }

    try {
      const res = await axiosInstance.patch<ApiResponse<NicknamePatchData>>('/auth/profile/nickname', {
        newNickname: trimmed,
      });

      if (res.data.resultType === 'SUCCESS') {
        setOriginalNickname(res.data.data.nickname);
        showDoneToastAndGoBack();
        return;
      }

      const code = res.data.error.errorCode;

      if (code === 'U009') {
        setUiState('dup');
        setHelperText('이미 사용 중인 닉네임입니다.');
        return;
      }

      if (code === 'U008') {
        setHelperText('현재 닉네임과 동일합니다.');
        return;
      }

      if (code === 'V001') {
        setHelperText('닉네임은 10자 이하이어야 합니다.');
        return;
      }

      if (code === 'A004' || code === 'A005' || code === 'A006') {
        setUiState('auth');
        setHelperText('로그인이 필요합니다. 다시 로그인해주세요.');
        return;
      }

      setUiState('server');
      setHelperText(res.data.error.reason || '요청 처리 중 오류가 발생했습니다.');
    } catch (e) {
      const err = e as AxiosError;

      if (err.response?.status === 401) {
        setUiState('auth');
        setHelperText('로그인이 필요합니다. 다시 로그인해주세요.');
        return;
      }

      setUiState('server');
      setHelperText('요청 처리 중 오류가 발생했습니다.');
    }
  };

  const inputBorderClass =
    computedState === 'ok'
      ? 'border-1.5 border-primary-500'
      : computedState === 'over' || computedState === 'dup' || computedState === 'auth' || computedState === 'server'
        ? 'border-1.5 border-error'
        : 'border border-black/10';

  const counterTextClass =
    computedState === 'ok'
      ? 'text-info'
      : computedState === 'over' || computedState === 'dup'
        ? 'text-error'
        : 'text-black/35';

  const showIcon = computedState === 'ok' || computedState === 'over' || computedState === 'dup';
  const iconSrc = computedState === 'over' || computedState === 'dup' ? ErrorIcon : CheckIcon;

  return (
    <div className="w-full min-h-screen bg-white text-black">
      <main className="pt-[84px] px-4 pb-6">
        <div
          className={[
            'rounded-[6px] bg-white px-[14px] py-3',
            'shadow-[0px_0px_4px_0px_rgba(0,0,0,0.25)]',
            inputBorderClass,
          ].join(' ')}>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={isMeLoading ? '불러오는 중…' : originalNickname || '닉네임 입력'}
            aria-label="닉네임 입력"
            className="w-full border-0 outline-none bg-transparent text-[16px] font-[400] text-black placeholder:text-black/70"
          />
        </div>

        <div className="mt-2 flex justify-end items-center gap-2" aria-label="닉네임 글자수">
          {showIcon ? (
            <img src={iconSrc} alt="" aria-hidden className="w-5 h-5 block" />
          ) : (
            <div aria-hidden className="w-5 h-5" />
          )}

          <div className={['text-[14px] font-[400]', counterTextClass].join(' ')}>
            {length}/{MAX_LEN}
          </div>
        </div>

        {helperText && (
          <div className="mt-2 text-[12px] font-[400] text-error" role="alert">
            {helperText}
          </div>
        )}

        <button
          type="button"
          disabled={!canSubmit}
          onClick={onSubmit}
          className={[
            'mt-12 w-full h-[52px] rounded-[6px] border-0 text-[16px] font-[500]',
            'transition',
            canSubmit ? 'cursor-pointer bg-primary-400 text-white' : 'cursor-default bg-gray-400 text-white',
          ].join(' ')}>
          닉네임 변경
        </button>

        {computedState === 'done' && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-6 w-[calc(100%-32px)] max-w-[335px] bg-white border-[1.5px] border-primary-brown-400 shadow-[0px_0px_4px_0px_rgba(97,69,64,1)] rounded-[50px] px-[18px] py-[10px] text-[12px] font-[400]">
            닉네임 변경이 완료되었습니다.
          </div>
        )}
      </main>
    </div>
  );
}
