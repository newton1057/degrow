import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FirebaseAuth from 'firebase/auth';
import type { Persistence } from 'firebase/auth';

import { firebaseApp } from '@/services/firebase-app';

const getReactNativePersistence = (
  FirebaseAuth as typeof FirebaseAuth & {
    getReactNativePersistence?: (storage: typeof AsyncStorage) => Persistence;
  }
).getReactNativePersistence;

function initializeFirebaseAuth() {
  if (typeof getReactNativePersistence !== 'function') {
    return FirebaseAuth.getAuth(firebaseApp);
  }

  try {
    return FirebaseAuth.initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    return FirebaseAuth.getAuth(firebaseApp);
  }
}

export const firebaseAuth = initializeFirebaseAuth();
