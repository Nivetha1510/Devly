// Web version: loaded on first use as a separate chunk, so it does not slow down app start-up.
export type FirebaseLib = { app: typeof import('firebase/app'); auth: typeof import('firebase/auth') };

export async function loadFirebase(): Promise<FirebaseLib> {
  const [app, auth] = await Promise.all([import('firebase/app'), import('firebase/auth')]);
  return { app, auth };
}
