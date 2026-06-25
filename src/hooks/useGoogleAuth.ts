import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";

WebBrowser.maybeCompleteAuthSession();

const API_BASE = "https://quickwagon.com";

function parseAuthRedirectUrl(
  url: string,
  onSuccess: (jwt: string, profile: Record<string, unknown>) => void,
  onError: (msg: string) => void,
  onCancel: () => void,
): boolean {
  if (url.includes("auth/cancel")) {
    onCancel();
    return true;
  }

  const parsed = Linking.parse(url);
  const { status, token, user } = parsed.queryParams ?? {};

  if (status === "404" || (status === "200" && !token)) {
    onError("Google login failed. Please try again.");
    return true;
  }

  if (status === "200" && token) {
    try {
      const jwt = decodeURIComponent(token as string);
      const profile = user
        ? JSON.parse(decodeURIComponent(user as string))
        : {};
      onSuccess(jwt, profile);
      return true;
    } catch {
      onError("Failed to parse login response");
      return true;
    }
  }

  return false;
}

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async (
    onSuccess: (jwt: string, profile: Record<string, unknown>) => void,
    onError: (msg: string) => void,
    onCancel: () => void,
  ) => {
    setIsLoading(true);

    try {
      let handled = false;

      const subscription = Linking.addEventListener("url", ({ url }) => {
        if (handled) return;
        handled = true;
        subscription.remove();
        setIsLoading(false);
        parseAuthRedirectUrl(url, onSuccess, onError, onCancel);
      });

      const result = await WebBrowser.openAuthSessionAsync(
        `${API_BASE}/user/google`,
        "omnione://auth/google",
      );

      if (handled) return;

      subscription.remove();
      setIsLoading(false);

      if (result.type === "cancel" || result.type === "dismiss") {
        onCancel();
        return;
      }

      if (result.type === "success" && result.url) {
        const parsed = parseAuthRedirectUrl(
          result.url,
          onSuccess,
          onError,
          onCancel,
        );
        if (!parsed) {
          onError("Google login failed. Please try again.");
        }
        return;
      }

      onError("Something went wrong. Please try again.");
    } catch {
      setIsLoading(false);
      onError("Something went wrong. Please try again.");
    }
  };

  return { handleGoogleLogin, isLoading };
}
