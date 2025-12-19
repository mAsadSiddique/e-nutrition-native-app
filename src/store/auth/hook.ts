import storage from "@/src/utils/storage";
import type { TUserProfile } from "@/src/utils/types";
import { useCallback } from "react";
import React from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store";
import {
    setLoading,
    setUserProfile,
    signIn,
    signOut,
    updateUserProfile,
} from "./action";
import { useAuthSelector } from "./selector";

// Combined hook that matches the context interface
export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useAuthSelector();
  const [hasToken, setHasToken] = React.useState<boolean>(false);

  // Check if token exists in storage on mount and when userProfile changes
  React.useEffect(() => {
    const checkToken = async () => {
      const token = await storage.getToken();
      setHasToken(!!token);
    };
    checkToken();
  }, [authState.userProfile]);

  const onSetProfile = useCallback(
    (profile: TUserProfile) => {
      console.log('Dispatching setUserProfile with:', profile);
      dispatch(setUserProfile({ profile }));
    },
    [dispatch]
  );

  const onUpdateProfile = useCallback(
    (profile: Partial<TUserProfile>) => {
      dispatch(updateUserProfile({ profile }));
    },
    [dispatch]
  );

  const onSetLoading = useCallback(
    (isLoading: boolean) => {
      dispatch(setLoading({ isLoading }));
    },
    [dispatch]
  );

  const onSignIn = useCallback(
    async (token: string, profile?: TUserProfile) => {
      await storage.setToken(token);
      dispatch(signIn({ token, profile }));
      setHasToken(true);
    },
    [dispatch]
  );

  const onSignOut = useCallback(async () => {
    try {
      console.log("🚪 Redux Auth - Signing out user");
      await storage.clearToken();
      dispatch(signOut());
      setHasToken(false);
      console.log("✅ Redux Auth - User signed out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      dispatch(signOut());
      setHasToken(false);
    }
  }, [dispatch]);

  // Check if user is authenticated (has token and userProfile)
  const isAuthenticated = hasToken && !!authState.userProfile && Object.keys(authState.userProfile).length > 0;

  // Return interface matching AuthContext
  return {
    isAuthenticated,
    userProfile: authState.userProfile,
    isLoading: authState.isLoading,
    signIn: onSignIn,
    signOut: onSignOut,
    updateUserProfile: onUpdateProfile,
    onSetProfile,
    onSetLoading,
  };
};
