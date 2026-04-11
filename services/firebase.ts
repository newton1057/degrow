import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

import { firebaseApp, firebaseConfig } from '@/services/firebase-app';
import { firebaseAuth } from '@/services/firebase-auth';

export { firebaseApp, firebaseAuth, firebaseConfig };

export const firestore = getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);
