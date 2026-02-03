import { useMemo, useRef } from 'react';

const CODE_LEN = 6;

type Props = {
  code: string;
  setCode: (v: string) => void;
  timerText: string;
  canResend: boolean;
  onResend: () => void;
  onVerify: () => void;
};

export default function StepCode({ code, setCode, timerText, canResend, onResend, onVerify }: Props) {
  const hiddenRef = useRef<HTMLInputElement | null>(null);

  const digits = useMemo(() => {
    const only = code.replace(/\D/g, '').slice(0, CODE_LEN);
    const arr = only.split('');
    return Array.from({ length: CODE_LEN }, (_, i) => arr[i] ?? '');
  }, [code]);

  const filledCount = digits.filter(Boolean).length;
  const canVerify = filledCount === CODE_LEN;

  const focus = () => hiddenRef.current?.focus();

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col">
          <div onClick={focus} role="group" aria-label="인증번호 입력" className="flex justify-center gap-[10px]">
            {digits.map((d, idx) => {
              const filled = Boolean(d);

              return (
                <div
                  key={idx}
                  className={[
                    'w-[45px] h-[55px] rounded-[10px] grid place-items-center',
                    'text-[24px] font-[700]',
                    'shadow-[0px_0px_3px_rgba(0,0,0,0.08)]',
                    filled
                      ? 'bg-primary-brown-300 text-white border border-primary-brown-400'
                      : 'bg-white text-transparent border border-black/12',
                  ].join(' ')}>
                  {d}
                </div>
              );
            })}
          </div>

          <div className="text-[14px] font-[400] text-end pt-2 pr-1 text-primary-brown-300">{timerText}</div>
        </div>

        <input
          ref={hiddenRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          inputMode="numeric"
          autoFocus
          aria-label="인증번호 입력"
          className="absolute opacity-0 pointer-events-none w-px h-px"
        />

        {!canResend ? (
          <div className="text-center text-[14px] font-[400]">{timerText} 후 재전송 가능</div>
        ) : (
          <button
            type="button"
            onClick={onResend}
            className="border-0 bg-transparent cursor-pointer p-0 text-center text-[14px] font-[400] text-info underline">
            인증번호 재전송
          </button>
        )}
      </div>

      <button
        type="button"
        disabled={!canVerify}
        onClick={onVerify}
        className={[
          'mt-12 w-full h-[52px] rounded-[6px] border-0 text-[16px] font-[500] transition',
          canVerify ? 'cursor-pointer bg-primary-400 text-white' : 'cursor-default bg-gray-400 text-white',
        ].join(' ')}>
        확인
      </button>
    </>
  );
}
