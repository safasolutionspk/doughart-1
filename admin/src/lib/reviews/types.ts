import type { ImageDisplay } from "@/lib/catalog/types";

export type Review = {
  _id: string;
  name: string;
  role?: string;
  rating: number;
  text: string;
  image?: string;
  imageDisplay?: ImageDisplay;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ReviewsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ReviewListResponse = {
  reviews: Review[];
  pagination: ReviewsPagination;
};
