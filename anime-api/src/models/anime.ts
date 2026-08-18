export type Anime = {
  id: string;
  title: string;
  yearFrom: number;
  yearTo: number | null;
  ongoing: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AnimeWriteInput = {
  title: string;
  yearFrom: number;
  yearTo?: number | null;
};

export type AnimeListQuery = {
  page: number;
  pageSize: number;
  sortBy: "title" | "yearFrom";
  sortOrder: "asc" | "desc";
  titleContains?: string;
  ongoing?: "true" | "false";
  yearFromGte?: number;
  yearFromLte?: number;
};

export type AnimeListResult = {
  data: Anime[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
  };
};
