import * as FileSystem from 'expo-file-system/legacy';
import { deleteObject, getDownloadURL, ref, uploadString } from 'firebase/storage';

import { firebaseStorage } from '@/services/firebase';

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
  const storageRef = ref(firebaseStorage, storagePath);
  const base64Image = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await uploadString(storageRef, base64Image, 'base64', { contentType });
  const url = await getDownloadURL(storageRef);

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
