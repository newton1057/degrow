import * as FileSystem from 'expo-file-system/legacy';
import { deleteObject, getDownloadURL, ref } from 'firebase/storage';

import { firebaseStorage } from '@/services/firebase';
import { firebaseConfig } from '@/services/firebase-app';
import { firebaseAuth } from '@/services/firebase-auth';

type UploadedUserImage = {
  url: string;
  storagePath: string | null;
};

const EXTENSION_TO_CONTENT_TYPE: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
};

export function isRemoteUri(uri: string) {
  return /^https?:\/\//i.test(uri);
}

function getImageExtension(uri: string) {
  const extension = uri.match(/\.([a-z0-9]+)(?:\?.*)?$/i)?.[1]?.toLowerCase();

  if (extension && EXTENSION_TO_CONTENT_TYPE[extension]) {
    return extension;
  }

  return 'jpg';
}

/**
 * Upload a local image to Firebase Storage using the REST API.
 *
 * The Firebase JS SDK's uploadString / uploadBytes helpers are unreliable in
 * React Native because Hermes cannot create Blobs from ArrayBuffer.  Using
 * expo-file-system's uploadAsync against the Firebase Storage REST endpoint
 * sidesteps the issue entirely.
 */
export async function uploadUserProfileImage(
  userId: string,
  imageUri: string,
  previousStoragePath?: string | null
): Promise<UploadedUserImage> {
  if (isRemoteUri(imageUri)) {
    return {
      url: imageUri,
      storagePath: previousStoragePath ?? null,
    };
  }

  const extension = getImageExtension(imageUri);
  const contentType = EXTENSION_TO_CONTENT_TYPE[extension] ?? EXTENSION_TO_CONTENT_TYPE.jpg;
  const storagePath = `users/${userId}/profile/avatar-${Date.now()}.${extension}`;

  // Encode the storage path for the REST URL.
  const encodedPath = encodeURIComponent(storagePath);
  const bucket = firebaseConfig.storageBucket ?? '';
  const idToken = await firebaseAuth.currentUser?.getIdToken();

  if (!idToken) {
    throw new Error('User must be authenticated to upload a profile image.');
  }

  // Firebase Storage REST API endpoint for uploads.
  const uploadUrl = [
    'https://firebasestorage.googleapis.com/v0',
    `/b/${bucket}/o`,
    `?uploadType=media&name=${encodedPath}`,
  ].join('');

  const uploadResult = await FileSystem.uploadAsync(uploadUrl, imageUri, {
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      'Authorization': `Firebase ${idToken}`,
      'Content-Type': contentType,
    },
  });

  if (uploadResult.status !== 200) {
    throw new Error(
      `Upload failed with status ${uploadResult.status}: ${uploadResult.body}`
    );
  }

  // Parse the response to extract the download token / metadata.
  const metadata = JSON.parse(uploadResult.body);

  // Build the download URL manually since getDownloadURL may not work with REST-uploaded files.
  const downloadToken = metadata.downloadTokens ?? metadata.metadata?.firebaseStorageDownloadTokens;
  const token = typeof downloadToken === 'string'
    ? downloadToken
    : Array.isArray(downloadToken)
      ? downloadToken[0]
      : null;

  let url: string;

  if (token) {
    url = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodedPath}?alt=media&token=${token}`;
  } else {
    // Fall back to the SDK in case the token was added server-side.
    const storageRef = ref(firebaseStorage, storagePath);
    url = await getDownloadURL(storageRef);
  }

  if (previousStoragePath && previousStoragePath !== storagePath) {
    void deleteObject(ref(firebaseStorage, previousStoragePath)).catch(() => {
      // A stale profile image should not block the new profile image from being used.
    });
  }

  return {
    url,
    storagePath,
  };
}
