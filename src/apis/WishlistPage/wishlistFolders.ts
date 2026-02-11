import type { CreateWishlistFolderRequest, CreateWishlistFolderResponse, GetWishlistFoldersResponse } from "@/types/WishlistPage/wishlistFolder";
import { http } from "./http";

export async function createWishlistFolder(body: CreateWishlistFolderRequest) {
  const res = await http.post<CreateWishlistFolderResponse>("/wishlist/folders", body);
  return res.data;
}
  
export async function getWishlistFolders(params?: {
  take?: number;
  cursor?: string;
}) {
  const res = await http.get<GetWishlistFoldersResponse>("/wishlist/folders", {
    params,
  });
  return res.data;
}

export async function deleteWishlistFolder(folderId: string) {
  const res = await http.delete(`/wishlist/folders/${folderId}`);
  return res; 
}