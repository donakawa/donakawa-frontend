import { createWishlistItem, type CreateWishlistItemRequest } from "@/apis/WishlistPage/wishlistItems";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateWishlistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateWishlistItemRequest) => {
      return createWishlistItem(data);
    },

    onSuccess: (res) => {
      if (res?.resultType === "SUCCESS") {
        queryClient.invalidateQueries({ queryKey: ["wishlistItems"] });
      }
    },
  });

}
