import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'esport_hub_token';
const USER_KEY = 'esport_hub_user';

// Memory fallback cache in case of native module bridge reload in Expo Go
const memoryStore = new Map();

export const storage = {
  async saveToken(token) {
    memoryStore.set(TOKEN_KEY, token);
    try {
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      }
    } catch (e) {
      // Fallback safely preserved in memory
    }
  },

  async getToken() {
    try {
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        const val = await AsyncStorage.getItem(TOKEN_KEY);
        if (val) return val;
      }
    } catch (e) {
      // Fall through to memory
    }
    return memoryStore.get(TOKEN_KEY) || null;
  },

  async removeToken() {
    memoryStore.delete(TOKEN_KEY);
    try {
      if (AsyncStorage && typeof AsyncStorage.removeItem === 'function') {
        await AsyncStorage.removeItem(TOKEN_KEY);
      }
    } catch (e) {}
  },

  async saveUser(user) {
    memoryStore.set(USER_KEY, JSON.stringify(user));
    try {
      if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
      }
    } catch (e) {}
  },

  async getUser() {
    try {
      if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
        const data = await AsyncStorage.getItem(USER_KEY);
        if (data) return JSON.parse(data);
      }
    } catch (e) {}
    const mem = memoryStore.get(USER_KEY);
    return mem ? JSON.parse(mem) : null;
  },

  async clearAll() {
    memoryStore.clear();
    try {
      if (AsyncStorage && typeof AsyncStorage.multiRemove === 'function') {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      }
    } catch (e) {}
  }
};
