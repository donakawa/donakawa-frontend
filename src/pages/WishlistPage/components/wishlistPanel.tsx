import React from 'react';

type Props = {
  children: React.ReactNode;
  editMode: boolean;
  bottomPaddingPx?: number;
};

export default function WishlistPanel({
  children,
  editMode,
  bottomPaddingPx = 96,
}: Props) {
  return (
    <section
      className={[
        'w-[375px] h-[570px] mt-[221px] mx-auto',
        'flex flex-col',
        editMode ? 'bg-[color:var(--color-gray-100)]' : 'bg-[color:var(--color-secondary-100)]',
        'rounded-t-[20px]',
        'shadow-[0_0_4px_rgba(0,0,0,0.25)]',
        'overflow-hidden',
      ].join(' ')}
    >
      <div className="flex-1 min-h-0 flex flex-col gap-[16px] p-[20px] pb-[16px]">
        {children}
      </div>

      {bottomPaddingPx > 0 && (
        <div style={{ height: bottomPaddingPx }} className="shrink-0" />
      )}
    </section>
  );
}
