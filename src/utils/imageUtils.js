export const getImageUrl = (path) => {
  if (!path) return null;

  
  if (path.startsWith('data:image/')) {
    return path;
  }

s
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Build URL using environment variable for file paths
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${baseUrl}/media/${path}`;
};
/**
 * Get category fallback emoji for products
 * @param {string} category 
 * @returns {string} 
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

  return fallbacks[category] || '🛒';
};
