// Phone version: plain require. (Expo Go cannot fetch split-off JavaScript chunks, so no dynamic import here.)
export type FirebaseLib = { app: typeof import('firebase/app'); auth: typeof import('firebase/auth') };

export async function loadFirebase(): Promise<FirebaseLib> {
  return { app: require('firebase/app'), auth: require('firebase/auth') };
}
