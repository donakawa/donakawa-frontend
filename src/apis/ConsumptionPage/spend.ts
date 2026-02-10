import { instance } from '../axios';

export interface ConsumptionItem {
  id: string;
  itemId: string;
  type: string;
  name: string;
  price: number;
  imageUrl: string | null;
}

export interface ConsumptionResponse {
  averageDecisionDays: number;
  recentMonthCount: number;
  items: ConsumptionItem[];
  nextCursor: string | null;
}

interface CommonResponse<T> {
  resultType: string;
  error: unknown;
  data: T;
}

// --- [기존 인터페이스 동일] ---

////////////////////////
///* 만족 소비 조회 *///
////////////////////////
export const getSatisfactionItems = async ({ pageParam }: { pageParam?: string }) => {
  const query = pageParam ? `?cursor=${pageParam}` : '';
  const response = await instance.get<CommonResponse<ConsumptionResponse>>(`/goals/spend/satisfied${query}`);

  if (response.data.resultType === 'SUCCESS') {
    return response.data.data;
  }
  throw new Error('만족 소비 내역 조회 실패');
};

////////////////////////
///* 후회 소비 조회 *///
////////////////////////
export const getRegretItems = async ({ pageParam }: { pageParam?: string }) => {
  const query = pageParam ? `?cursor=${pageParam}` : '';
  const response = await instance.get<CommonResponse<ConsumptionResponse>>(`/goals/spend/regret${query}`);

  if (response.data.resultType === 'SUCCESS') {
    return response.data.data;
  }
  throw new Error('후회 소비 내역 조회 실패');
};
