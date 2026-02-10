import { instance } from '../axios';

////////////////////////
///* AI 코멘트 조회 *///
////////////////////////
export interface AiCommentResponse {
  comment: string;
  type: 'positive' | 'negative';
}

interface CommonResponse<T> {
  resultType: string;
  error: unknown;
  data: T;
}

export const getHomeAiComment = async () => {
  const response = await instance.get<CommonResponse<AiCommentResponse>>('/histories/report/ai-comment');

  if (response.data.resultType === 'SUCCESS') {
    return response.data.data;
  }

  throw new Error('AI 코멘트 조회에 실패했습니다.');
};

////////////////////////
///* 목표 예산 조회 *///
////////////////////////
export interface HomeSpendResponse {
  totalSpend: number;
  remainingBudget: number;
}

export const getHomeSpend = async () => {
  try {
    const response = await instance.get<CommonResponse<HomeSpendResponse>>('/goals/spend');

    if (response.data.resultType === 'SUCCESS') {
      return response.data.data;
    }
    return null;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      console.warn('등록된 목표 예산이 없습니다.');
      return null;
    }
    throw error;
  }
};
