type ToastProps = {
  message: string;
};

export default function Toast({ message }: ToastProps) {
  return (
    <div
      className="
        absolute left-1/2 -translate-x-1/2 bottom-[40px]
        flex items-center justify-center
        w-[335px] h-[38px]
        px-[18px] py-[10px]
        
        bg-white
        border-[1.5px] border-[color:var(--color-primary-brown-400)]
        rounded-full
        shadow-[0_0_4px_0_rgba(97,69,64,1)]
        z-[110]
      "
    >
      <p 
        className="
          w-[299px]
          text-[12px] font-normal text-black
          leading-[150%] text-left
        "
      >
        {message}
      </p>
    </div>
  );
}