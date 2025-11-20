/**
 * Get the correct path for static assets considering the base path
 * Used for GitHub Pages deployment where base path is /eshop_admin/
 * 
 * For Vite, assets in the public folder are automatically handled.
 * This function ensures the base path is correctly prepended.
 */
export function getAssetPath(path) {
  if (!path) return '';
  
  // Get the base URL from Vite (set in vite.config.js)
  // BASE_URL always ends with '/' in Vite (e.g., '/eshop_admin/')
  // In production builds, Vite replaces import.meta.env.BASE_URL with the actual value
  const baseUrl = import.meta.env.BASE_URL || '/';
  
  // If path is a data URL, return as is
  if (path.startsWith('data:')) {
    return path;
  }
  
  // If path already starts with base URL, return as is (already resolved)
  if (baseUrl !== '/' && path.startsWith(baseUrl)) {
    return path;
  }
  
  // Normalize the path: ensure it starts with /
  let normalizedPath = path;
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = '/' + normalizedPath;
  }
  
  // If base URL is root (/), return normalized path as is
  if (baseUrl === '/') {
    return normalizedPath;
  }
  
  // Combine base URL with normalized path
  // Remove leading slash from normalized path since baseUrl has trailing slash
  const cleanPath = normalizedPath.startsWith('/') ? normalizedPath.slice(1) : normalizedPath;
  return `${baseUrl}${cleanPath}`;
}

