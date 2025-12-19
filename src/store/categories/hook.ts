import { useDispatch } from "react-redux";
import { useCallback } from "react";
import {
  setSelectedCategories,
  toggleCategory,
  clearSelectedCategories,
} from "./action";
import type { AppDispatch } from "../store";

export const useCategories = () => {
  const dispatch = useDispatch<AppDispatch>();

  const onSetSelectedCategories = useCallback(
    (categories: number[]) => {
      dispatch(setSelectedCategories({ categories }));
    },
    [dispatch]
  );

  const onToggleCategory = useCallback(
    (categoryId: number) => {
      dispatch(toggleCategory({ categoryId }));
    },
    [dispatch]
  );

  const onClearSelectedCategories = useCallback(() => {
    dispatch(clearSelectedCategories());
  }, [dispatch]);

  return {
    onSetSelectedCategories,
    onToggleCategory,
    onClearSelectedCategories,
  };
};

