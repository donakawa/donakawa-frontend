import { useQuery } from '@tanstack/react-query';
import { getHomeAiComment, getHomeSpend } from '@/apis/HomePage/home';
import { getBudget } from '@/apis/BudgetPage/budget';
import { getHistoryItems } from '@/apis/ReportPage/review';

export const useHomePageData = () => {
  const { data: aiData } = useQuery({
    queryKey: ['home', 'ai-comment'],
    queryFn: getHomeAiComment,
  });

  const { data: spendData } = useQuery({
    queryKey: ['home', 'spend'],
    queryFn: getHomeSpend,
  });

  const { data: budgetData } = useQuery({
    queryKey: ['budget', 'my-goal'],
    queryFn: getBudget,
    retry: false,
  });

  const { data: reviewItems } = useQuery({
    queryKey: ['history', 'items', 'not-written'],
    queryFn: () => getHistoryItems({ reviewStatus: 'NOT_WRITTEN' }),
  });

  const totalSpend = spendData?.totalSpend || 0;
  const remainingBudget = spendData?.remainingBudget || 0;
  const totalAmount = totalSpend + remainingBudget;
  const spendRate = totalAmount === 0 ? 0 : Math.round((totalSpend / totalAmount) * 100);

  return {
    aiData,
    budgetData,
    reviewItems,
    spendStats: { totalSpend, remainingBudget, spendRate },
    isPositive: aiData?.type !== 'negative',
    comment: aiData?.comment || '소비 내역을 분석하고 있어요...',
  };
};
