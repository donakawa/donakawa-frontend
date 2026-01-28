import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { NicknameViewState } from '@/types/MyPage/mypage';

import LeftArrow from '@/assets/arrow_left(gray).svg';
import CheckIcon from '@/assets/check_blue.svg';
import ErrorIcon from '@/assets/check_red.svg';

const MAX_LEN = 10;

export default function NicknameSettingPage() {
  const navigate = useNavigate();

  // 실제 유저 닉네임으로 교체하기!
  const originalNickname = useMemo(() => '원래', []);

  const [value, setValue] = useState<string>('');
  const [viewState, setViewState] = useState<NicknameViewState>('idle');

  const toastTimer = useRef<number | null>(null);

  const length = value.length;
  const trimmed = value.trim();

  const isEmpty = trimmed.length === 0;
  const isOver = length > MAX_LEN;
  const isSame = trimmed === originalNickname;

  const derivedState: NicknameViewState = viewState === 'done' ? 'done' : isEmpty ? 'idle' : isOver ? 'over' : 'ok';

  const canSubmit = derivedState === 'ok' && !isSame;

  const onBack = () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    navigate(-1);
  };

  const onChange = (v: string) => {
    setValue(v);
    if (viewState === 'done') setViewState('idle');
  };

  const onSubmit = () => {
    if (!canSubmit) return;

    setViewState('done');

    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      navigate(-1);
    }, 2000);
  };

  const inputBorderClass =
    derivedState === 'ok'
      ? 'border-1.5 border-primary-500'
      : derivedState === 'over'
        ? 'border-1.5 border-error'
        : 'border border-black/10';

  const counterTextClass =
    derivedState === 'ok' ? 'text-info' : derivedState === 'over' ? 'text-error' : 'text-black/35';

  return (
    <div className="w-full min-h-screen bg-white text-black">
      <header className="h-[64px] px-4 pt-[10px] grid grid-cols-[40px_1fr_40px] items-center">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={onBack}
          className="w-10 h-10 grid place-items-center border-0 bg-transparent p-0 cursor-pointer">
          <img src={LeftArrow} alt="" className="w-3 h-[22px] block" />
        </button>

        <h1 className="m-0 text-center text-[20px] font-[600]">닉네임 변경</h1>

        <div aria-hidden className="w-10 h-10" />
      </header>

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
            placeholder={originalNickname}
            aria-label="닉네임 입력"
            className="w-full border-0 outline-none bg-transparent text-[16px] font-[400] text-black placeholder:text-black/70"
          />
        </div>

        <div className="mt-2 flex justify-end items-center gap-2" aria-label="닉네임 글자수">
          {derivedState === 'ok' || derivedState === 'over' ? (
            <img src={derivedState === 'over' ? ErrorIcon : CheckIcon} alt="" aria-hidden className="w-5 h-5 block" />
          ) : (
            <div aria-hidden className="w-5 h-5" />
          )}

          <div className={['text-[14px] font-[400]', counterTextClass].join(' ')}>
            {length}/{MAX_LEN}
          </div>
        </div>

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

        {derivedState === 'done' && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-6 w-[calc(100%-32px)] max-w-[335px] bg-white border-[1.5px] border-primary-brown-400 shadow-[0px_0px_4px_0px_rgba(97,69,64,1)] rounded-[50px] px-[18px] py-[10px] text-[12px] font-[400]">
            닉네임 변경이 완료되었습니다.
          </div>
        )}
      </main>
    </div>
  );
}
