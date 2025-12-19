import { useSelector } from "react-redux";
import { AppState } from "../store";

export function useSavedBlogsSelector() {
  return useSelector<AppState, AppState["savedBlogs"]>((s) => s.savedBlogs);
}

