/**
 * Get the correct path for static assets considering the base path
 * Used for GitHub Pages deployment where base path is /eshop_admin/
 * 
 * For Vite, assets in the public folder are automatically handled,
 * but we need to prepend the base URL when it's not '/'
 */
export function getAssetPath(path) {
  // Get the base URL from Vite (set in vite.config.js)
  // BASE_URL always ends with '/' in Vite
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  // If path already starts with base URL, return as is
  if (path.startsWith(baseUrl)) {
    return path;
  }
  
  // Remove leading slash from path if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Combine base URL with path
  // baseUrl already has trailing slash (e.g., '/eshop_admin/')
  return `${baseUrl}${cleanPath}`;
}

