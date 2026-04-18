import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import {
    createUserWithEmailAndPassword,
    deleteUser,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    updateProfile as updateFirebaseProfile,
    type User as FirebaseUser,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { deleteUserAccountData } from '@/services/user-account';
import { firebaseAuth } from '@/services/firebase-auth';
import { uploadUserProfileImage } from '@/services/user-media';
import {
    ensureUserProfileDocument,
    updateUserProfileDocument,
    type UserProfile,
} from '@/services/user-profile';

type User = {
  id: string;
  name: string;
  email: string;
  avatarUri?: string | null;
  avatarStoragePath?: string | null;
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isInitializing: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (name: string, email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateProfile: (profile: Partial<Pick<User, 'avatarStoragePath' | 'avatarUri' | 'email' | 'name'>>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_STORAGE_URI = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}degrow-user.json` : null;
const LEGACY_HABITS_STORAGE_URI = FileSystem.documentDirectory
  ? `${FileSystem.documentDirectory}degrow-habits.json`
  : null;

function getDisplayNameFromEmail(email: string) {
  const fallback = 'Demo User';
  const emailName = email.split('@')[0]?.trim();

  if (!emailName) {
    return fallback;
  }

  return emailName
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ') || fallback;
}

async function persistUser(user: User | null) {
  if (!AUTH_STORAGE_URI) {
    return;
  }

  if (!user) {
    await FileSystem.deleteAsync(AUTH_STORAGE_URI, { idempotent: true });
    return;
  }

  await FileSystem.writeAsStringAsync(AUTH_STORAGE_URI, JSON.stringify(user));
}

async function readStoredUser() {
  if (!AUTH_STORAGE_URI) {
    return null;
  }

  try {
    const info = await FileSystem.getInfoAsync(AUTH_STORAGE_URI);

    if (!info.exists) {
      return null;
    }

    return JSON.parse(await FileSystem.readAsStringAsync(AUTH_STORAGE_URI)) as User;
  } catch {
    return null;
  }
}

function getUserHabitsStorageUri(userId: string) {
  return FileSystem.documentDirectory ? `${FileSystem.documentDirectory}degrow-habits-${userId}.json` : null;
}

async function clearLocalUserData(userId: string) {
  const storageUris = [
    AUTH_STORAGE_URI,
    getUserHabitsStorageUri(userId),
    LEGACY_HABITS_STORAGE_URI,
  ].filter((storageUri): storageUri is string => Boolean(storageUri));

  await Promise.all(
    storageUris.map((storageUri) => FileSystem.deleteAsync(storageUri, { idempotent: true }))
  );
}

function mapFirebaseUser(firebaseUser: FirebaseUser, storedUser: User | null = null): User {
  const storedSameUser = storedUser?.id === firebaseUser.uid ? storedUser : null;
  const email = firebaseUser.email ?? storedSameUser?.email ?? '';
  const name =
    firebaseUser.displayName?.trim() ||
    storedSameUser?.name?.trim() ||
    getDisplayNameFromEmail(email);

  return {
    id: firebaseUser.uid,
    name,
    email,
    avatarUri: storedSameUser?.avatarUri ?? firebaseUser.photoURL ?? null,
    avatarStoragePath: storedSameUser?.avatarStoragePath ?? null,
  };
}

function mapUserProfile(profile: UserProfile): User {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    avatarUri: profile.avatarUri ?? null,
    avatarStoragePath: profile.avatarStoragePath ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasLoadedUser, setHasLoadedUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      const storedUser = await readStoredUser();

      if (!isMounted) {
        return;
      }

      if (!firebaseUser) {
        setUser(null);
        setIsInitializing(false);
        setHasLoadedUser(true);
        return;
      }

      const authUser = mapFirebaseUser(firebaseUser, storedUser);

      setUser(authUser);
      setIsInitializing(false);
      setHasLoadedUser(true);

      try {
        const profile = await ensureUserProfileDocument(authUser);

        if (isMounted && firebaseAuth.currentUser?.uid === profile.id) {
          setUser(mapUserProfile(profile));
        }
      } catch (error) {
        if (isMounted) {
          console.warn('Unable to sync user profile with Firestore.', error);
        }
      }
    }, () => {
      if (isMounted) {
        setUser(null);
        setIsInitializing(false);
        setHasLoadedUser(true);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedUser) {
      return;
    }

    void persistUser(user).catch(() => {
      // Keep the in-memory session usable even if local persistence fails.
    });
  }, [hasLoadedUser, user]);

  const signIn = async (email: string, pass: string) => {
    setIsLoading(true);

    try {
      const credential = await signInWithEmailAndPassword(firebaseAuth, email.trim(), pass);
      const storedUser = await readStoredUser();

      setUser(mapFirebaseUser(credential.user, storedUser));
      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, pass: string) => {
    const trimmedEmail = email.trim();
    const trimmedName = name.trim();

    setIsLoading(true);

    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, trimmedEmail, pass);

      if (trimmedName) {
        await updateFirebaseProfile(credential.user, { displayName: trimmedName });
      }

      const userName = trimmedName || getDisplayNameFromEmail(trimmedEmail);

      setUser({
        id: credential.user.uid,
        name: userName,
        email: credential.user.email ?? trimmedEmail,
        avatarUri: credential.user.photoURL ?? null,
        avatarStoragePath: null,
      });

      await ensureUserProfileDocument({
        id: credential.user.uid,
        name: userName,
        email: credential.user.email ?? trimmedEmail,
        avatarUri: credential.user.photoURL ?? null,
        avatarStoragePath: null,
      });

      router.replace('/(tabs)');
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);

    try {
      await firebaseSignOut(firebaseAuth);
      setUser(null);
      router.replace('/(auth)/login');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    const currentUser = user;
    const firebaseUser = firebaseAuth.currentUser;

    if (!currentUser || !firebaseUser || firebaseUser.uid !== currentUser.id) {
      return;
    }

    setIsLoading(true);

    try {
      await deleteUserAccountData(currentUser.id, currentUser.avatarStoragePath);
      await deleteUser(firebaseUser);
      await clearLocalUserData(currentUser.id);
      setUser(null);
      router.replace('/(auth)/login');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile: AuthContextValue['updateProfile'] = async (profile) => {
    const currentUser = user;

    if (!currentUser) {
      return;
    }

    setIsLoading(true);

    try {
      const nextProfile = { ...profile };

      if (nextProfile.avatarUri) {
        const upload = await uploadUserProfileImage(
          currentUser.id,
          nextProfile.avatarUri,
          currentUser.avatarStoragePath
        );

        nextProfile.avatarUri = upload.url;
        nextProfile.avatarStoragePath = upload.storagePath;
      }

      if (firebaseAuth.currentUser?.uid === currentUser.id) {
        await updateFirebaseProfile(firebaseAuth.currentUser, {
          displayName: nextProfile.name ?? currentUser.name,
          photoURL: nextProfile.avatarUri ?? currentUser.avatarUri ?? null,
        });
      }

      await updateUserProfileDocument(currentUser.id, nextProfile);
      setUser({ ...currentUser, ...nextProfile });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isInitializing,
        signIn,
        signUp,
        signOut,
        deleteAccount,
        updateProfile,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
