import * as FileSystem from 'expo-file-system/legacy';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile as updateFirebaseProfile,
  type User as FirebaseUser,
} from 'firebase/auth';

import { firebaseAuth } from '@/services/firebase-auth';

type User = {
  id: string;
  name: string;
  email: string;
  avatarUri?: string | null;
};

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (name: string, email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (profile: Partial<Pick<User, 'avatarUri' | 'email' | 'name'>>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_STORAGE_URI = FileSystem.documentDirectory ? `${FileSystem.documentDirectory}degrow-user.json` : null;

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
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedUser, setHasLoadedUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      const storedUser = await readStoredUser();

      if (!isMounted) {
        return;
      }

      setUser(firebaseUser ? mapFirebaseUser(firebaseUser, storedUser) : null);
      setIsLoading(false);
      setHasLoadedUser(true);
    }, () => {
      if (isMounted) {
        setUser(null);
        setIsLoading(false);
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

      setUser({
        id: credential.user.uid,
        name: trimmedName || getDisplayNameFromEmail(trimmedEmail),
        email: credential.user.email ?? trimmedEmail,
        avatarUri: credential.user.photoURL ?? null,
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

  const updateProfile: AuthContextValue['updateProfile'] = (profile) => {
    setUser((currentUser) => {
      if (!currentUser) {
        return currentUser;
      }

      if (profile.name && firebaseAuth.currentUser?.uid === currentUser.id) {
        void updateFirebaseProfile(firebaseAuth.currentUser, { displayName: profile.name }).catch(() => {
          // Keep local profile changes usable even if the remote display name update fails.
        });
      }

      return { ...currentUser, ...profile };
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
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
