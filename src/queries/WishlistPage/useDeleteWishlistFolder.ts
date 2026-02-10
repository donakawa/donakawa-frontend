import { useMutation, useQueryClient } from "@tanstack/react-query"; // 누락됨
import { deleteWishlistFolder } from "@/apis/WishlistPage/wishlistFolders";        // 누락됨

export function useDeleteWishlistFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (folderId: string) => deleteWishlistFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlistFolders"] });
    },
  });
}