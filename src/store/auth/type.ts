import type { TUserProfile } from "@/src/utils/types";

export type TAuthState = {
  userProfile: TUserProfile;
  isLoading: boolean;
};
