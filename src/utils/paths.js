/**
 * Get the correct path for static assets considering the base path
 * Used for GitHub Pages deployment where base path is /eshop_admin/
 */
export function getAssetPath(path) {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In production with base path, prepend it
  if (process.env.NODE_ENV === 'production' && import.meta.env.BASE_URL !== '/') {
    const base = import.meta.env.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
    return `${base}/${cleanPath}`;
  }
  
  // In development, use absolute path
  return `/${cleanPath}`;
}

