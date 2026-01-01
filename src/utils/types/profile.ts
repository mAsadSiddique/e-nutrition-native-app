export type TAdmin = {
  id: number;
  email: string;
  isEmailVerified: boolean;
  firstName: string;
  lastName: string;
  twoFaAuth: string | null;
  isTwoFaEnable: boolean;
  isBlocked: boolean;
  role: "Super" | "Admin" | "Editor";
  imageUrl: string | null;
  fcmTokens: string[] | null;
  isNotificationEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};
