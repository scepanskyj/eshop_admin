import { getAssetPath } from '@/utils/paths';

/**
 * Resolve stored icon value (data URL, site-relative path, or passthrough) for <img src>.
 */
export function resolveIconPath(value) {
  if (!value) return '';
  if (value.startsWith('data:')) {
    return value;
  }
  if (value.startsWith('/')) {
    return getAssetPath(value);
  }
  return value;
}
