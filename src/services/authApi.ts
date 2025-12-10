import type {
  ApiResponse,
  TChangePassword,
  TForgotPasswordDetails,
  TLoginDetails,
  TResendVerificationDetails,
  TResetPassword,
  TSetPasswordDetails,
  TSignupDetails,
  TUpdateProfile,
  TVerificationDetails,
  UserProfile,
} from "../utils/types";

import { useMutation } from "@tanstack/react-query";
import { axios } from "../config/axios";
import { SERVER_END_POINTS } from "../constant/server-endpoint";

export const useLoginProfile = () => {
  return useMutation({
    mutationFn: async (loginDetail: TLoginDetails) => {
      return await axios.post(SERVER_END_POINTS.USER_LOGIN, loginDetail);
    },
  });
};

// Get user profile using mutation (to avoid React Query v5 compatibility issues)
export const useGetProfile = () => {
  return useMutation({
    mutationFn: async (): Promise<UserProfile> => {
      const response = await axios.get(SERVER_END_POINTS.USER_PROFILE);
      // Handle the nested response structure: data.profile
      return response.data.profile;
    },
  });
};

// update user profile...
export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: async (
      userUpdateDetails: TUpdateProfile
    ): Promise<ApiResponse> => {
      return await axios.put(SERVER_END_POINTS.EDIT_USER, userUpdateDetails);
    },
  });
};

export const useForgetPassword = () => {
  return useMutation({
    mutationFn: async (
      payload: TForgotPasswordDetails
    ): Promise<ApiResponse> => {
      return await axios.post(SERVER_END_POINTS.FORGET_PASSWORD, payload);
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (payload: TResetPassword): Promise<ApiResponse> => {
      return await axios.put(SERVER_END_POINTS.RESET_PASSWORD, payload);
    },
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: async (payload: TSignupDetails): Promise<ApiResponse> => {
      return await axios.post(SERVER_END_POINTS.USER_SIGNUP, payload);
    },
  });
};

export const useVerification = () => {
  return useMutation({
    mutationFn: async (payload: TVerificationDetails): Promise<ApiResponse> => {
      return await axios.put(SERVER_END_POINTS.USER_VERIFICATION, payload);
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: async (
      payload: TResendVerificationDetails
    ): Promise<ApiResponse> => {
      return await axios.post(
        SERVER_END_POINTS.USER_RESEND_VERIFICATION,
        payload
      );
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (payload: TChangePassword): Promise<ApiResponse> => {
      return await axios.put(SERVER_END_POINTS.CHANGE_PASSWORD, payload);
    },
  });
};

export const useSetPassword = () => {
  return useMutation({
    mutationFn: async (payload: TSetPasswordDetails): Promise<ApiResponse> => {
      return await axios.put(SERVER_END_POINTS.SET_PASSWORD, payload);
    },
  });
};
