import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Auth } from 'firebase/auth';
import { loadFirebase } from './firebaseLib';
import { Platform } from 'react-native';

// Values come from .env.local (see .env.example). EXPO_PUBLIC_* are inlined at build time.
const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
};

export const firebaseConfigured = !!(config.apiKey && config.authDomain && config.projectId && config.appId);

let auth: Auth | null = null;

// Firebase is loaded on first use, so it does not slow down the app starting up.
export async function getFirebaseAuth(): Promise<Auth> {
  if (auth) return auth;
  const { app: appLib, auth: authLib } = await loadFirebase();
  const { getApp, getApps, initializeApp } = appLib;
  const app = getApps().length ? getApp() : initializeApp(config);
  if (Platform.OS === 'web') {
    auth = authLib.getAuth(app);
  } else {
    // Keeps the Firebase session between app launches. Not in the public typings, so read dynamically.
    const { getReactNativePersistence } = authLib as unknown as {
      getReactNativePersistence: (storage: typeof AsyncStorage) => never;
    };
    try {
      auth = authLib.initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
    } catch {
      auth = authLib.getAuth(app); // already initialised (fast refresh)
    }
  }
  return auth;
}
