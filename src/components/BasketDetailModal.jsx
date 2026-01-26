import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Star, ShoppingBag, Package, Calendar, TrendingDown } from 'lucide-react';
import ratingService from '../services/ratingService';
import subscriptionService from '../services/subscriptionService';
import authService from '../services/authService';
import { getImageUrl, getCategoryFallbackEmoji } from '../utils/imageUtils';
import basketpng from "../assets/basketpng.png";

// Star Rating Display Component
const StarRating = ({ rating = 0, count = 0 }) => {
  const safeRating = rating || 0;
  const safeCount = count || 0;
  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating % 1 >= 0.5;

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
        {safeRating > 0 ? `${safeRating.toFixed(1)}` : 'No ratings'}
        {safeCount > 0 && ` (${safeCount})`}
      </span>
    </div>
  );
};

function BasketDetailModal({ basket, onClose, onSubscribe }) {
  const [producerRating, setProducerRating] = useState({ average_rating: 0, total_ratings: 0 });
  const [productRatings, setProductRatings] = useState({});
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);

  // Check if current user is the producer of this basket
  const currentUser = authService.getCurrentUser();
  const currentUserId = currentUser?.id;
  const isProducer = currentUser?.user_type === 'producer';
  const isOwnBasket = currentUserId && basket?.producer_id === currentUserId;

  // Check if user is already subscribed to this basket
  useEffect(() => {
    const checkSubscription = async () => {
      if (!basket || isProducer || !currentUser) return;

      try {
        const response = await subscriptionService.getMySubscriptions();
        const subscriptions = response.subscriptions || [];
        const isSubscribed = subscriptions.some(
          sub => sub.basket_id === basket.id && (sub.status === 'active' || sub.status === 'paused')
        );
        setIsAlreadySubscribed(isSubscribed);
      } catch (err) {
        console.error('Failed to check subscription:', err);
      }
    };

    checkSubscription();
  }, [basket, isProducer, currentUser]);

  useEffect(() => {
    const fetchRatings = async () => {
      if (!basket) return;

      try {
        // Fetch producer rating
        if (basket.producer_id) {
          try {
            const producerRatingData = await ratingService.getProducerRating(basket.producer_id);
            setProducerRating({
              average_rating: producerRatingData?.average_rating || 0,
              total_ratings: producerRatingData?.total_ratings || 0
            });
          } catch (err) {
            console.error('Failed to fetch producer rating:', err);
            setProducerRating({ average_rating: 0, total_ratings: 0 });
          }
        }

        // Fetch product ratings
        const ratings = {};
        for (const product of basket.products || []) {
          try {
            const rating = await ratingService.getProductRatings(product.id);
            ratings[product.id] = {
              average_rating: rating?.average_rating || 0,
              total_ratings: rating?.total_ratings || 0
            };
          } catch (err) {
            ratings[product.id] = { average_rating: 0, total_ratings: 0 };
          }
        }
        setProductRatings(ratings);
      } catch (err) {
        console.error('Failed to fetch ratings:', err);
      }
    };

    fetchRatings();
  }, [basket]);

  if (!basket) return null;

  const bannerUrl = getImageUrl(basket.producer_banner);
  
  // Get unique product categories from basket products
  const productCategories = basket.products 
    ? [...new Set(basket.products.map(p => p.product_type).filter(Boolean))]
    : [];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Producer Banner Background */}
        <div className="relative h-64 overflow-hidden">
          {/* Producer Banner Image */}
          {bannerUrl ? (
            <img
              src={bannerUrl}
              alt={basket.producer_shop_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-100 to-teal-100"></div>
          )}
          
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
          
          {/* Basket Emoji Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <img
                          src={basketpng}
                          alt="Subscription Basket"
                          className="inline-block w-20 h-20 drop-shadow-2xl align-middle object-contain"
                        />
              {basket.discount_percentage > 0 && (
                <div className="absolute -top-4 -right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg animate-pulse">
                  -{basket.discount_percentage}%
                </div>
              )}
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Bottom Info Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-3xl font-bold mb-2 drop-shadow-lg">{basket.name}</h2>
            <div className="flex items-center gap-4 text-sm flex-wrap">
              <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <ShoppingBag className="w-4 h-4" />
                {basket.producer_shop_name}
              </span>
              <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <Package className="w-4 h-4" />
                {basket.product_count || basket.products?.length || 0} products
              </span>
              <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <Calendar className="w-4 h-4" />
                {basket.delivery_frequency === 'weekly' ? 'Weekly' : basket.delivery_frequency === 'biweekly' ? 'Bi-weekly' : 'Monthly'}
              </span>
              {/*  Pickup Day Badge */}
              {basket.pickup_day && (
                <span className="flex items-center gap-1 bg-green-500/80 backdrop-blur-sm px-3 py-1 rounded-full font-semibold">
                  <Calendar className="w-4 h-4" />
                  Every {basket.pickup_day}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Quick Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Price Card */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-xl border border-green-200">
              <p className="text-sm text-gray-600 mb-2">Price per delivery</p>
              {basket.discount_percentage > 0 ? (
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-[#285153]">
                    {parseFloat(basket.discounted_price).toFixed(2)} DA
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg text-gray-400 line-through">
                      {parseFloat(basket.original_price).toFixed(2)} DA
                    </span>
                    <span className="flex items-center gap-1 text-xs bg-red-500 text-white px-2 py-1 rounded-full font-semibold">
                      <TrendingDown className="w-3 h-3" />
                      Save {(parseFloat(basket.original_price) - parseFloat(basket.discounted_price)).toFixed(2)} DA
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-3xl font-bold text-[#285153]">
                  {parseFloat(basket.original_price).toFixed(2)} DA
                </p>
              )}
            </div>

            {/* Categories Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
              <p className="text-sm text-gray-600 mb-2">Product Categories</p>
              <div className="flex flex-wrap gap-2">
                {productCategories.length > 0 ? (
                  productCategories.map((category) => (
                    <span key={category} className="text-lg">
                      {getCategoryFallbackEmoji(category)}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No categories</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {productCategories.join(', ') || 'Mixed items'}
              </p>
            </div>

            {/* Producer Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
              <p className="text-sm text-gray-600 mb-2">From Producer</p>
              <p className="font-bold text-[#285153] text-lg mb-1">{basket.producer_shop_name}</p>
              <StarRating rating={producerRating.average_rating} count={producerRating.total_ratings} />
            </div>
          </div>

          {/* Description */}
          {basket.description && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">About this basket</h3>
              <p className="text-gray-600 text-sm">{basket.description}</p>
            </div>
          )}

          {/* ✅ Pickup Day Info (Standalone) */}
          {basket.pickup_day && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-900">
                <Calendar className="w-5 h-5" />
                <span className="font-semibold text-base">
                  Pickup available every {basket.pickup_day}
                </span>
              </div>
            </div>
          )}

          {/* Products List */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-[#285153] mb-4 flex items-center gap-2">
              <Package className="w-6 h-6" />
              What's inside ({basket.product_count || basket.products?.length || 0} products)
            </h3>
            
            {(!basket.products || basket.products.length === 0) ? (
              <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg">No products added yet</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {basket.products.map((product) => {
                  const productImageUrl = getImageUrl(product.photo_url);
                  const rating = productRatings[product.id] || { average_rating: 0, total_ratings: 0 };
                  const categoryEmoji = getCategoryFallbackEmoji(product.product_type);
                  
                  return (
                    <div key={product.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                      {/* Product Image */}
                      <div className="relative w-14 h-14 flex-shrink-0">
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
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-800 text-sm truncate">{product.name}</h4>
                          {product.quantity > 1 && (
                            <span className="bg-[#285153] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                              x{product.quantity}
                            </span>
                          )}
                        </div>
                        <StarRating rating={rating.average_rating} count={rating.total_ratings} />
                        <p className="text-xs text-gray-600">
                          {product.quantity} {product.sale_type === 'weight' ? 'kg' : (product.quantity > 1 ? 'units' : 'unit')}
                        </p>
                      </div>

                      {/* Product Price */}
                      <div className="text-right">
                        <p className="font-bold text-[#285153] text-sm">
                          {(parseFloat(product.price) * (product.quantity || 1)).toFixed(2)} DA
                        </p>
                        <p className="text-xs text-gray-500">
                          {product.price} DA/{product.sale_type === 'weight' ? 'kg' : 'unit'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Subscribe Button - Hidden for producers and already subscribed */}
          {!isOwnBasket && !isProducer && !isAlreadySubscribed ? (
            <div className="sticky bottom-0 bg-white pt-4 border-t">
              <button
                onClick={() => onSubscribe && onSubscribe(basket)}
                className="w-full py-4 bg-[#285153] text-white rounded-xl font-bold text-lg hover:bg-[#1f3f40] transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Subscribe to this Basket
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Cancel anytime - Flexible delivery - Fresh products weekly
              </p>
            </div>
          ) : isAlreadySubscribed ? (
            <div className="sticky bottom-0 bg-white pt-4 border-t">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-700 text-center font-semibold">
                  You are already subscribed to this basket
                </p>
              </div>
            </div>
          ) : isOwnBasket ? (
            <div className="sticky bottom-0 bg-white pt-4 border-t">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-800 text-center font-semibold">
                  This is your basket. You cannot subscribe to your own baskets.
                </p>
              </div>
            </div>
          ) : (
            <div className="sticky bottom-0 bg-white pt-4 border-t">
              <div className="p-4 bg-gray-100 border border-gray-200 rounded-xl">
                <p className="text-gray-600 text-center font-semibold">
                  Producers cannot subscribe to baskets
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default BasketDetailModal;