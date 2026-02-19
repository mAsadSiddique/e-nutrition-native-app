/**
 * Application Constants
 * Centralized constants used throughout the app
 */

// Image URLs
export const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop";

// Limits
export const RECOMMENDED_BLOGS_LIMIT = 5;
export const CATEGORIES_GRID_LIMIT = 4;
export const DESCRIPTION_PREVIEW_LENGTH = 100;

// Colors
export const COLORS = {
  FIRST_CATEGORY_BG: "#E0F2F1",
  DEFAULT_CATEGORY_BG: "#F5F5F5",
  PRIMARY_GREEN: "#1A8917", // Primary green used across the app
  TEXT_PRIMARY: "#000",
  TEXT_SECONDARY: "#999",
  BACKGROUND_WHITE: "#fff",
  SEARCH_BG: "#F5F5F5",
  TAG_BG: "#1A8917",
  TAG_TEXT: "#fff",
  BORDER_LIGHT: "#f0f0f0",
  PRESSED_BG: "#fafafa",
} as const;

// Category Icon Mapping
export const CATEGORY_ICON_MAP: Record<string, string> = {
  reiki: "leaf-outline",
  healing: "leaf-outline",
  crystal: "diamond-outline",
  stone: "diamond-outline",
  meditation: "musical-notes-outline",
  sound: "musical-notes-outline",
  chakra: "radio-button-on-outline",
  balance: "radio-button-on-outline",
  default: "grid-outline",
};

/**
 * Get category icon based on category name
 */
export const getCategoryIcon = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICON_MAP)) {
    if (name.includes(key)) {
      return icon;
    }
  }
  return CATEGORY_ICON_MAP.default;
};

/**
 * Get category background color based on index
 */
export const getCategoryBackgroundColor = (index: number): string => {
  return index === 0 ? COLORS.FIRST_CATEGORY_BG : COLORS.DEFAULT_CATEGORY_BG;
};
