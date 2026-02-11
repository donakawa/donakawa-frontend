import EyeOpen from '@/assets/visible_eye.svg';
import EyeClosed from '@/assets/invisible_eye.svg';

type Props = {
  currentPw: string;
  setCurrentPw: (v: string) => void;
  showPw: boolean;
  toggleShowPw: () => void;
  canSubmit: boolean;
  onSubmit: () => void;
};

export default function StepCurrentPassword({
  currentPw,
  setCurrentPw,
  showPw,
  toggleShowPw,
  canSubmit,
  onSubmit,
}: Props) {
  return (
    <>
      <div className="flex flex-col gap-2 w-full items-center">
        <div
          className={[
            'w-[335px] max-w-full h-12 rounded-[8px] bg-white px-[14px] flex items-center',
            currentPw.length > 0 ? 'border-2 border-primary-500' : 'border-2 border-gray-100',
          ].join(' ')}>
          <div className="w-full grid grid-cols-[1fr_34px] items-center gap-2">
            <input
              type={showPw ? 'text' : 'password'}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="비밀번호"
              aria-label="현재 비밀번호"
              className="w-full border-0 outline-none bg-transparent text-[16px] font-[400] text-gray-600 placeholder:text-gray-600 placeholder:font-[400]"
            />

            <button
              type="button"
              aria-label="비밀번호 보기"
              onClick={toggleShowPw}
              className="w-[34px] h-[34px] grid place-items-center border-0 bg-transparent p-0 cursor-pointer">
              <img
                src={showPw ? EyeOpen : EyeClosed}
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
          canSubmit ? 'cursor-pointer bg-primary-500 text-white' : 'cursor-default bg-gray-400 text-white',
        ].join(' ')}>
        완료
      </button>
    </>
  );
}
