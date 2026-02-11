import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';

import type { HeaderControlContext } from '@/layouts/ProtectedLayout';
import type { AimKeyword } from '@/types/MyPage/mypage';
import type { ApiResponse, MeData } from '@/apis/auth';
import { instance } from '@/apis/axios';

import CloseIcon from '@/assets/close.svg';

const MAX_LEN = 10;

type UiState = 'idle' | 'loadingMe' | 'saving' | 'done' | 'error';

type PatchGoalData = {
  id: string;
  goal: string;
  updatedAt: string;
};

export default function AimPage() {
  const { setTitle } = useOutletContext<HeaderControlContext>();

  useEffect(() => {
    setTitle('목표');
    return () => setTitle('');
  }, [setTitle]);

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

  const [currentGoal, setCurrentGoal] = useState<string>('');

  const [confirmedGoal, setConfirmedGoal] = useState<string>('');

  const [uiState, setUiState] = useState<UiState>('idle');
  const [helperText, setHelperText] = useState<string>('');

  const isConfirmed = confirmedGoal.length > 0;

  const hasGoalDraft = isConfirmed || !!selected || text.trim().length > 0;

  const draftGoal = useMemo(() => {
    const t = text.trim();
    if (t.length > 0) return t;
    return selected?.label ?? '';
  }, [selected, text]);

  const canConfirm = draftGoal.length > 0 && draftGoal.length <= MAX_LEN && uiState !== 'saving';
  const canComplete = confirmedGoal.length > 0 && uiState !== 'saving';

  useEffect(() => {
    let mounted = true;

    const fetchMe = async () => {
      try {
        setUiState('loadingMe');
        const res = await instance.get<ApiResponse<MeData>>('/auth/me');

        if (!mounted) return;

        if (res.data.resultType === 'SUCCESS') {
          const me = res.data.data;
          setCurrentGoal(me.goal ?? '');
          if (me.goal && me.goal.trim().length > 0) {
            setConfirmedGoal(me.goal);
          }
        } else {
          setCurrentGoal('');
        }
      } catch {
        if (!mounted) return;
        setCurrentGoal('');
      } finally {
        if (!mounted) return;
        setUiState('idle');
      }
    };

    fetchMe();

    return () => {
      mounted = false;
    };
  }, []);

  const onChangeText = (v: string) => {
    if (isConfirmed) return;
    if (selected) setSelected(null);
    setText(v.slice(0, MAX_LEN));
    if (helperText) setHelperText('');
  };

  const toggleKeyword = (k: AimKeyword) => {
    if (isConfirmed) return;
    setSelected((prev) => (prev?.id === k.id ? null : k));
    setText('');
    if (helperText) setHelperText('');
  };

  const removeKeyword = () => {
    if (isConfirmed) return;
    setSelected(null);
  };

  const onConfirm = async () => {
    if (!canConfirm || isConfirmed) return;

    const newGoal = draftGoal.trim();

    if (newGoal.length === 0) {
      setHelperText('목표를 입력해주세요.');
      return;
    }
    if (newGoal.length > MAX_LEN) {
      setHelperText('목표는 10자 이하만 가능합니다.');
      return;
    }
    if (currentGoal && newGoal === currentGoal) {
      setHelperText('현재 목표와 동일합니다.');
      return;
    }

    try {
      setUiState('saving');
      setHelperText('');

      const res = await instance.patch<ApiResponse<PatchGoalData>>('/auth/profile/goal', {
        newGoal,
      });

      if (res.data.resultType === 'SUCCESS') {
        setConfirmedGoal(res.data.data.goal);
        setCurrentGoal(res.data.data.goal);
        setUiState('done');
        return;
      }

      const code = res.data.error.errorCode;

      if (code === 'U008') {
        setHelperText('현재 목표와 동일합니다.');
      } else if (code === 'U004') {
        setHelperText('목표는 10자 이하만 가능합니다.');
      } else if (code === 'A004' || code === 'A005' || code === 'A006') {
        setHelperText('로그인이 필요합니다. 다시 로그인해주세요.');
      } else if (code === 'U001') {
        setHelperText('존재하지 않는 계정입니다.');
      } else {
        setHelperText(res.data.error.reason || '요청 처리 중 오류가 발생했습니다.');
      }

      setUiState('error');
    } catch {
      setUiState('error');
      setHelperText('요청 처리 중 오류가 발생했습니다.');
    } finally {
      setUiState((prev) => (prev === 'done' ? 'done' : 'idle'));
    }
  };

  const onComplete = () => {
    if (!canComplete) return;
    navigate(-1);
  };

  const confirmDisabled = !canConfirm || isConfirmed || uiState === 'loadingMe';
  const completeDisabled = !canComplete || uiState === 'loadingMe';

  return (
    <div className="w-full min-h-screen bg-white text-black">
      <main className="px-4 pt-[18px] pb-6">
        <p className="m-0 mb-[10px] text-[16px] text-gray-600">선택한 목표를 얼마나 달성했는지 보여줘요. (선택)</p>

        <h2 className="m-0 mb-[6px] text-[19px] font-[600]">소비 절약으로 이루고 싶은 목표가 있나요?</h2>

        <p className="m-0 mb-[18px] text-[16px]">(하나만 선택해 주세요.)</p>

        <div className="grid grid-cols-[1fr_52px] gap-2 items-start mb-2">
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
                disabled={isConfirmed || uiState === 'loadingMe'}
                className="flex-1 min-w-[90px] h-[30px] border-0 outline-none bg-transparent p-0 m-0 text-[14px] text-black placeholder:text-gray-600 disabled:text-black"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={[
              'h-[52px] w-[52px] rounded-[10px] border-0 p-0 text-[16px] font-[500]',
              !confirmDisabled
                ? 'bg-primary-brown-300 text-white cursor-pointer'
                : 'bg-gray-100 text-white cursor-not-allowed',
            ].join(' ')}>
            확정
          </button>
        </div>

        {helperText && <p className="m-0 mb-3 text-[12px] text-error">{helperText}</p>}

        <p className="m-0 mb-[10px] text-[12px] text-gray-600">추천 키워드</p>

        <div className="flex flex-wrap gap-[10px]">
          {keywords.map((k) => {
            const isSelected = selected?.id === k.id;
            const disabled = isConfirmed || uiState === 'loadingMe';

            return (
              <button
                key={k.id}
                type="button"
                disabled={disabled}
                onClick={() => toggleKeyword(k)}
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
            disabled={completeDisabled}
            className={[
              'mt-12 w-full h-[52px] rounded-[6px] border-0 text-[16px] font-[500] transition',
              !completeDisabled ? 'cursor-pointer bg-primary-500 text-white' : 'cursor-default bg-gray-400 text-white',
            ].join(' ')}>
            완료
          </button>
        </div>
      </main>
    </div>
  );
}
