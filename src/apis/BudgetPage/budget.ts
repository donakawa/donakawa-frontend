import { instance } from '../axios';

/////////////////////
///* 쇼핑 목표액 *///
/////////////////////
export interface RecommendBudgetRequest {
  monthlyIncome: number;
  fixedExpense?: number;
  monthlySaving?: number;
  spendStrategy: number;
}

interface RecommendBudgetResponse {
  shoppingBudget: number;
}

export const getRecommendBudget = async (data: RecommendBudgetRequest) => {
  const response = await instance.post<CommonResponse<RecommendBudgetResponse>>('/goals/budget/calculate', data);

  if (response.data.resultType === 'SUCCESS') {
    return response.data.data;
  }
};

///////////////////
///* 예산 설정 *///
///////////////////
export interface SetBudgetRequest {
  monthlyIncome: number;
  incomeDate?: number;
  fixedExpense?: number;
  monthlySaving?: number;
  spendStrategy: number;
  shoppingBudget: number;
}

interface SetBudgetResponse {
  id: string;
  monthlyIncome: number;
}

interface CommonResponse<T> {
  resultType: string;
  error: unknown;
  data: T;
}

export const postBudget = async (data: SetBudgetRequest) => {
  const response = await instance.post<CommonResponse<SetBudgetResponse>>('/goals/budget', data);

  if (response.data.resultType === 'SUCCESS') {
    return response.data.data;
  }
};

///////////////////////
///* 목표 예산 조회*///
///////////////////////
export interface GetBudgetResponse {
  id: string;
  monthlyIncome: number;
  incomeDate: number;
  fixedExpense: number;
  monthlySaving: number;
  spendStrategy: number;
  shoppingBudget: number;
}

export const getBudget = async () => {
  const response = await instance.get<CommonResponse<GetBudgetResponse>>('/goals/budget');

  if (response.data.resultType === 'SUCCESS') {
    return response.data.data;
  }
};

///////////////////////
///* 목표 예산 수정*///
///////////////////////
export interface UpdateBudgetRequest {
  monthlyIncome?: number;
  fixedExpense?: number;
  monthlySaving?: number;
  incomeDate?: number;
  shoppingBudget?: number;
}

export const updateBudget = async (data: UpdateBudgetRequest) => {
  const response = await instance.patch<CommonResponse<GetBudgetResponse>>('/goals/budget', data);

  if (response.data.resultType === 'SUCCESS') {
    return response.data.data;
  }
  throw new Error('예산 수정 실패');
};
