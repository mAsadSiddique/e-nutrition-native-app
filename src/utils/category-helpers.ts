/**
 * Category-related helper functions
 * Centralized utilities for category operations
 */

import type { Category } from "@/src/services/categoryApi";

/**
 * Find a category by ID in a nested category structure
 */
export const findCategoryById = (
  categories: Category[],
  categoryId: number
): Category | null => {
  for (const cat of categories) {
    if (cat.id === categoryId) return cat;
    if (cat.children) {
      const found = findCategoryById(cat.children, categoryId);
      if (found) return found;
    }
  }
  return null;
};

/**
 * Get category name by ID from flat category list
 */
export const getCategoryNameById = (
  categories: Array<{ id: number; name: string }>,
  categoryId: number
): string => {
  const category = categories.find((cat) => cat.id === categoryId);
  return category?.name || "";
};

/**
 * Check if category has subcategories
 */
export const hasSubcategories = (category: Category | null): boolean => {
  return !!(category?.children && category.children.length > 0);
};
