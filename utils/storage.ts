import { Platform } from 'react-native';

type StoredValue = string | null;

type StorageDriver = {
  getItem: (key: string) => Promise<StoredValue>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

const memoryStore = new Map<string, string>();

const memoryDriver: StorageDriver = {
  async getItem(key) {
    return memoryStore.has(key) ? memoryStore.get(key)! : null;
  },
  async setItem(key, value) {
    memoryStore.set(key, value);
  },
  async removeItem(key) {
    memoryStore.delete(key);
  },
};

let resolvedDriver: StorageDriver | null = null;

async function ensureDriver(): Promise<StorageDriver> {
  if (resolvedDriver) {
    return resolvedDriver;
  }

  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    resolvedDriver = {
      getItem: AsyncStorage.getItem,
      setItem: AsyncStorage.setItem,
      removeItem: AsyncStorage.removeItem,
    };
    return resolvedDriver;
  } catch (error) {
    // ignore and continue to other strategies
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    resolvedDriver = {
      async getItem(key) {
        return window.localStorage.getItem(key);
      },
      async setItem(key, value) {
        window.localStorage.setItem(key, value);
      },
      async removeItem(key) {
        window.localStorage.removeItem(key);
      },
    };
    return resolvedDriver;
  }

  try {
    const FileSystem = require('expo-file-system');
    const baseDir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
    if (baseDir) {
      const filePath = `${baseDir}terra-mix-storage.json`;

      const ensureFile = async () => {
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (!fileInfo.exists) {
          await FileSystem.writeAsStringAsync(filePath, '{}');
        }
      };

      resolvedDriver = {
        async getItem(key) {
          await ensureFile();
          const raw = await FileSystem.readAsStringAsync(filePath);
          const json = raw ? JSON.parse(raw) : {};
          return key in json ? json[key] : null;
        },
        async setItem(key, value) {
          await ensureFile();
          const raw = await FileSystem.readAsStringAsync(filePath);
          const json = raw ? JSON.parse(raw) : {};
          json[key] = value;
          await FileSystem.writeAsStringAsync(filePath, JSON.stringify(json));
        },
        async removeItem(key) {
          await ensureFile();
          const raw = await FileSystem.readAsStringAsync(filePath);
          const json = raw ? JSON.parse(raw) : {};
          if (key in json) {
            delete json[key];
            await FileSystem.writeAsStringAsync(filePath, JSON.stringify(json));
          }
        },
      };
      return resolvedDriver;
    }
  } catch (error) {
    // ignore and fall back to in-memory driver
  }

  resolvedDriver = memoryDriver;
  return resolvedDriver;
}

export async function storageGet<T = unknown>(key: string): Promise<T | null> {
  const driver = await ensureDriver();
  const raw = await driver.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn('Unable to parse stored value for key', key, error);
    return null;
  }
}

export async function storageSet<T>(key: string, value: T): Promise<void> {
  const driver = await ensureDriver();
  await driver.setItem(key, JSON.stringify(value));
}

export async function storageRemove(key: string): Promise<void> {
  const driver = await ensureDriver();
  await driver.removeItem(key);
}
