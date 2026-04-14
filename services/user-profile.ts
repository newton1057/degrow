import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { firestore } from '@/services/firebase';
import { toFirestoreData } from '@/services/firestore-utils';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarUri?: string | null;
  avatarStoragePath?: string | null;
};

type UserProfileDocument = {
  uid?: unknown;
  name?: unknown;
  email?: unknown;
  avatarUri?: unknown;
  avatarStoragePath?: unknown;
};

function getUserProfileRef(userId: string) {
  return doc(firestore, 'users', userId);
}

function readOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value : null;
}

function mapUserProfileDocument(userId: string, data: UserProfileDocument, fallback: UserProfile): UserProfile {
  return {
    id: userId,
    name: readOptionalString(data.name) ?? fallback.name,
    email: readOptionalString(data.email) ?? fallback.email,
    avatarUri: readOptionalString(data.avatarUri) ?? fallback.avatarUri ?? null,
    avatarStoragePath: readOptionalString(data.avatarStoragePath) ?? fallback.avatarStoragePath ?? null,
  };
}

export async function ensureUserProfileDocument(fallback: UserProfile) {
  const userRef = getUserProfileRef(fallback.id);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(
      userRef,
      toFirestoreData({
        uid: fallback.id,
        name: fallback.name,
        email: fallback.email,
        avatarUri: fallback.avatarUri ?? null,
        avatarStoragePath: fallback.avatarStoragePath ?? null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );

    return fallback;
  }

  const profile = mapUserProfileDocument(fallback.id, snapshot.data(), fallback);

  await setDoc(
    userRef,
    toFirestoreData({
      uid: fallback.id,
      name: profile.name,
      email: fallback.email,
      avatarUri: profile.avatarUri ?? null,
      avatarStoragePath: profile.avatarStoragePath ?? null,
      updatedAt: serverTimestamp(),
    }),
    { merge: true }
  );

  return {
    ...profile,
    email: fallback.email,
  };
}

export async function updateUserProfileDocument(userId: string, profile: Partial<Omit<UserProfile, 'id'>>) {
  await setDoc(
    getUserProfileRef(userId),
    toFirestoreData({
      ...profile,
      uid: userId,
      updatedAt: serverTimestamp(),
    }),
    { merge: true }
  );
}
