import * as FileSystem from 'expo-file-system/legacy';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'expo-router';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedUser, setHasLoadedUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;

    const loadStoredUser = async () => {
      if (!AUTH_STORAGE_URI) {
        setIsLoading(false);
        setHasLoadedUser(true);
        return;
      }

      try {
        const info = await FileSystem.getInfoAsync(AUTH_STORAGE_URI);

        if (info.exists) {
          const storedUser = JSON.parse(await FileSystem.readAsStringAsync(AUTH_STORAGE_URI)) as User;

          if (isMounted && storedUser?.id && storedUser?.email) {
            setUser(storedUser);
          }
        }
      } catch {
        // Ignore invalid local auth snapshots. Backend auth will replace this later.
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setHasLoadedUser(true);
        }
      }
    };

    void loadStoredUser();

    return () => {
      isMounted = false;
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
    await new Promise((resolve) => setTimeout(resolve, 800));
    setUser({ id: '1', name: getDisplayNameFromEmail(email), email, avatarUri: null });
    setIsLoading(false);
    router.replace('/(tabs)');
  };

  const signUp = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setUser({ id: '1', name, email, avatarUri: null });
    setIsLoading(false);
    router.replace('/(tabs)');
  };

  const signOut = async () => {
    setUser(null);
    router.replace('/(auth)/login');
  };

  const updateProfile: AuthContextValue['updateProfile'] = (profile) => {
    setUser((currentUser) => (currentUser ? { ...currentUser, ...profile } : currentUser));
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
