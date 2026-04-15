import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from '@/providers/auth-provider';

const MIGRATION_KEY = '@degrow_name_migration_done';

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

function looksDerivedFromEmail(name: string, email: string): boolean {
  if (!name || !email) {
    return false;
  }

  const emailLocal = email.split('@')[0]?.toLowerCase();
  if (!emailLocal) {
    return false;
  }

  const normalizedName = name.toLowerCase().trim();
  const emailParts = emailLocal.split(/[._-]+/).filter(Boolean);

  if (emailParts.length === 0) {
    return false;
  }

  return emailParts.some((part) => normalizedName === part.toLowerCase());
}

const AUTH_ROUTES = ['/(auth)/login', '/(auth)/register', '(auth)'];
const MIGRATION_ROUTE = '/name-migration';

export function useNameMigrationRedirect() {
  const { user, isInitializing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (isInitializing || !user || hasRunRef.current) {
      return;
    }

    const isOnAuthRoute = AUTH_ROUTES.some((route) => pathname?.startsWith(route));

    if (isOnAuthRoute || pathname === MIGRATION_ROUTE) {
      return;
    }

    const derivedName = getDisplayNameFromEmail(user.email);
    const isDerived =
      user.name === derivedName || looksDerivedFromEmail(user.name, user.email);

    if (!isDerived) {
      hasRunRef.current = true;
      return;
    }

    hasRunRef.current = true;

    AsyncStorage.getItem(MIGRATION_KEY).then((stored) => {
      if (stored === 'true') {
        return;
      }

      router.replace(MIGRATION_ROUTE);
    }).catch(() => {
      // If storage fails, still try to redirect once.
      router.replace(MIGRATION_ROUTE);
    });
  }, [user, isInitializing, pathname, router]);
}
