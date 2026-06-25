import { axios } from "@/src/config/axios";
import { SERVER_END_POINTS } from "@/src/constant/server-endpoint";
import { useGoogleAuth } from "@/src/hooks/useGoogleAuth";
import { useAuth } from "@/src/store/auth/hook";
import { useWishlistHandler } from "@/src/store/wishlist/hook";
import { AppRoutes } from "@/src/utils/enums";
import storage from "@/src/utils/storage";
import { toast } from "@/src/utils/toast";
import type { TUserProfile } from "@/src/utils/types";
import { useRouter } from "expo-router";
import { useCallback } from "react";

function mapGoogleUserToProfile(user: Record<string, unknown>): TUserProfile {
  return {
    id: typeof user.id === "number" ? user.id : 0,
    username: String(user.username ?? user.email ?? ""),
    email: String(user.email ?? ""),
    firstName: user.firstName != null ? String(user.firstName) : null,
    lastName: user.lastName != null ? String(user.lastName) : null,
    registrationType: String(user.registrationType ?? "Google"),
    isNotificationEnabled: false,
    userType: String(user.userType ?? ""),
    userVerifications: {
      email: true,
      phoneNumber: false,
    },
  };
}

async function fetchPostLoginData(): Promise<{
  profile: TUserProfile | null;
  userWishlist: {
    blogsWishlist: number[];
    categoriesWishlist: number[] | null;
  } | null;
}> {
  try {
    const response: any = await axios.get(SERVER_END_POINTS.USER_PROFILE);
    const profile = response?.data?.profile ?? response?.profile ?? null;
    const userWishlist =
      response?.data?.userWishlist ?? response?.userWishlist ?? null;
    return { profile, userWishlist };
  } catch {
    return { profile: null, userWishlist: null };
  }
}

export function useGoogleSignInFlow() {
  const router = useRouter();
  const { onSetProfile } = useAuth();
  const { setWishlist } = useWishlistHandler();
  const { handleGoogleLogin, isLoading: isGoogleLoading } = useGoogleAuth();

  const onGoogleSignIn = useCallback(() => {
    handleGoogleLogin(
      async (jwt, profile) => {
        await storage.setToken(jwt);

        const { profile: apiProfile, userWishlist } = await fetchPostLoginData();
        onSetProfile(apiProfile ?? mapGoogleUserToProfile(profile));

        if (userWishlist) {
          const { blogsWishlist, categoriesWishlist } = userWishlist;
          setWishlist({
            blogsWishlist: blogsWishlist || [],
            categoriesWishlist: categoriesWishlist || null,
          });
        } else {
          setWishlist({
            blogsWishlist: [],
            categoriesWishlist: null,
          });
        }

        toast.success("Login successful");
        router.replace(
          userWishlist ? AppRoutes.HOME_INDEX : AppRoutes.CATEGORY_SELECTION,
        );
      },
      (msg) => {
        toast.error(msg);
      },
      () => {},
    );
  }, [handleGoogleLogin, onSetProfile, router, setWishlist]);

  return { onGoogleSignIn, isGoogleLoading };
}
