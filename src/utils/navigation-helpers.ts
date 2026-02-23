/**
 * Navigation helper functions
 * Centralized navigation handlers
 */

import type { Category } from "@/src/services/categoryApi";
import { AppRoutes, buildRoute } from "@/src/utils/enums";
import type { Router } from "expo-router";
import { findCategoryById, hasSubcategories } from "./category-helpers";

/**
 * Handle blog press navigation
 */
export const handleBlogPress = (
  router: Router,
  item: {
    id: number;
    slug: string;
    categories?: number[];
  }
): void => {
  const blogId = item?.id;
  const slug = item?.slug;
  const categoryId =
    Array.isArray(item?.categories) && item.categories.length > 0
      ? item.categories[0]
      : undefined;

  if (!blogId || !slug || !categoryId) {
    console.warn("[Navigation] Missing required blog data:", {
      blogId,
      slug,
      categoryId,
    });
    return;
  }

  router.push(buildRoute.blogDetail(blogId, categoryId, slug) as any);
};

/**
 * Handle category press navigation
 */
export const handleCategoryPress = (
  router: Router,
  categoryId: number,
  categoriesWithChildren?: Category[]
): void => {
  if (!categoriesWithChildren) {
    // Fallback: navigate to blogs screen if no nested structure available
    router.push(`${AppRoutes.BLOGS}?categoryId=${categoryId}` as any);
    return;
  }

  const category = findCategoryById(categoriesWithChildren, categoryId);

  // If category has subcategories, navigate to category-detail screen
  if (hasSubcategories(category)) {
    router.push(`/category-detail?categoryId=${categoryId}` as any);
  } else {
    // Otherwise, navigate to blogs screen
    router.push(`${AppRoutes.BLOGS}?categoryId=${categoryId}` as any);
  }
};
