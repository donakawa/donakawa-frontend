import { createWishlistFolder } from "@/apis/WishlistPage/wishlistFolders";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateWishlistFolder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createWishlistFolder({ name }),

    onSuccess: async (res) => {
      // 성공일 때만 목록 갱신
      if (res.resultType === "SUCCESS") {
        await queryClient.invalidateQueries({ queryKey: ["wishlistFolders"] });
      }
    },
  });
}