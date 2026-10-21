import { fileNameFromUrl, upgradeProfilePictureUrl } from './url';

type Fetch = (url: string) => Promise<Response>;

async function fetchBlob(url: string, fetchFn: Fetch): Promise<Blob | null> {
  try {
    const response = await fetchFn(url);
    return response.ok ? await response.blob() : null;
  } catch {
    return null;
  }
}

/**
 * Fetches the largest version of the picture, falling back to the URL as
 * displayed when the upgraded request is refused. No other workaround is
 * attempted.
 */
export async function fetchBestImage(
  src: string,
  fetchFn: Fetch = fetch,
): Promise<{ blob: Blob; url: string } | null> {
  const upgraded = upgradeProfilePictureUrl(src);
  if (upgraded) {
    const blob = await fetchBlob(upgraded, fetchFn);
    if (blob) return { blob, url: upgraded };
  }
  const blob = await fetchBlob(src, fetchFn);
  return blob ? { blob, url: src } : null;
}

export function saveBlob(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
}

export type SavedPicture = {
  fileName: string;
  width?: number;
  height?: number;
};

async function dimensions(
  blob: Blob,
): Promise<{ width?: number; height?: number }> {
  try {
    const bitmap = await createImageBitmap(blob);
    const { width, height } = bitmap;
    bitmap.close();
    return { width, height };
  } catch {
    return {};
  }
}

export async function downloadProfilePicture(
  src: string,
): Promise<SavedPicture | null> {
  const best = await fetchBestImage(src);
  if (!best) return null;
  const fileName = fileNameFromUrl(best.url);
  saveBlob(best.blob, fileName);
  return { fileName, ...(await dimensions(best.blob)) };
}
