/**
 * Helpers for Expo ImagePicker → stable file URI + RN FormData image part (Multer).
 * Shared by admin animal form, events, etc.
 */
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

/** RN FormData file part for Multer field name "image" */
export function buildImageFormPart(asset) {
  const uri = asset.uri;
  let name =
    typeof asset.fileName === 'string' && asset.fileName.trim()
      ? asset.fileName.trim()
      : uri.split('/').pop()?.split('?')[0] || '';
  if (!name || !/[.][a-z0-9]{2,5}$/i.test(name)) {
    const extFromMime =
      typeof asset.mimeType === 'string' && asset.mimeType.includes('png') ? 'png' : 'jpg';
    name = `photo-${Date.now()}.${extFromMime}`;
  }
  const ext = /\.(\w+)$/.exec(name)?.[1]?.toLowerCase();
  const typeFromExt =
    ext === 'png'
      ? 'image/png'
      : ext === 'webp'
        ? 'image/webp'
        : ext === 'heic'
          ? 'image/heic'
          : 'image/jpeg';
  let type = typeof asset.mimeType === 'string' && asset.mimeType.trim() ? asset.mimeType.trim() : typeFromExt;
  if (type === 'image/jpg') type = 'image/jpeg';
  return { uri, name, type };
}

export function pickerPreviewSource(asset) {
  if (!asset?.uri) return null;
  const { uri, base64, mimeType } = asset;
  if (typeof base64 === 'string' && base64.length > 0) {
    const needsDataUri =
      uri.startsWith('content') || uri.startsWith('ph://') || uri.startsWith('assets-library');
    if (needsDataUri) {
      let mime = 'image/jpeg';
      if (typeof mimeType === 'string' && mimeType.startsWith('image/')) {
        mime = mimeType.split(';')[0].trim();
      }
      return { uri: `data:${mime};base64,${base64}` };
    }
  }
  return { uri };
}

async function ensureUploadableFileUri(asset, cachePrefix) {
  const uri = asset?.uri;
  if (!uri) return null;

  if (Platform.OS === 'web') return uri;

  if (Platform.OS === 'android' && uri.startsWith('content')) {
    const ext = asset.mimeType?.includes('png') ? 'png' : 'jpg';
    const dest = `${FileSystem.cacheDirectory}${cachePrefix}-${Date.now()}.${ext}`;
    try {
      await FileSystem.copyAsync({ from: uri, to: dest });
      return dest;
    } catch (copyErr) {
      try {
        const b64 = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });
        await FileSystem.writeAsStringAsync(dest, b64, { encoding: 'base64' });
        return dest;
      } catch (readErr) {
        console.error('[ensureUploadableFileUri]', readErr);
        throw new Error('Could not read this photo. Try another image.');
      }
    }
  }

  if (
    Platform.OS === 'ios' &&
    (uri.startsWith('ph://') || uri.startsWith('assets-library://'))
  ) {
    const ext = asset.mimeType?.includes('png') ? 'png' : 'jpg';
    const dest = `${FileSystem.cacheDirectory}${cachePrefix}-${Date.now()}.${ext}`;
    try {
      await FileSystem.copyAsync({ from: uri, to: dest });
      return dest;
    } catch {
      return uri;
    }
  }

  if (Platform.OS === 'android' && !uri.startsWith('file://') && uri.startsWith('/')) {
    return `file://${uri}`;
  }

  return uri;
}

/**
 * Prefer picker base64 → cache file (reliable with FormData on Android content://).
 */
export async function preparePickerAssetForUpload(asset, cachePrefix = 'upload') {
  if (!asset) return null;
  if (Platform.OS === 'web') return asset.uri || null;

  if (typeof asset.base64 === 'string' && asset.base64.length > 0) {
    if (!FileSystem.cacheDirectory) {
      throw new Error('App storage is unavailable. Restart the app and try again.');
    }
    const ext = asset.mimeType?.includes('png') ? 'png' : 'jpg';
    const dest = `${FileSystem.cacheDirectory}${cachePrefix}-${Date.now()}.${ext}`;
    await FileSystem.writeAsStringAsync(dest, asset.base64, { encoding: 'base64' });
    return dest;
  }

  return ensureUploadableFileUri(asset, cachePrefix);
}
