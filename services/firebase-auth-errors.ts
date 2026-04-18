import { FirebaseError } from 'firebase/app';

export function getFirebaseAuthErrorMessageKey(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return 'auth.errorGeneric';
  }

  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'auth.errorEmailInUse';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'auth.errorInvalidCredentials';
    case 'auth/invalid-email':
      return 'auth.errorInvalidEmail';
    case 'auth/operation-not-allowed':
      return 'auth.errorEmailAuthDisabled';
    case 'auth/weak-password':
      return 'auth.errorWeakPassword';
    case 'auth/requires-recent-login':
      return 'auth.errorRequiresRecentLogin';
    default:
      return 'auth.errorGeneric';
  }
}
