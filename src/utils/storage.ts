import AsyncStorage from "@react-native-async-storage/async-storage";

const storagePrefix = "ai-health-care";

const storage = {
  async getToken(): Promise<string | null> {
    try {
      const value = await AsyncStorage.getItem(`${storagePrefix}_token`);

      const parsed = value ? JSON.parse(value) : null;

      return parsed;
    } catch (error) {
      return null;
    }
  },

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${storagePrefix}_token`,
        JSON.stringify(token)
      );

      const verify = await AsyncStorage.getItem(`${storagePrefix}_token`);
    } catch (error) {}
  },

  async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${storagePrefix}_token`);
    } catch (error) {}
  },
};

export default storage;
