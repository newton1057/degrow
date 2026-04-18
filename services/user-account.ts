import { deleteDoc, doc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';

import { firestore, firebaseStorage } from '@/services/firebase';

export async function deleteUserAccountData(userId: string, avatarStoragePath?: string | null) {
  const deleteRequests = [
    deleteDoc(doc(firestore, 'users', userId, 'habits', 'current')),
    deleteDoc(doc(firestore, 'users', userId, 'settings', 'preferences')),
    deleteDoc(doc(firestore, 'users', userId)),
  ];

  if (avatarStoragePath) {
    deleteRequests.push(deleteObject(ref(firebaseStorage, avatarStoragePath)).catch(() => undefined));
  }

  await Promise.all(deleteRequests);
}
