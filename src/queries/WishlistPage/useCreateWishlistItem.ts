import { createWishlistItem, type CreateWishlistItemRequest } from "@/apis/WishlistPage/wishlistItems";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWishlistItemRequest) => createWishlistItem(data),
    onSuccess: (res) => {
      if (res.resultType === "SUCCESS") {
        // 위시리스트 목록 쿼리 키가 있다면 무효화
        queryClient.invalidateQueries({ queryKey: ["wishlistItems"] });
      }
    },
  });
}