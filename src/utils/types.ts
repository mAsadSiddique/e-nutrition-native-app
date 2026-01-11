// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Auth Types
export interface TLoginDetails {
  email: string;
  password: string;
}

export interface TChangePassword {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

export interface TUpdateProfile {
  username: string;
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  address?: string;
  dob?: {
    day: number;
    month: number;
    year: number;
  };
  profileImage?: {
    fileBase64: string;
    fileName: string;
  };
  fcmTokens?: string;
  isNotificationEnabled?: boolean;
}

export interface TResetPassword {
  email: string;
  code: string;
  password: string;
  confirmPassword: string;
}

// Signup Types
export interface TSignupDetails {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface TVerificationDetails {
  email: string;
  code: string;
}

export interface TResendVerificationDetails {
  email: string;
}

export interface TForgotPasswordDetails {
  email: string;
}

export interface TSetPasswordDetails {
  password: string;
  confirmPassword: string;
}

// User Types
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TUserProfile = {
  id: number;
  username: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  gender?: string | null;
  address?: string | null;
  dob?: string | null;
  profileImage?: string | null;
  registrationType: string;
  isNotificationEnabled: boolean;
  userType: string;
  userVerifications: {
    email: boolean;
    phoneNumber: boolean;
  };
};

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken?: string;
}
