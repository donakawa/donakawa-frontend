import { getWishlistFolders } from "@/apis/WishlistPage/wishlistFolders";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useWishlistFolders(take: number = 10) {
  return useInfiniteQuery({
    queryKey: ["wishlistFolders", take],
    queryFn: ({ pageParam }) =>
      getWishlistFolders({
        take,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.resultType !== "SUCCESS") return undefined;
      return lastPage.data.nextCursor ?? undefined;
    },
    select: (data) => {
      const folders = data.pages.flatMap((p) =>
        p.resultType === "SUCCESS" ? p.data.folders : []
      );
      return { ...data, folders };
    },
  });
}