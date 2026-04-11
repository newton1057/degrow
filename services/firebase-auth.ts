import { getAuth } from 'firebase/auth';

import { firebaseApp } from '@/services/firebase-app';

export const firebaseAuth = getAuth(firebaseApp);
