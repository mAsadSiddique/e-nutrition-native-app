import type { TUserProfile } from "@/src/utils/types";
import { createReducer } from "@reduxjs/toolkit";
import {
    setLoading,
    setUserProfile,
    signIn,
    signOut,
    updateUserProfile,
} from "./action";
import { TAuthState } from "./type";

const initialState: TAuthState = {
  userProfile: {} as TUserProfile,
  isLoading: true,
};

export const auth = createReducer(initialState, (builder) => {
  builder
    .addCase(setUserProfile, (state, { payload: { profile } }) => {
      console.log('Reducer: Setting userProfile to:', profile);
      state.userProfile = profile;
      console.log('Reducer: Updated state.userProfile:', state.userProfile);
    })
    .addCase(updateUserProfile, (state, { payload: { profile } }) => {
      if (state.userProfile) {
        state.userProfile = { ...state.userProfile, ...profile };
      }
    })
    .addCase(setLoading, (state, { payload: { isLoading } }) => {
      state.isLoading = isLoading;
    })
    .addCase(signIn, (state, { payload: { profile } }) => {
      if (profile) {
        state.userProfile = profile;
      }
    })
    .addCase(signOut, (state) => {
      state.userProfile = {} as TUserProfile;
    });
});
