import { useSelector } from "react-redux";
import { AppState } from "../store";

export function useAuthSelector() {
  return useSelector<AppState, AppState["auth"]>((s) => s.auth);
}

