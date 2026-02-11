import { getWishlistFolderItems } from "@/apis/WishlistPage/wishlistItems";
import { useInfiniteQuery } from "@tanstack/react-query";

export function useWishlistFolderItems(folderId: string, take: number = 10) {
  return useInfiniteQuery({
    // folderId를 쿼리 키에 넣어 폴더 변경 시마다 새로운 데이터 가져옴
    queryKey: ["wishlistFolderItems", folderId, take],
    queryFn: ({ pageParam }) =>
      getWishlistFolderItems(folderId, {
        take,
        cursor: pageParam as string | undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (lastPage.resultType !== "SUCCESS") return undefined;
      return lastPage.data.nextCursor ?? undefined;
    },
    enabled: !!folderId && folderId !== "all",
    select: (data) => {
      const items = data.pages.flatMap((p) =>
        p.resultType === "SUCCESS" ? p.data.wishitems : []
      );
      return { ...data, items };
    },
  });
}