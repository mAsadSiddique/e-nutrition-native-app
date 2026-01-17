import { useMemo } from "react";
import { useAuthSelector } from "../store/auth/selector";

export const useCurrentProfile = () => {
  const { userProfile } = useAuthSelector();

  const { isLoggedIn } = useMemo(() => {
    return {
      isLoggedIn: !!userProfile?.email,
    };
  }, [userProfile]);

  return { isLoggedIn };
};
