import { getApp, getApps, initializeApp, type FirebaseOptions } from 'firebase/app';

export const firebaseConfig = {
  apiKey: 'AIzaSyC0zGv84BC9yjbB-xuGVjDrIV-IbemUyns',
  authDomain: 'degrow.firebaseapp.com',
  projectId: 'degrow',
  storageBucket: 'degrow.firebasestorage.app',
  messagingSenderId: '836207365733',
  appId: '1:836207365733:web:03800805a31191ead6008c',
} satisfies FirebaseOptions;

export const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
