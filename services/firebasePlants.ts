import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { PlantState } from '@/types/plant';
import { ensureDeviceId, getCachedDeviceId } from '@/utils/deviceId';

import { getFirestoreInstance } from './firebase';

const COLLECTION = 'users';
const PLANTS_FIELD = 'plants';

const getUserDocumentRef = async () => {
  const firestore = getFirestoreInstance();
  if (!firestore) {
    return null;
  }

  const deviceId = (await ensureDeviceId()).trim();
  if (!deviceId) {
    return null;
  }

  return doc(firestore, COLLECTION, deviceId);
};

export const fetchPlantsFromCloud = async (): Promise<PlantState[] | null> => {
  const docRef = await getUserDocumentRef();
  if (!docRef) {
    return null;
  }

  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as { plants?: PlantState[] } | undefined;
  if (!data || !Array.isArray(data[PLANTS_FIELD])) {
    return null;
  }

  return data[PLANTS_FIELD] ?? null;
};

export const persistPlantsToCloud = async (plants: PlantState[]): Promise<boolean> => {
  const docRef = await getUserDocumentRef();
  if (!docRef) {
    return false;
  }

  const payload = {
    [PLANTS_FIELD]: plants,
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, payload, { merge: true });
  return true;
};

export const getCloudCacheKey = () => {
  const deviceId = getCachedDeviceId();
  return deviceId ? `${COLLECTION}/${deviceId}` : undefined;
};
