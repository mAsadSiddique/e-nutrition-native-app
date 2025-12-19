import type { TUserProfile } from "@/src/utils/types";
import { createAction } from "@reduxjs/toolkit";

export const setUserProfile = createAction<{ profile: TUserProfile }>(
  "auth/setUserProfile"
);

export const updateUserProfile = createAction<{
  profile: Partial<TUserProfile>;
}>("auth/updateUserProfile");

export const setLoading = createAction<{ isLoading: boolean }>(
  "auth/setLoading"
);

export const signIn = createAction<{ token: string; profile?: TUserProfile }>(
  "auth/signIn"
);

export const signOut = createAction("auth/signOut");
