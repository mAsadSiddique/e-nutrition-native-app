import type { TAdmin } from "./profile";

export type TExploreBlogs = {
  id?: string;
  search?: string;
  slug?: string;
  tags?: string | string[];
  sortBy?: string;
  categoryIds?: number[];
};

export type TApiResponse = {
  message: string;
  data: any;
  code: number;
};

export type TMedia = {
  images: Record<string, string>;
};

export type TBlogsListing = {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  media: TMedia;
  mediaExpiredAt: number;
  categories: number[];
  status: "draft" | "published" | "unpublished";
  slug: string;
  seoTitle: string;
  seoDescription: string;
  tags: string[];
  viewsCount: number;
  likesCount: number;
  publishedAt: string; // ISO string
  unpublishedAt: string | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string;
  adminId: TAdmin;
};
