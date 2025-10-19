import { storageGet, storageSet } from '@/utils/storage';

const STORAGE_KEY = 'terra-mix::device-id';

const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const randomSegment = () => Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}-${randomSegment()}-${randomSegment()}`;
};

let cachedId: string | null = null;

export const ensureDeviceId = async (): Promise<string> => {
  if (cachedId) {
    return cachedId;
  }

  const existing = await storageGet<string>(STORAGE_KEY);
  if (existing) {
    cachedId = existing;
    return existing;
  }

  const id = generateId();
  await storageSet(STORAGE_KEY, id);
  cachedId = id;
  return id;
};

export const getCachedDeviceId = () => cachedId;
