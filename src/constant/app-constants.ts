/**
 * Application Constants
 * Centralized constants used throughout the app
 */

// Image URLs
export const DEFAULT_IMAGE_URL = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop";

// Limits
export const RECOMMENDED_BLOGS_LIMIT = 5;
export const CATEGORIES_GRID_LIMIT = 6;
export const DESCRIPTION_PREVIEW_LENGTH = 100;

/**
 * Preferred display order for categories (home + browse).
 * Derived from spreadsheet first-appearance order (duplicates ignored).
 */
export const CATEGORY_DISPLAY_ORDER = [
  "fruit",
  "beans and peas",
  "beef",
  "bread",
  "vegetables",
  "wheat",
  "butter",
  "buttermilk",
  "vegetable",
  "cheese",
  "chicken",
  "salt",
  "sauce",
  "sausage",
  "seeds and nuts",
  "cookies",
  "juice",
  "cream",
  "egg",
  "fish",
  "flour",
  "garlic",
  "ham",
  "hummus",
  "ketchup",
  "milk",
  "grains",
  "oil",
  "olives",
  "onion rings",
  "plant-based butter",
  "pickles",
  "pork",
  "plant-based milk",
  "restaurant foods",
  "rice",
  "sugar",
  "turkey",
  "yogurt",
] as const;

// Colors
export const COLORS = {
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

// Soft pastel background colors for category cards
const CATEGORY_CARD_BACKGROUNDS = [
  "#FDEEEF", // soft pink
  "#E8F6FF", // soft blue
  "#E9F7F0", // soft green
  "#FFF4E5", // soft orange
  "#F3E8FF", // soft purple
  "#F0F4FF", // soft indigo
] as const;

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
 * Get category background color based on index.
 * Cycles through a palette of soft pastel colors so each card
 * gets a visually distinct background.
 */
export const getCategoryBackgroundColor = (index: number): string => {
  const safeIndex =
    Number.isFinite(index) && index >= 0 ? Math.floor(index) : 0;
  return CATEGORY_CARD_BACKGROUNDS[
    safeIndex % CATEGORY_CARD_BACKGROUNDS.length
  ];
};
