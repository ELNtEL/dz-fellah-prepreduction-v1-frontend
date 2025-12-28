export const getImageUrl = (path) => {
  if (!path) return null;

  // If it's a base64 data URL, return as-is
  if (path.startsWith('data:image/')) {
    return path;
  }

  // If already a full URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Build URL using environment variable for file paths
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${baseUrl}/media/${path}`;
};
/**
 * Get category fallback emoji for products
 * @param {string} category - Product category
 * @returns {string} - Emoji for the category
 */
export const getCategoryFallbackEmoji = (category) => {
  const fallbacks = {
    'Vegetables': '🥬',
    'Fruits': '🍎',
    'Dairy': '🥛',
    'Oils': '🫒',
    'Honey': '🍯',
    'Grains': '🌾',
    'Meat': '🥩',
    'Other': '📦'
  };

  return fallbacks[category] || '📦';
};
