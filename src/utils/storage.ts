import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryFallback: Record<string, string> = {};

export const storage = {
  async getItem(key: string): Promise<string | null> {
    try {
      const val = await AsyncStorage.getItem(key);
      if (val !== null) return val;
      return memoryFallback[key] ?? null;
    } catch {
      return memoryFallback[key] ?? null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      memoryFallback[key] = value;
      await AsyncStorage.setItem(key, value);
    } catch {
      memoryFallback[key] = value;
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      delete memoryFallback[key];
      await AsyncStorage.removeItem(key);
    } catch {
      delete memoryFallback[key];
    }
  },
};
