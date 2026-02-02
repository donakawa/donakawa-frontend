export type GiveupItem = {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
};

export type GiveupItemsSummary = {
  totalGiveupAmount: number;
  GiveupCount: number;
};

export type GiveupItemsPageData = {
  summary: GiveupItemsSummary;
  items: GiveupItem[];
};
