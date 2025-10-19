import Constants from 'expo-constants';
import { FirebaseApp, FirebaseOptions, initializeApp, getApps } from 'firebase/app';
import { Firestore, getFirestore, initializeFirestore } from 'firebase/firestore';

type FirebaseConfig = FirebaseOptions & { projectId: string };

const resolveConfig = (): FirebaseConfig | null => {
  const expoExtra = (Constants?.expoConfig as { extra?: { firebase?: FirebaseConfig } } | undefined)
    ?.extra?.firebase;
  const manifestExtra = (Constants?.manifest as { extra?: { firebase?: FirebaseConfig } } | undefined)
    ?.extra?.firebase;

  const fromExtra = expoExtra ?? manifestExtra;
  if (fromExtra?.apiKey && fromExtra.projectId && fromExtra.appId) {
    return fromExtra;
  }

  const envConfig: Partial<FirebaseConfig> = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };

  const hasEnvConfig = Boolean(
    envConfig.apiKey && envConfig.projectId && envConfig.appId
  );

  return hasEnvConfig ? (envConfig as FirebaseConfig) : null;
};

let firebaseApp: FirebaseApp | null = null;
let firestoreInstance: Firestore | null = null;
let configResolutionAttempted = false;

const initializeFirebase = () => {
  if (firebaseApp) {
    return;
  }

  const config = resolveConfig();
  configResolutionAttempted = true;
  if (!config) {
    console.warn('Firebase configuration is missing. Cloud sync will be disabled.');
    return;
  }

  const apps = getApps();
  firebaseApp = apps.length > 0 ? apps[0] : initializeApp(config);

  try {
    initializeFirestore(firebaseApp, {
      experimentalForceLongPolling: true,
      useFetchStreams: false,
    });
  } catch (error) {
    // ignore if firestore already initialized
  }

  firestoreInstance = getFirestore(firebaseApp);
};

export const getFirebaseApp = (): FirebaseApp | null => {
  if (!firebaseApp && !configResolutionAttempted) {
    initializeFirebase();
  }

  return firebaseApp;
};

export const getFirestoreInstance = (): Firestore | null => {
  if (!firestoreInstance && !configResolutionAttempted) {
    initializeFirebase();
  }

  return firestoreInstance;
};
