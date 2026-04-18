import { doc, onSnapshot, serverTimestamp, setDoc, type Unsubscribe } from 'firebase/firestore';

import { type HabitItem } from '@/constants/habits';
import { firestore } from '@/services/firebase';
import { toFirestoreData } from '@/services/firestore-utils';

export type UserHabitsState = {
  weekId: string;
  habits: HabitItem[];
};

function getUserHabitsStateRef(userId: string) {
  return doc(firestore, 'users', userId, 'habits', 'current');
}

function mapHabitsState(data: Record<string, unknown> | undefined): UserHabitsState | null {
  if (!data || typeof data.weekId !== 'string' || !Array.isArray(data.habits)) {
    return null;
  }

  return {
    weekId: data.weekId,
    habits: data.habits as HabitItem[],
  };
}

export function subscribeToUserHabitsState(
  userId: string,
  onState: (state: UserHabitsState | null) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return onSnapshot(
    getUserHabitsStateRef(userId),
    (snapshot) => {
      onState(snapshot.exists() ? mapHabitsState(snapshot.data()) : null);
    },
    onError
  );
}

export async function saveUserHabitsState(userId: string, state: UserHabitsState) {
  await setDoc(
    getUserHabitsStateRef(userId),
    toFirestoreData({
      ...state,
      updatedAt: serverTimestamp(),
    }),
    { merge: true }
  );
}
