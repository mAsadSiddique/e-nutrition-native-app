import { createAction } from "@reduxjs/toolkit";

export const setSelectedCategories = createAction<{ categories: number[] }>(
  "categories/setSelectedCategories"
);

export const toggleCategory = createAction<{ categoryId: number }>(
  "categories/toggleCategory"
);

export const clearSelectedCategories = createAction(
  "categories/clearSelectedCategories"
);

