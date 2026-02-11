import { http } from './http';

export interface CreateWishlistItemRequest {
  productName: string;
  price: number;
  storeName: string;
  brandName: string;
  reason: string;
  url?: string;
  file?: File | Blob;
}

export interface GetWishlistItemsResponse {
  resultType: string;
  error: any;
  data: {
    nextCursor: string | null;
    wishitems: {
      id: string;
      name: string;
      price: number;
      photoUrl: string;
      type: 'AUTO' | 'MANUAL';
      status: 'WISHLISTED' | 'DROPPED' | 'BOUGHT';
    }[];
  };
}

export async function createWishlistItem(data: CreateWishlistItemRequest) {
  const formData = new FormData();

  formData.append('productName', data.productName);
  formData.append('price', String(data.price));
  formData.append('storeName', data.storeName);
  formData.append('brandName', data.brandName);
  formData.append('reason', data.reason);
  if (data.url) formData.append('url', data.url);
  if (data.file) formData.append('file', data.file);

  const res = await http.post('/wishlist/items', formData);
  return res.data;
}

export async function getWishlistItems(params: {
  status: 'WISHLISTED' | 'DROPPED' | 'BOUGHT';
  take?: number;
  cursor?: string;
}) {
  const { take = 20, ...rest } = params;

  const res = await http.get<GetWishlistItemsResponse>('/wishlist/items', {
    params: { ...rest, take },
  });

  return res.data;
}

export async function getWishlistFolderItems(folderId: string, params: { take?: number; cursor?: string }) {
  const { take = 20, ...rest } = params;

  const res = await http.get<GetWishlistItemsResponse>(`/wishlist/folders/${folderId}/items`, {
    params: { ...rest, take },
  });

  return res.data;
}

export async function updateWishlistItemFolder(itemId: string, data: { type: 'AUTO' | 'MANUAL'; folderId: string }) {
  return await http.patch(`/wishlist/items/${itemId}/folder`, data);
}

export async function deleteWishlistItem(itemId: string, type: 'AUTO' | 'MANUAL') {
  return await http.delete(`/wishlist/items/${itemId}`, {
    params: { type },
  });
}

export async function startCrawlTask(url: string) {
  const res = await http.post('/wishlist/crawl-tasks', { url });
  return res.data;
}

export async function getCrawlResult(cacheId: string) {
  const res = await http.get(`/wishlist/crawl-tasks/${cacheId}/result`);
  return res.data;
}

export async function createWishlistItemFromCache(cacheId: string, reason: string) {
  const res = await http.post(`/wishlist/items/from-cache`, {
    cacheId,
    reason,
  });
  return res.data;
}

export async function getWishlistItemDetail(itemId: string, type: 'AUTO' | 'MANUAL') {
  const res = await http.get(`/wishlist/items/${itemId}`, {
    params: { type },
  });
  return res.data;
}

export interface PurchaseDecisionPayload {
  type: 'AUTO' | 'MANUAL';
  date: string;
  purchasedAt: 'MORNING' | 'EVENING' | 'NIGHT';
  reasonId: number;
  reason: string;
}

export async function buyWishlistItem(itemId: string, payload: PurchaseDecisionPayload) {
  const res = await http.post(`/wishlist/items/${itemId}/buy`, payload);
  return res.data;
}

export async function dropWishlistItem(itemId: string, type: 'AUTO' | 'MANUAL') {
  const res = await http.post(`/wishlist/items/${itemId}/drop`, { type });
  return res.data;
}

export async function updateWishlistItemReason(itemId: string, data: { reason: string; type: 'AUTO' | 'MANUAL' }) {
  return await http.patch(`/wishlist/items/${itemId}/reason`, data);
}

export async function updateManualWishlistItem(
  itemId: string,
  data: {
    productName?: string;
    price?: number;
    storeName?: string;
    url?: string;
    file?: File | Blob;
    brandName?: string;
  },
) {
  const formData = new FormData();
  if (data.productName != null) formData.append('productName', data.productName);
  if (data.price != null) formData.append('price', String(data.price));
  if (data.storeName != null) formData.append('storeName', data.storeName);
  if (data.url != null) formData.append('url', data.url);
  if (data.file != null) formData.append('file', data.file);
  if (data.brandName != null) formData.append('brandName', data.brandName);

  const res = await http.patch(`/wishlist/items/${itemId}`, formData);
  return res.data;
}
