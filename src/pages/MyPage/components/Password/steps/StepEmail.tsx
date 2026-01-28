type Props = {
  email: string;
  onChangeEmail: (v: string) => void;
  onSend: () => void;
  canSend: boolean;
};

export default function StepEmail({ email, onChangeEmail, onSend, canSend }: Props) {
  return (
    <>
      <div
        className={[
          'w-[335px] max-w-full h-12 rounded-[8px] bg-white px-[14px] flex items-center',
          'border-2 border-gray-100',
        ].join(' ')}>
        <input
          value={email}
          onChange={(e) => onChangeEmail(e.target.value)}
          placeholder="이메일 아이디"
          inputMode="email"
          aria-label="이메일 입력"
          className="
            w-full border-0 outline-none bg-transparent
            text-[16px] font-[400]
            text-black
            placeholder:text-gray-600
            placeholder:font-[400]
          "
        />
      </div>

      <button
        type="button"
        disabled={!canSend}
        onClick={onSend}
        className={[
          'mt-12 w-full h-[52px] rounded-[6px] border-0 text-[16px] font-[500] transition',
          canSend ? 'cursor-pointer bg-primary-400 text-white' : 'cursor-default bg-gray-400 text-white',
        ].join(' ')}>
        인증번호 발송
      </button>
    </>
  );
}
