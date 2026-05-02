import { Platform } from 'react-native';

/**
 * Attach a picker asset as multipart field `image` for POST/PUT `/store/products`.
 * Web: must use Blob/File (RN style `{ uri }` breaks in browsers).
 */
export async function appendProductImageToFormData(formData, fieldName, asset) {
  if (!asset?.uri) return false;

  let filename = typeof asset.fileName === 'string' ? asset.fileName.trim() : '';
  if (!filename || !/[.][a-z0-9]{2,4}$/i.test(filename)) {
    const extFromMime =
      typeof asset.mimeType === 'string' && asset.mimeType.includes('png') ? 'png' : 'jpg';
    filename = `product-${Date.now()}.${extFromMime}`;
  }

  let mimeType =
    typeof asset.mimeType === 'string' && asset.mimeType.trim() ? asset.mimeType.trim() : 'image/jpeg';
  if (mimeType === 'image/jpg') mimeType = 'image/jpeg';

  if (Platform.OS === 'web') {
    try {
      const direct = asset.file;
      if (direct instanceof Blob) {
        if (typeof File !== 'undefined' && !(direct instanceof File)) {
          const f = new File([direct], filename, { type: direct.type || mimeType });
          formData.append(fieldName, f);
        } else {
          formData.append(fieldName, direct, filename);
        }
        return true;
      }

      const response = await fetch(asset.uri);
      if (!response.ok) return false;
      const blob = await response.blob();
      const type = blob.type || mimeType;
      if (typeof File !== 'undefined') {
        formData.append(fieldName, new File([blob], filename, { type }));
      } else {
        formData.append(fieldName, blob, filename);
      }
      return true;
    } catch {
      return false;
    }
  }

  formData.append(fieldName, { uri: asset.uri, name: filename, type: mimeType });
  return true;
}
