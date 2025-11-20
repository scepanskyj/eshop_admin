/**
 * Get the base URL for the application
 * Detects from import.meta.env.BASE_URL (set by Vite) or falls back to window.location
 */
function getBaseUrl() {
  // Vite replaces import.meta.env.BASE_URL at build time
  // In production: '/eshop_admin/'
  // In development: '/'
  let baseUrl = '/';
  
  // Try to get BASE_URL from import.meta.env (set by Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) {
    baseUrl = import.meta.env.BASE_URL;
  }
  
  // Ensure baseUrl ends with /
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }
  
  // If we got a non-root base URL, use it
  if (baseUrl !== '/') {
    return baseUrl;
  }
  
  // Fallback: detect from window.location in production
  // This handles cases where BASE_URL might not be set correctly
  if (typeof window !== 'undefined' && window.location) {
    const pathname = window.location.pathname;
    // Check if we're in a subdirectory (e.g., /eshop_admin/)
    // Match pattern like /eshop_admin/ or /eshop_admin/some/path
    const match = pathname.match(/^(\/[^\/]+\/)/);
    if (match && match[1] !== '/') {
      return match[1];
    }
  }
  
  return '/';
}

/**
 * Get the correct path for static assets considering the base path
 * Used for GitHub Pages deployment where base path is /eshop_admin/
 * 
 * For Vite, assets in the public folder are automatically handled.
 * This function ensures the base path is correctly prepended.
 */
export function getAssetPath(path) {
  if (!path) return '';
  
  // If path is a data URL, return as is
  if (path.startsWith('data:')) {
    return path;
  }
  
  const baseUrl = getBaseUrl();
  
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
  const resolvedPath = `${baseUrl}${cleanPath}`;
  
  return resolvedPath;
}

