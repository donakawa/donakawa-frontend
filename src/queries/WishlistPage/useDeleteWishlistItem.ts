import { deleteWishlistItem } from "@/apis/WishlistPage/wishlistItems";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, type }: { itemId: string; type: 'AUTO' | 'MANUAL' }) =>
      deleteWishlistItem(itemId, type),
    onSuccess: () => {
      // 삭제 후 모든 아이템 관련 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["wishlistItems"] });
      queryClient.invalidateQueries({ queryKey: ["wishlistFolderItems"] });
    },
  });
}