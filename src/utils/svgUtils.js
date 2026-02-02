/**
 * Convert SVG colors to gray (except white)
 * Converts all non-white colors to Material Design gray-500 (#9E9E9E)
 * 
 * @param {string} svgInput - SVG as data URL (data:image/svg+xml;base64,... or data:image/svg+xml,...) or file path
 * @returns {Promise<string>} Modified SVG as data URL
 */
export async function convertSvgToGray(svgInput) {
  if (!svgInput) {
    return '';
  }

  let svgDataUrl = svgInput;

  // If it's a file path, fetch it first
  if (svgInput.startsWith('/')) {
    try {
      const { getAssetPath } = await import('@/utils/paths');
      const fullPath = getAssetPath(svgInput);
      const response = await fetch(fullPath);
      if (!response.ok) {
        console.warn('Failed to fetch SVG:', fullPath);
        return '';
      }
      const svgText = await response.text();
      // Convert to data URL
      const encoded = encodeURIComponent(svgText);
      svgDataUrl = `data:image/svg+xml,${encoded}`;
    } catch (error) {
      console.warn('Failed to fetch and convert SVG:', error);
      return '';
    }
  }

  if (!svgDataUrl.startsWith('data:image/svg+xml')) {
    return svgDataUrl;
  }

  try {
    // Extract the SVG content from the data URL
    let svgContent;
    if (svgDataUrl.includes('base64,')) {
      // Base64 encoded
      const base64Data = svgDataUrl.split('base64,')[1];
      svgContent = decodeURIComponent(escape(atob(base64Data)));
    } else {
      // URL encoded
      const encodedData = svgDataUrl.split(',')[1];
      svgContent = decodeURIComponent(encodedData);
    }

    // Parse SVG and convert colors
    const grayColor = '#9E9E9E'; // Material Design gray-500
    const whiteColors = ['#ffffff', '#fff', 'white', 'rgb(255,255,255)', 'rgba(255,255,255,1)', 'rgba(255,255,255,0)'];
    
    // Function to check if a color is white (or transparent)
    function isWhite(color) {
      if (!color) return false;
      const normalized = color.toLowerCase().trim();
      return whiteColors.includes(normalized) || 
             normalized === 'transparent' ||
             normalized === 'none' ||
             normalized.startsWith('rgba(255,255,255,0') ||
             // Handle rgba with various alpha values for white
             /^rgba?\s*\(\s*255\s*,\s*255\s*,\s*255\s*(,\s*0\s*)?\s*\)$/i.test(normalized);
    }

    // Function to convert a color value to gray if not white
    function convertColor(color) {
      if (!color || isWhite(color)) return color;
      return grayColor;
    }

    // Replace fill colors
    svgContent = svgContent.replace(/fill=["']([^"']+)["']/gi, (match, color) => {
      return `fill="${convertColor(color)}"`;
    });

    // Replace stroke colors
    svgContent = svgContent.replace(/stroke=["']([^"']+)["']/gi, (match, color) => {
      return `stroke="${convertColor(color)}"`;
    });

    // Replace style attributes with fill/stroke
    svgContent = svgContent.replace(/style=["']([^"']+)["']/gi, (match, styleContent) => {
      let modifiedStyle = styleContent;
      
      // Replace fill in style
      modifiedStyle = modifiedStyle.replace(/fill:\s*([^;]+)/gi, (styleMatch, color) => {
        return `fill: ${convertColor(color.trim())}`;
      });
      
      // Replace stroke in style
      modifiedStyle = modifiedStyle.replace(/stroke:\s*([^;]+)/gi, (styleMatch, color) => {
        return `stroke: ${convertColor(color.trim())}`;
      });
      
      return `style="${modifiedStyle}"`;
    });

    // Reconstruct the data URL
    const encoded = encodeURIComponent(svgContent);
    return `data:image/svg+xml,${encoded}`;
  } catch (error) {
    console.warn('Failed to convert SVG to gray:', error);
    return svgDataUrl; // Return original on error
  }
}

/**
 * Synchronous version for cases where we already have a data URL
 * (for backwards compatibility and simple cases)
 */
export function convertSvgToGraySync(svgDataUrl) {
  if (!svgDataUrl || !svgDataUrl.startsWith('data:image/svg+xml')) {
    return svgDataUrl;
  }

  try {
    // Extract the SVG content from the data URL
    let svgContent;
    if (svgDataUrl.includes('base64,')) {
      // Base64 encoded
      const base64Data = svgDataUrl.split('base64,')[1];
      svgContent = decodeURIComponent(escape(atob(base64Data)));
    } else {
      // URL encoded
      const encodedData = svgDataUrl.split(',')[1];
      svgContent = decodeURIComponent(encodedData);
    }

    // Parse SVG and convert colors
    const grayColor = '#9E9E9E'; // Material Design gray-500
    const whiteColors = ['#ffffff', '#fff', 'white', 'rgb(255,255,255)', 'rgba(255,255,255,1)', 'rgba(255,255,255,0)'];
    
    // Function to check if a color is white (or transparent)
    function isWhite(color) {
      if (!color) return false;
      const normalized = color.toLowerCase().trim();
      return whiteColors.includes(normalized) || 
             normalized === 'transparent' ||
             normalized === 'none' ||
             normalized.startsWith('rgba(255,255,255,0') ||
             // Handle rgba with various alpha values for white
             /^rgba?\s*\(\s*255\s*,\s*255\s*,\s*255\s*(,\s*0\s*)?\s*\)$/i.test(normalized);
    }

    // Function to convert a color value to gray if not white
    function convertColor(color) {
      if (!color || isWhite(color)) return color;
      return grayColor;
    }

    // Replace fill colors
    svgContent = svgContent.replace(/fill=["']([^"']+)["']/gi, (match, color) => {
      return `fill="${convertColor(color)}"`;
    });

    // Replace stroke colors
    svgContent = svgContent.replace(/stroke=["']([^"']+)["']/gi, (match, color) => {
      return `stroke="${convertColor(color)}"`;
    });

    // Replace style attributes with fill/stroke
    svgContent = svgContent.replace(/style=["']([^"']+)["']/gi, (match, styleContent) => {
      let modifiedStyle = styleContent;
      
      // Replace fill in style
      modifiedStyle = modifiedStyle.replace(/fill:\s*([^;]+)/gi, (styleMatch, color) => {
        return `fill: ${convertColor(color.trim())}`;
      });
      
      // Replace stroke in style
      modifiedStyle = modifiedStyle.replace(/stroke:\s*([^;]+)/gi, (styleMatch, color) => {
        return `stroke: ${convertColor(color.trim())}`;
      });
      
      return `style="${modifiedStyle}"`;
    });

    // Reconstruct the data URL
    const encoded = encodeURIComponent(svgContent);
    return `data:image/svg+xml,${encoded}`;
  } catch (error) {
    console.warn('Failed to convert SVG to gray:', error);
    return svgDataUrl; // Return original on error
  }
}

/**
 * Extract filename from icon path or data URL
 * @param {string} iconPath - Icon path (/icons/file.svg) or data URL
 * @param {string} fallbackFilename - Optional fallback filename if iconPath is a data URL
 * @returns {string} Filename without extension or empty string
 */
export function extractIconFilename(iconPath, fallbackFilename = null) {
  if (!iconPath) {
    return fallbackFilename ? fallbackFilename.replace(/\.svg$/i, '') : '';
  }
  
  // If it's a file path like /icons/cardonline.svg
  if (iconPath.startsWith('/')) {
    const parts = iconPath.split('/');
    const filename = parts[parts.length - 1] || '';
    // Remove extension
    return filename.replace(/\.svg$/i, '');
  }
  
  // If it's a data URL and we have a fallback filename, use it
  if (fallbackFilename) {
    return fallbackFilename.replace(/\.svg$/i, '');
  }
  
  // For data URLs without fallback, return empty
  return '';
}

/**
 * Generate disabled icon filename from original icon filename
 * @param {string} originalIconPath - Original icon path or data URL
 * @param {string} suffix - Suffix to add (default: '-disabled' or '-autogenerated')
 * @param {string} fallbackFilename - Optional filename if originalIconPath is a data URL
 * @returns {string} Modified filename
 */
export function generateDisabledIconFilename(originalIconPath, suffix = '-disabled', fallbackFilename = null) {
  const baseFilename = extractIconFilename(originalIconPath, fallbackFilename);
  if (!baseFilename) {
    // If we can't extract filename, use a generic name
    return `icon${suffix}.svg`;
  }
  return `${baseFilename}${suffix}.svg`;
}
