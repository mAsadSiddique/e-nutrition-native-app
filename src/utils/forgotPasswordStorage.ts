import AsyncStorage from "@react-native-async-storage/async-storage";

const FORGOT_PASSWORD_KEY = "forgot_password_data";

export interface ForgotPasswordData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export const forgotPasswordStorage = {
  async store(data: ForgotPasswordData): Promise<void> {
    try {
      await AsyncStorage.setItem(FORGOT_PASSWORD_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error storing forgot password data:', error);
      throw error;
    }
  },

  async retrieve(): Promise<ForgotPasswordData | null> {
    try {
      const data = await AsyncStorage.getItem(FORGOT_PASSWORD_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving forgot password data:', error);
      return null;
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FORGOT_PASSWORD_KEY);
    } catch (error) {
      console.error('Error clearing forgot password data:', error);
    }
  }
};
