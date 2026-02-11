type Props = {
  pw: string;
  pw2: string;
  setPw: (v: string) => void;
  setPw2: (v: string) => void;
  showPw: boolean;
  showPw2: boolean;
  toggleShowPw: () => void;
  toggleShowPw2: () => void;
  eyeOpenSrc: string;
  eyeClosedSrc: string;
  canSubmit: boolean;
  onSubmit: () => void;
};

export default function StepNewPassword({
  pw,
  pw2,
  setPw,
  setPw2,
  showPw,
  showPw2,
  toggleShowPw,
  toggleShowPw2,
  eyeOpenSrc,
  eyeClosedSrc,
  canSubmit,
  onSubmit,
}: Props) {
  return (
    <>
      <div className="flex flex-col gap-2 w-full items-center">
        <div
          className={[
            'w-[335px] max-w-full h-12 rounded-[8px] bg-white px-[14px] flex items-center',
            pw.length > 0 ? 'border-2 border-primary-500' : 'border-2 border-gray-100',
          ].join(' ')}>
          <div className="w-full grid grid-cols-[1fr_34px] items-center gap-2">
            <input
              type={showPw ? 'text' : 'password'}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="비밀번호"
              aria-label="새 비밀번호"
              className="
                w-full border-0 outline-none bg-transparent
                text-[16px] font-[400]
                text-gray-600
                placeholder:text-gray-600
                placeholder:font-[400]
              "
            />

            <button
              type="button"
              aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
              onClick={toggleShowPw}
              className="w-[34px] h-[34px] grid place-items-center border-0 bg-transparent p-0 cursor-pointer">
              <img
                src={showPw ? eyeOpenSrc : eyeClosedSrc}
                alt=""
                aria-hidden
                className="w-[24px] h-[24px] block opacity-80"
              />
            </button>
          </div>
        </div>

        <div className="text-[14px] font-[400] text-gray-600 pr-[2px] text-end w-full max-w-[335px]">
          영문과 숫자 조합, 8-12자리
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full items-center">
        <div
          className={[
            'w-[335px] max-w-full h-12 rounded-[8px] bg-white px-[14px] flex items-center',
            pw2.length > 0 ? 'border-2 border-primary-500' : 'border-2 border-gray-100',
          ].join(' ')}>
          <div className="w-full grid grid-cols-[1fr_34px] items-center gap-2">
            <input
              type={showPw2 ? 'text' : 'password'}
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              placeholder="비밀번호 확인"
              aria-label="새 비밀번호 확인"
              className="
                w-full border-0 outline-none bg-transparent
                text-[16px] font-[400]
                text-gray-600
                placeholder:text-gray-600
                placeholder:font-[400]
              "
            />

            <button
              type="button"
              aria-label={showPw2 ? '비밀번호 확인 숨기기' : '비밀번호 확인 보기'}
              onClick={toggleShowPw2}
              className="w-[34px] h-[34px] grid place-items-center border-0 bg-transparent p-0 cursor-pointer">
              <img
                src={showPw2 ? eyeOpenSrc : eyeClosedSrc}
                alt=""
                aria-hidden
                className="w-[24px] h-[24px] block opacity-80"
              />
            </button>
          </div>
        </div>
      </div>

      <button
        type="button"
        disabled={!canSubmit}
        onClick={onSubmit}
        className={[
          'mt-12 w-full h-[52px] rounded-[6px] border-0 text-[16px] font-[500] transition',
          canSubmit
            ? 'cursor-pointer bg-[var(--color-primary-500)] text-white'
            : 'cursor-default bg-[var(--color-gray-400)] text-white',
        ].join(' ')}>
        완료
      </button>
    </>
  );
}
