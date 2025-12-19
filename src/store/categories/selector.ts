import { useSelector } from "react-redux";
import { AppState } from "../store";

export function useCategoriesSelector() {
  return useSelector<AppState, AppState["categories"]>((s) => s.categories);
}

