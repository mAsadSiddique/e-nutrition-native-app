/**
 * Blog-related helper functions
 * Centralized utilities for blog operations
 */

import { DEFAULT_IMAGE_URL, DESCRIPTION_PREVIEW_LENGTH } from "@/src/constant/app-constants";
import type { TBlogsListing } from "@/src/utils/types/blogs";
import { formatDate } from "./format-date";

/**
 * Helper function to strip HTML tags from content
 */
export const stripHtml = (html: string): string => {
  if (!html) return "";
  const text = html.replace(/<[^>]*>/g, "");
  return text.replace(/&nbsp;|&amp;|&lt;|&gt;|&quot;|&#39;/g, (s) => {
    switch (s) {
      case "&nbsp;":
        return " ";
      case "&amp;":
        return "&";
      case "&lt;":
        return "<";
      case "&gt;":
        return ">";
      case "&quot;":
        return '"';
      case "&#39;":
        return "'";
      default:
        return s;
    }
  });
};

/**
 * Extract image URL from blog media object
 */
export const getImageUrlFromMedia = (media: TBlogsListing["media"]): string => {
  if (!media?.images || typeof media.images !== "object") {
    return DEFAULT_IMAGE_URL;
  }
  const imageKeys = Object.keys(media.images);
  if (imageKeys.length === 0) {
    return DEFAULT_IMAGE_URL;
  }
  const firstKey = imageKeys[0];
  return media.images[firstKey] || DEFAULT_IMAGE_URL;
};

/**
 * Get first tag from blog tags array, or return "NEW" as default
 */
export const getBlogTag = (tags?: string[]): string => {
  if (tags && Array.isArray(tags) && tags.length > 0) {
    return String(tags[0]).toUpperCase();
  }
  return "NEW";
};

/**
 * Transform blog listing data for display
 */
export interface TransformedBlog {
  id: number;
  title: string;
  description: string;
  date?: string;
  image: { uri: string };
  categories: number[];
  categoryName?: string;
  slug: string;
  tag?: string;
}

export const transformBlog = (
  blog: TBlogsListing,
  options?: {
    includeDate?: boolean;
    includeCategoryName?: boolean;
    getCategoryName?: (categoryId: number) => string;
    previewLength?: number;
  }
): TransformedBlog => {
  const description = blog.excerpt || stripHtml(blog.content || "");
  const previewLength = options?.previewLength ?? DESCRIPTION_PREVIEW_LENGTH;
  const preview =
    description.length > previewLength
      ? `${description.slice(0, previewLength).trim()}...`
      : description;
  const imageUrl = getImageUrlFromMedia(blog.media);
  const categoryIds = Array.isArray(blog.categories) ? blog.categories : [];
  const firstCategoryId = categoryIds[0];

  const transformed: TransformedBlog = {
    id: blog.id,
    title: blog.title || "",
    description: preview,
    image: { uri: imageUrl },
    categories: categoryIds,
    slug: blog.slug || "",
  };

  if (options?.includeDate) {
    transformed.date = formatDate(blog.publishedAt);
  }

  if (options?.includeCategoryName && firstCategoryId && options?.getCategoryName) {
    transformed.categoryName = options.getCategoryName(firstCategoryId);
  }

  if (blog.tags) {
    transformed.tag = getBlogTag(blog.tags);
  }

  return transformed;
};

/**
 * Transform array of blogs for display
 */
export const transformBlogs = (
  blogs: TBlogsListing[],
  options?: {
    includeDate?: boolean;
    includeCategoryName?: boolean;
    getCategoryName?: (categoryId: number) => string;
    previewLength?: number;
  }
): TransformedBlog[] => {
  if (!blogs || !Array.isArray(blogs)) return [];
  return blogs.map((blog) => transformBlog(blog, options));
};
