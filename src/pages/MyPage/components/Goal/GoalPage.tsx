import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import type { AimKeyword } from '@/types/MyPage/mypage';

import LeftArrow from '@/assets/arrow_left.svg';
import CloseIcon from '@/assets/close.svg';

const MAX_LEN = 10;

export default function AimPage() {
  const navigate = useNavigate();

  const keywords: AimKeyword[] = useMemo(
    () => [
      { id: 'travel', label: '여행 가기' },
      { id: 'stock', label: '주식투자' },
      { id: 'save', label: '저축' },
      { id: 'self', label: '자기개발' },
      { id: 'laptop', label: '노트북 구매' },
      { id: 'car', label: '차량 구매' },
      { id: 'parents', label: '부모님 선물' },
    ],
    [],
  );

  const [selected, setSelected] = useState<AimKeyword | null>(null);
  const [text, setText] = useState<string>('');

  const [confirmedGoal, setConfirmedGoal] = useState<string>('');
  const isConfirmed = confirmedGoal.length > 0;

  const hasGoalDraft = isConfirmed || !!selected || text.trim().length > 0;

  const draftGoal = useMemo(() => {
    const t = text.trim();
    if (t.length > 0) return t;
    return selected?.label ?? '';
  }, [selected, text]);

  const canConfirm = draftGoal.length > 0 && draftGoal.length <= MAX_LEN;
  const canComplete = confirmedGoal.length > 0;

  const onChangeText = (v: string) => {
    if (selected) setSelected(null);
    setText(v.slice(0, MAX_LEN));
  };

  const toggleKeyword = (k: AimKeyword) => {
    setSelected((prev) => (prev?.id === k.id ? null : k));
    setText('');
  };

  const removeKeyword = () => setSelected(null);

  const onConfirm = () => {
    if (!canConfirm || isConfirmed) return;
    setConfirmedGoal(draftGoal);
  };

  const onComplete = () => {
    if (!canComplete) return;
    navigate(-1);
  };

  return (
    <div className="w-full min-h-screen bg-white text-black">
      <header className="h-[64px] px-4 pt-[10px] grid grid-cols-[40px_1fr_40px] items-center">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => navigate(-1)}
          className="w-10 h-10 border-0 bg-transparent p-0 flex items-center justify-center cursor-pointer">
          <img src={LeftArrow} alt="뒤로가기" className="w-[13px] h-[22px] block" />
        </button>

        <h1 className="m-0 text-center text-[20px] font-[600]">목표</h1>

        <div className="w-[44px] h-[44px]" aria-hidden />
      </header>

      <main className="px-4 pt-[18px] pb-6">
        <p className="m-0 mb-[10px] text-[16px] text-gray-600">선택한 목표를 얼마나 달성했는지 보여줘요. (선택)</p>

        <h2 className="m-0 mb-[6px] text-[19px] font-[600]">소비 절약으로 이루고 싶은 목표가 있나요?</h2>

        <p className="m-0 mb-[18px] text-[16px]">(하나만 선택해 주세요.)</p>

        <div className="grid grid-cols-[1fr_52px] gap-2 items-start mb-4">
          <div
            className={[
              'w-full min-h-[52px] px-3 py-[10px] rounded-[12px] bg-white border-2',
              hasGoalDraft ? 'border-primary-500' : 'border-gray-100',
              'focus-within:border-primary-500',
            ].join(' ')}>
            <div className="flex flex-wrap gap-2 items-center">
              {selected && (
                <button
                  type="button"
                  aria-label={`${selected.label} 삭제`}
                  onClick={removeKeyword}
                  disabled={isConfirmed}
                  className={[
                    'h-[31px] px-[10px] py-[5px] rounded-[100px]',
                    'border-2 border-primary-500 bg-primary-100 text-black',
                    'inline-flex items-center gap-2 text-[14px] font-[600]',
                    isConfirmed ? 'cursor-not-allowed opacity-80' : 'cursor-pointer',
                  ].join(' ')}>
                  <span className="text-[14px] font-[400]">{selected.label}</span>
                  <img src={CloseIcon} alt="" className="w-3 h-3 block" />
                </button>
              )}

              <input
                value={text}
                placeholder={!selected ? '목표를 입력하세요...(10자 이내)' : ''}
                onChange={(e) => onChangeText(e.target.value)}
                disabled={isConfirmed}
                className="flex-1 min-w-[90px] h-[30px] border-0 outline-none bg-transparent p-0 m-0 text-[14px] text-black placeholder:text-gray-600 disabled:text-black"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onConfirm}
            disabled={!canConfirm || isConfirmed}
            className={[
              'h-[52px] w-[52px] rounded-[10px] border-0 p-0 text-[16px] font-[500]',
              canConfirm && !isConfirmed
                ? 'bg-primary-brown-300 text-white cursor-pointer'
                : 'bg-gray-100 text-white cursor-not-allowed',
            ].join(' ')}>
            확정
          </button>
        </div>

        <p className="m-0 mb-[10px] text-[12px] text-gray-600">추천 키워드</p>

        <div className="flex flex-wrap gap-[10px]">
          {keywords.map((k) => {
            const isSelected = selected?.id === k.id;
            const disabled = isConfirmed;

            return (
              <button
                key={k.id}
                type="button"
                disabled={disabled}
                onClick={() => {
                  if (isConfirmed) return;
                  toggleKeyword(k);
                }}
                className={[
                  'h-[31px] max-h-[31px] rounded-[100px] px-[10px] py-[5px] flex items-center text-[14px] font-[400]',
                  'border-2',
                  isSelected ? 'border-primary-500 bg-primary-100' : 'border-gray-100 bg-white',
                  disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
                ].join(' ')}>
                {k.label}
              </button>
            );
          })}
        </div>

        <div className="mt-[18px]">
          <button
            type="button"
            onClick={onComplete}
            disabled={!canComplete}
            className={[
              'mt-12 w-full h-[52px] rounded-[6px] border-0 text-[16px] font-[500] transition',
              canComplete ? 'cursor-pointer bg-primary-500 text-white' : 'cursor-default bg-gray-400 text-white',
            ].join(' ')}>
            완료
          </button>
        </div>
      </main>
    </div>
  );
}
