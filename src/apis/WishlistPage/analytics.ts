import { instance } from '@/apis/axios';
import type { ApiResponse } from '@/apis/auth';

export type WishlistAnalytics = {
  droppedItems: { totalCount: number; totalPrice: number };
  boughtItems: { totalCount: number; totalPrice: number };
};

export async function getWishlistAnalytics(): Promise<ApiResponse<WishlistAnalytics>> {
  const { data } = await instance.get<ApiResponse<WishlistAnalytics>>('/wishlist/items/analytics');
  return data;
}
