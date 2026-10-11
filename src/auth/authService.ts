// Authentication for the app.
//  - Firebase Auth when EXPO_PUBLIC_FIREBASE_* values are set (real accounts, password reset, Google).
//  - Otherwise on-device accounts: email + salted password hash kept in AsyncStorage (this device only).
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { firebaseConfigured, getFirebaseAuth } from './firebase';
import { loadFirebase } from './firebaseLib';

// Loaded on demand so Firebase is not part of app start-up.
const fbAuth = async () => (await loadFirebase()).auth;

// Shown on the sign-in screen so you can tell which version of the app is running.
export const BUILD_TAG = 'auth-v3-no-chunks';

export type AuthUser = { name: string; email: string };

export const authMode: 'firebase' | 'local' = firebaseConfigured ? 'firebase' : 'local';
// Google sign-in uses Firebase's popup flow, which is available on web.
export const googleAvailable = firebaseConfigured && Platform.OS === 'web';
export const canResetPassword = firebaseConfigured;

const ACCOUNTS_KEY = 'devly:accounts:v1';
type Account = { name: string; salt: string; hash: string };

const nameFromEmail = (email: string) => email.split('@')[0];

async function hash(salt: string, password: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

async function loadAccounts(): Promise<Record<string, Account>> {
  try {
    return JSON.parse((await AsyncStorage.getItem(ACCOUNTS_KEY)) ?? '{}');
  } catch {
    return {};
  }
}

// Turns Firebase / local errors into messages a learner can act on.
export function authMessage(err: unknown): string {
  const code = (err as { code?: string })?.code ?? '';
  const map: Record<string, string> = {
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/wrong-password': 'Incorrect email or password.',
    'auth/user-not-found': 'Incorrect email or password.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/email-already-in-use': 'An account with this email already exists. Try signing in.',
    'auth/weak-password': 'Choose a password with at least 6 characters.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/network-request-failed': 'No internet connection. Check your network and try again.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/cancelled-popup-request': 'Google sign-in was cancelled.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled for the project yet.',
  };
  if (map[code]) return map[code];
  if (err instanceof Error && !code) return err.message;
  return 'Something went wrong. Please try again.';
}

export async function signUp(name: string, email: string, password: string): Promise<AuthUser> {
  if (firebaseConfigured) {
    const f = await fbAuth();
    const cred = await f.createUserWithEmailAndPassword(await getFirebaseAuth(), email, password);
    await f.updateProfile(cred.user, { displayName: name });
    return { name, email };
  }
  const accounts = await loadAccounts();
  if (accounts[email]) throw new Error('An account with this email already exists. Try signing in.');
  const salt = Crypto.randomUUID();
  accounts[email] = { name, salt, hash: await hash(salt, password) };
  await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  return { name, email };
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  if (firebaseConfigured) {
    const f = await fbAuth();
    const { user } = await f.signInWithEmailAndPassword(await getFirebaseAuth(), email, password);
    return { name: user.displayName || nameFromEmail(email), email: user.email ?? email };
  }
  const account = (await loadAccounts())[email];
  // Same message for unknown email and wrong password, so accounts cannot be probed.
  if (!account || (await hash(account.salt, password)) !== account.hash) throw new Error('Incorrect email or password.');
  return { name: account.name, email };
}

export async function signInWithGoogle(): Promise<AuthUser> {
  const f = await fbAuth();
  const { user } = await f.signInWithPopup(await getFirebaseAuth(), new f.GoogleAuthProvider());
  const email = user.email ?? '';
  return { name: user.displayName || nameFromEmail(email), email };
}

export async function resetPassword(email: string): Promise<void> {
  const f = await fbAuth();
  await f.sendPasswordResetEmail(await getFirebaseAuth(), email);
}

export async function signOut(): Promise<void> {
  if (!firebaseConfigured) return;
  try {
    const f = await fbAuth();
    await f.signOut(await getFirebaseAuth());
  } catch {
    /* already signed out */
  }
}
