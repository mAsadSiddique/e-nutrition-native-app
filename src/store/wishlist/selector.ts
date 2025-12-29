import { useSelector } from "react-redux";
import { AppState } from "../store";

export function useWishlistSelector() {
  return useSelector<AppState, AppState["wishlist"]>((s) => s.wishlist);
}

