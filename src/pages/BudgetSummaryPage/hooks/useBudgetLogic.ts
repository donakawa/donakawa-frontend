import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBudget, updateBudget } from '@/apis/BudgetPage/budget';
import { type HeaderControlContext } from '@/layouts/ProtectedLayout';

export interface BudgetData {
  income: number;
  fixedCost: number;
  savingCost: number;
  strategy: number;
  shoppingTarget: number;
  renewalDay: number;
}

export const useBudgetLogic = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { setTitle, setRightAction, setCustomBack } = useOutletContext<HeaderControlContext>();

  const [isEdit, setIsEdit] = useState(false);
  const [localData, setLocalData] = useState<BudgetData>({
    income: 0,
    fixedCost: 0,
    savingCost: 0,
    strategy: 1,
    shoppingTarget: 0,
    renewalDay: 1,
  });

  // 조회
  const { data: serverData } = useQuery({
    queryKey: ['budget', 'my-goal'],
    queryFn: getBudget,
    staleTime: 0,
  });

  useEffect(() => {
    if (serverData) {
      setLocalData({
        income: serverData.monthlyIncome,
        fixedCost: serverData.fixedExpense,
        savingCost: serverData.monthlySaving,
        strategy: serverData.spendStrategy,
        shoppingTarget: serverData.shoppingBudget,
        renewalDay: serverData.incomeDate,
      });
    }
  }, [serverData]);

  // 헤더 제어
  useEffect(() => {
    setTitle('목표 예산 설정');

    if (isEdit) {
      setCustomBack(() => () => setIsEdit(false));
      setRightAction(null);
    } else {
      setCustomBack(() => navigate('/home', { replace: true }));
      setRightAction({
        rightNode: '수정하기',
        onClick: () => setIsEdit(true),
      });
    }

    return () => {
      setTitle('');
      setRightAction(null);
    };
  }, [isEdit, setRightAction, setCustomBack, navigate, setTitle]);

  // 저장 Mutation
  const { mutate: saveBudget } = useMutation({
    mutationFn: updateBudget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', 'my-goal'] });
      setIsEdit(false);
    },
    onError: () => alert('저장에 실패했습니다. 다시 시도해주세요.'),
  });

  // 핸들러
  const handleSave = () => {
    saveBudget({
      monthlyIncome: localData.income,
      fixedExpense: localData.fixedCost,
      monthlySaving: localData.savingCost,
      shoppingBudget: localData.shoppingTarget,
      incomeDate: localData.renewalDay,
    });
  };

  const handleChange = (key: keyof BudgetData, value: string) => {
    const numValue = Number(value.replace(/,/g, ''));
    if (!isNaN(numValue)) {
      setLocalData((prev) => ({ ...prev, [key]: numValue }));
    }
  };

  return {
    isEdit,
    data: localData,
    handleChange,
    handleSave,
    setIsEdit,
  };
};
