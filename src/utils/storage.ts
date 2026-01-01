import AsyncStorage from "@react-native-async-storage/async-storage";

const storagePrefix = "ai-health-care";

const storage = {
  async getToken(): Promise<string | null> {
    try {
      const value = await AsyncStorage.getItem(`${storagePrefix}_token`);

      // console.log("📥 AsyncStorage.getToken() RAW:", value);

      const parsed = value ? JSON.parse(value) : null;

      // console.log("🔍 Parsed Token:", parsed);

      return parsed;
    } catch (error) {
      // console.error('❌ Error getting token from storage:', error);
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      // console.log("💾 Saving Token to AsyncStorage:", token);

      await AsyncStorage.setItem(
        `${storagePrefix}_token`,
        JSON.stringify(token)
      );

      const verify = await AsyncStorage.getItem(`${storagePrefix}_token`);
      // console.log("✅ Token Saved! Now in storage:", verify);
    } catch (error) {
      // console.error('❌ Error setting token in storage:', error);
    }
  },

  async clearToken(): Promise<void> {
    try {
      // console.log("🗑️ Clearing token from storage...");
      await AsyncStorage.removeItem(`${storagePrefix}_token`);
      // console.log("✔ Token cleared successfully");
    } catch (error) {
      // console.error('❌ Error clearing token from storage:', error);
    }
  },
};

export default storage;
