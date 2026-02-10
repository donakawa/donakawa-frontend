export type ApiResultType = "SUCCESS" | "FAIL";

export interface ApiResponse<T> {
  resultType: ApiResultType;
  error: null | {
    code?: string;
    message?: string;
  };
  data: T;
}

export type WishlistFolder = {
  id: string;
  name: string;
};

export type GetWishlistFoldersData = {
  folders: WishlistFolder[];
  nextCursor: string | null;
};

export type GetWishlistFoldersResponse = ApiResponse<GetWishlistFoldersData>;

export type CreateWishlistFolderRequest = {
  name: string;
};

export type CreateWishlistFolderData = {
  folderId: string;
  createdAt: string;
};

export type CreateWishlistFolderResponse =
  | ApiResponse<CreateWishlistFolderData> // 성공
  | {
      resultType: "FAILED";
      error: {
        errorCode: "DUPLICATE_FOLDER_NAME";
        message: string;
        data: null;
      };
      data: null;
    };
