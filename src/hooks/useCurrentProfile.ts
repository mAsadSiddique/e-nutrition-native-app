import { useMemo } from "react";
import { useAuthSelector } from "../store/auth/selector";

export const useCurrentProfile = () => {
  const { userProfile } = useAuthSelector();

  const { isLoggedIn, userName, profileUrl, email } = useMemo(() => {
    return {
      isLoggedIn: !!userProfile?.email,
      userName: userProfile.username,
      profileUrl: userProfile.profileImage,
      email: userProfile.email,
    };
  }, [userProfile]);

  return { isLoggedIn, userName, profileUrl, email };
};
