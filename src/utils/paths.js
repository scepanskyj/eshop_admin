/**
 * Get the correct path for static assets considering the base path
 * Used for GitHub Pages deployment where base path is /eshop_admin/
 * 
 * For Vite, assets in the public folder are automatically handled.
 * This function ensures the base path is correctly prepended.
 */
export function getAssetPath(path) {
  // Get the base URL from Vite (set in vite.config.js)
  // BASE_URL always ends with '/' in Vite (e.g., '/eshop_admin/')
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  // If path already starts with base URL, return as is
  if (path.startsWith(baseUrl)) {
    return path;
  }
  
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Combine base URL with path
  // baseUrl already has trailing slash, so we just concatenate
  const result = `${baseUrl}${cleanPath}`;
  
  // Debug logging (remove in production if needed)
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line no-console
    console.log('getAssetPath:', { path, baseUrl, result });
  }
  
  return result;
}

