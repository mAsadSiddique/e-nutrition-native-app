import { createReducer } from "@reduxjs/toolkit";
import { TCategoriesState } from "./type";
import {
  setSelectedCategories,
  toggleCategory,
  clearSelectedCategories,
} from "./action";

const initialState: TCategoriesState = {
  selectedCategories: [],
};

export const categories = createReducer(initialState, (builder) => {
  builder
    .addCase(setSelectedCategories, (state, { payload: { categories } }) => {
      state.selectedCategories = categories;
    })
    .addCase(toggleCategory, (state, { payload: { categoryId } }) => {
      if (state.selectedCategories.includes(categoryId)) {
        state.selectedCategories = state.selectedCategories.filter(
          (id) => id !== categoryId
        );
      } else {
        state.selectedCategories = [...state.selectedCategories, categoryId];
      }
    })
    .addCase(clearSelectedCategories, (state) => {
      state.selectedCategories = [];
    });
});

