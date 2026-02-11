interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  maxLength?: number;
  type?: string;
  multiline?: boolean;
}

export default function RegistrationInput({ value, onChange, placeholder, maxLength, type = 'text', multiline = false }: Props) {
  const hasValue = value.length > 0;
  const isExpanded = multiline && value.length > 15;

  //글자 제한
  const handleChange = (val: string) => {
    if (maxLength && val.length > maxLength) {
      onChange(val.slice(0, maxLength));
    } else {
      onChange(val);
    }
  };

  const baseClasses = [
    'w-[335px] px-[18px] py-[12px] rounded-[6px] text-[16px] outline-none transition-all border-[1.5px] leading-[150%]',
    hasValue ? 'border-primary-500 shadow-[0_0_4px_#68AB6E] bg-white text-black' : 'border-transparent bg-white shadow-[0_0_4px_rgba(0,0,0,0.25)] placeholder:text-gray-600',
  ].join(' ');

  return (
    <div className="relative w-[335px]">
      {multiline ? (
        <textarea value={value} onChange={(e) => handleChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} style={{ height: isExpanded ? '72px' : '48px' }} className={[baseClasses, 'resize-none overflow-hidden block pr-[60px] break-all'].join(' ')} />
      ) : (
        <input type={type} value={value} onChange={(e) => handleChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} className={[baseClasses, 'h-[48px]'].join(' ')} />
      )}
      {maxLength && (
        <div className={`absolute right-[18px] ${isExpanded ? 'bottom-3' : 'top-1/2 -translate-y-1/2'} flex gap-1 text-[14px] leading-[150%] text-gray-600`}>
          <span>{value.length}</span><span>/ {maxLength}</span>
        </div>
      )}
    </div>
  );
}