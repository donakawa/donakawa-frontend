export default function WishMenuButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "w-full py-[22px] text-left",
        "text-[16px] font-medium leading-[150%] text-[#7A5751]",
        "bg-white active:bg-gray-50",
        "active:scale-[0.98] transition-all duration-100",
        "rounded-lg px-2",
      ].join(" ")}
    >
      {label}
    </button>
  );
}