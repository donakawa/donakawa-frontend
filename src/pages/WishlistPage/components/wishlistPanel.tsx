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
        'flex-1 min-h-0 flex flex-col',
        
        editMode ? 'bg-[color:var(--color-gray-100)]' : 'bg-[color:var(--color-secondary-100)]',
        'rounded-t-[20px]',
        'shadow-[0_0_4px_rgba(0,0,0,0.25)]',
        'overflow-hidden',
        'relative',
      ].join(' ')}
    >
      <div className="px-[16px] pt-[16px] flex-1 flex flex-col min-h-0">
        {children}
      </div>
      
      {bottomPaddingPx > 0 && (
        <div style={{ height: bottomPaddingPx }} className="shrink-0" />
      )}
    </section>
  );
}