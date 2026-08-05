/**
 * Category-related helper functions
 * Centralized utilities for category operations
 */

import { CATEGORY_DISPLAY_ORDER } from "@/src/constant/app-constants";
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

const normalizeCategoryName = (name: string): string =>
  name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Map API naming quirks onto the spreadsheet order labels. */
const CATEGORY_ORDER_ALIASES: Record<string, string> = {
  fruits: "fruit",
  vegitables: "vegetables",
  vegetable: "vegetable",
  vegetables: "vegetables",
  "butter milk": "buttermilk",
  eggs: "egg",
  "fats and oil": "oil",
  "fats and oils": "oil",
  "milk and yougurt": "milk",
  "milk and yogurt": "milk",
  "grain products": "grains",
  "bread and whole wheat bread": "bread",
  "plant based butter": "plant-based butter",
  "plant based milk": "plant-based milk",
};

const ORDER_INDEX_BY_LABEL = new Map(
  CATEGORY_DISPLAY_ORDER.map((label, index) => [
    normalizeCategoryName(label),
    index,
  ]),
);

const getCategorySortIndex = (name: string): number => {
  const normalized = normalizeCategoryName(name);
  const aliased = CATEGORY_ORDER_ALIASES[normalized] ?? normalized;
  const aliasedKey = normalizeCategoryName(aliased);

  const direct = ORDER_INDEX_BY_LABEL.get(aliasedKey);
  if (direct !== undefined) return direct;

  // Fallback: order label equals or is contained as the full API name variant
  for (const [label, index] of ORDER_INDEX_BY_LABEL) {
    if (aliasedKey === label || aliasedKey.startsWith(`${label} `)) {
      return index;
    }
  }

  return CATEGORY_DISPLAY_ORDER.length;
};

/**
 * Sort categories into the app's preferred display order.
 * Unknown categories are appended alphabetically at the end.
 */
export const sortCategoriesByDisplayOrder = <T extends { name: string }>(
  categories: T[],
): T[] => {
  if (!Array.isArray(categories) || categories.length === 0) return [];

  return [...categories].sort((a, b) => {
    const indexA = getCategorySortIndex(a.name);
    const indexB = getCategorySortIndex(b.name);
    if (indexA !== indexB) return indexA - indexB;
    return a.name.localeCompare(b.name);
  });
};
