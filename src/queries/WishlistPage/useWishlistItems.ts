import { getWishlistItems } from "@/apis/WishlistPage/wishlistItems";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useWishlistItems(status: "WISHLISTED" | "DROPPED" | "BOUGHT" = "WISHLISTED", take: number = 10) {
  return useInfiniteQuery({
    queryKey: ["wishlistItems", status, take],
    queryFn: ({ pageParam }) =>
      getWishlistItems({
        status,
        take,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.resultType !== "SUCCESS") return undefined;
      return lastPage.data.nextCursor ?? undefined;
    },
    select: (data) => {
      const items = data.pages.flatMap((p) =>
        p.resultType === "SUCCESS" ? p.data.wishitems : []
      );
      return { ...data, items };
    },
  });
}