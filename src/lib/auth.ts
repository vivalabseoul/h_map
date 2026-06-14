// ==========================================
// Auth Helpers — Google + Email/Password
// ==========================================
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './firebase';
import type { AppUser, UserRole } from '@/types';

const googleProvider = new GoogleAuthProvider();

/**
 * Create or update the user document in Firestore
 */
async function ensureUserDocument(user: User, role: UserRole = 'member'): Promise<void> {
  if (!db) return;
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      role,
      createdAt: serverTimestamp(),
      preferredLocale: 'en',
      disabled: false,
    });
  }
}

/**
 * Fetch user role from Firestore
 */
export async function getUserRole(uid: string): Promise<UserRole> {
  if (!db) return 'member';
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return (userSnap.data() as AppUser).role;
    }
  } catch (error) {
    console.warn('Error fetching user role:', error);
  }
  return 'member';
}

/**
 * Fetch full user profile from Firestore
 */
export async function getUserProfile(uid: string): Promise<AppUser | null> {
  if (!db) return null;
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as AppUser;
    }
  } catch (error) {
    console.warn('Error fetching user profile:', error);
  }
  return null;
}

/**
 * Google Sign-In
 */
export async function signInWithGoogle(): Promise<User | null> {
  if (!auth) {
    alert('Firebase is not configured. Please set up your .env.local file.');
    return null;
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    await ensureUserDocument(result.user);
    return result.user;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === 'auth/popup-closed-by-user') return null;
    console.error('Google sign-in error:', err.message);
    throw error;
  }
}

/**
 * Email/Password Sign-In
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<User | null> {
  if (!auth) {
    alert('Firebase is not configured. Please set up your .env.local file.');
    return null;
  }
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    console.error('Email sign-in error:', err.message);
    throw error;
  }
}

/**
 * Email/Password Registration
 */
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string
): Promise<User | null> {
  if (!auth) {
    alert('Firebase is not configured. Please set up your .env.local file.');
    return null;
  }
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName });
    await ensureUserDocument(result.user, 'member');
    return result.user;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    console.error('Registration error:', err.message);
    throw error;
  }
}

/**
 * Sign Out
 */
export async function signOutUser(): Promise<void> {
  if (!auth) return;
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
  }
}

/**
 * Auth state listener
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export { isFirebaseConfigured };
