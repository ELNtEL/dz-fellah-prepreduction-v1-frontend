import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Star, Package, Calendar } from 'lucide-react';
import ratingService from '../../services/ratingService';

// Helper function to build full image URL
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `http://localhost:8000/media/${path}`;
};

// Category fallback emojis
const getCategoryFallbackEmoji = (category) => {
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

// Star Rating Component
const StarRating = ({ rating, count }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= fullStars
              ? 'fill-yellow-400 text-yellow-400'
              : star === fullStars + 1 && hasHalfStar
              ? 'fill-yellow-200 text-yellow-400'
              : 'fill-none text-gray-300'
          }`}
        />
      ))}
      <span className="text-sm text-gray-600 ml-1">
        {rating > 0 ? `${rating.toFixed(1)}` : 'No ratings'}
        {count > 0 && ` (${count})`}
      </span>
    </div>
  );
};

function SubscriptionDetailModal({ isOpen, onClose, basket }) {
  const [productRatings, setProductRatings] = useState({});

  useEffect(() => {
    const fetchRatings = async () => {
      if (!basket || !basket.products) return;
      
      try {
        const ratings = {};
        for (const product of basket.products) {
          try {
            const rating = await ratingService.getProductRatings(product.id);
            ratings[product.id] = rating;
          } catch (err) {
            ratings[product.id] = { average_rating: 0, total_ratings: 0 };
          }
        }
        setProductRatings(ratings);
      } catch (err) {
        console.error('Failed to fetch ratings:', err);
      }
    };

    if (isOpen) {
      fetchRatings();
    }
  }, [basket, isOpen]);

  if (!isOpen || !basket) return null;

  const bannerUrl = getImageUrl(basket.producer_banner);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Banner */}
        <div className="relative h-48">
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt={basket.producer_shop_name}
              className="w-full h-full object-cover"
              onError={(e) => e.target.style.display = 'none'}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-100 to-teal-100"></div>
          )}
          
          <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-8xl">🧺</span>
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5" />
          </button>

          {basket.discount_percentage > 0 && (
            <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full font-bold">
              -{basket.discount_percentage}% OFF
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h2 className="text-3xl font-bold text-[#285153] mb-2">{basket.name}</h2>
          <p className="text-gray-600 mb-4">{basket.description}</p>

          {/* Producer Info */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">From</p>
            <p className="font-semibold text-[#285153]">{basket.producer_shop_name}</p>
          </div>

          {/* Pricing */}
          <div className="mb-6">
            {basket.discount_percentage > 0 ? (
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold text-[#285153]">
                  {parseFloat(basket.discounted_price).toFixed(2)} DA
                </span>
                <span className="text-xl text-gray-400 line-through">
                  {parseFloat(basket.original_price).toFixed(2)} DA
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-[#285153]">
                {parseFloat(basket.original_price).toFixed(2)} DA
              </span>
            )}
          </div>

          {/* Pickup Day */}
          {basket.pickup_day && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-900">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">Pickup: Every {basket.pickup_day}</span>
              </div>
            </div>
          )}

          {/* Products List */}
          <div>
            <h3 className="text-xl font-bold text-[#285153] mb-4 flex items-center gap-2">
              <Package className="w-6 h-6" />
              Products ({basket.product_count || basket.products?.length || 0})
            </h3>
            
            {(!basket.products || basket.products.length === 0) ? (
              <p className="text-gray-500 text-center py-8">No products added yet</p>
            ) : (
              <div className="space-y-3">
                {basket.products.map((product) => {
                  const productImageUrl = getImageUrl(product.photo_url);
                  const rating = productRatings[product.id] || { average_rating: 0, total_ratings: 0 };
                  const categoryEmoji = getCategoryFallbackEmoji(product.product_type);
                  
                  return (
                    <div key={product.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        {productImageUrl ? (
                          <img
                            src={productImageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-full h-full bg-gradient-to-br from-green-100 to-teal-100 rounded-lg flex items-center justify-center text-2xl"
                          style={{ display: productImageUrl ? 'none' : 'flex' }}
                        >
                          {categoryEmoji}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{product.name}</h4>
                        <StarRating rating={rating.average_rating} count={rating.total_ratings} />
                        <p className="text-sm text-gray-600">
                          Quantity: {product.quantity} {product.sale_type === 'weight' ? 'kg' : 'unit'}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-[#285153]">
                          {parseFloat(product.price).toFixed(2)} DA
                        </p>
                        <p className="text-xs text-gray-500">
                          per {product.sale_type === 'weight' ? 'kg' : 'unit'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default SubscriptionDetailModal;