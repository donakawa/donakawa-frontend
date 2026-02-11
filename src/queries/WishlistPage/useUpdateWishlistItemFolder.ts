import { updateWishlistItemFolder } from "@/apis/WishlistPage/wishlistItems";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateWishlistItemFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, type, folderId }: { itemId: string; type: 'AUTO' | 'MANUAL'; folderId: string }) =>
      updateWishlistItemFolder(itemId, { type, folderId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlistItems"] });
      queryClient.invalidateQueries({ queryKey: ["wishlistFolderItems"] });
    },
  });
}