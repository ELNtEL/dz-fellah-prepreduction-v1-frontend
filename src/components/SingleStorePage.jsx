import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, ArrowLeft, Package, Star, Phone, User } from "lucide-react";
import ProductDetailModal from "./product-detail-modal";
import { producerService } from "../services";
import ratingService from "../services/ratingService";
import PublicNavBar from './PublicNavBar';
import { getImageUrl, getCategoryFallbackEmoji } from '../utils/imageUtils';

// Star Rating Display Component
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
        {rating > 0 ? `${rating.toFixed(1)}` : 'No ratings yet'}
        {count > 0 && ` (${count})`}
      </span>
    </div>
  );
};

export default function SingleStorePage({ onNavigateToHome, onNavigateToLogin, onNavigateToSignup }) {
  const { storeId } = useParams();
  const navigate = useNavigate();

  const [store, setStore] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [producerRating, setProducerRating] = useState(null);
  const [productRatings, setProductRatings] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (storeId) {
      fetchStoreData();
    }
  }, [storeId]);

  const fetchStoreData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch store details
      const storeResponse = await producerService.getProducerById(storeId);
      setStore(storeResponse.producer || storeResponse);

      // Fetch producer rating
      fetchProducerRating(storeId);

      // Fetch store products
      fetchStoreProducts(storeId);
    } catch (err) {
      console.error('Failed to fetch store:', err);
      setError('Failed to load store. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducerRating = async (producerId) => {
    try {
      const rating = await ratingService.getProducerRating(producerId);
      setProducerRating(rating);
    } catch (err) {
      console.error('Failed to fetch producer rating:', err);
      setProducerRating(null);
    }
  };

  const fetchStoreProducts = async (producerId) => {
    setProductsLoading(true);

    try {
      const response = await producerService.getProducerProducts(producerId);
      const products = response.products || [];
      setStoreProducts(products);

      // Fetch ratings for all products
      const ratings = {};
      for (const product of products) {
        try {
          const rating = await ratingService.getProductRatings(product.id);
          ratings[product.id] = rating;
        } catch (err) {
          ratings[product.id] = { average_rating: 0, total_ratings: 0 };
        }
      }
      setProductRatings(ratings);
    } catch (err) {
      console.error('Failed to fetch store products:', err);
      setStoreProducts([]);
    } finally {
      setProductsLoading(false);
    }
  };

  const nextProduct = () => {
    if (storeProducts.length === 0) return;
    setCurrentProductIndex((prev) => (prev + 1) % storeProducts.length);
  };

  const prevProduct = () => {
    if (storeProducts.length === 0) return;
    setCurrentProductIndex((prev) => (prev - 1 + storeProducts.length) % storeProducts.length);
  };

  const getVisibleProducts = () => {
    if (storeProducts.length === 0) return [];
    const visible = [];
    const count = Math.min(3, storeProducts.length);
    for (let i = 0; i < count; i++) {
      visible.push(storeProducts[(currentProductIndex + i) % storeProducts.length]);
    }
    return visible;
  };

  const handleBackToStores = () => {
    navigate('/stores');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <PublicNavBar currentPage="stores" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#285153]"></div>
            <p className="mt-4 text-gray-600">Loading store...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <PublicNavBar currentPage="stores" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Store not found'}</p>
            <button
              onClick={handleBackToStores}
              className="px-6 py-2 bg-[#285153] text-white rounded-lg hover:bg-[#1f3f40]"
            >
              Back to Stores
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <PublicNavBar currentPage="stores" />

      <div className="min-h-screen bg-gray-50">
        {/* Store Header Banner */}
        <div className="relative h-64">
          {getImageUrl(store.photo_url) ? (
            <img
              src={getImageUrl(store.photo_url)}
              alt={store.shop_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center">
              <span className="text-9xl font-bold text-[#285153]">
                {store.shop_name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <button
            onClick={handleBackToStores}
            className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-6 h-6 text-[#285153]" />
          </button>
        </div>

        {/* Store Info Card */}
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-12">
          <div className="bg-white rounded-xl shadow-md p-8 -mt-32 relative z-10 mb-12">
            <h1 className="text-4xl font-bold text-[#285153] mb-4">{store.shop_name}</h1>

            {/* Producer Rating */}
            <div className="mb-4">
              {producerRating ? (
                <StarRating
                  rating={producerRating.average_rating || 0}
                  count={producerRating.total_ratings || 0}
                />
              ) : (
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-none text-gray-300" />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">No ratings yet</span>
                </div>
              )}
            </div>

            {store.description && (
              <p className="text-gray-600 mb-6">{store.description}</p>
            )}

            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
              {/* Producer Name */}
              {(store.first_name || store.last_name) && (
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#285153]" />
                  <span className="font-medium">{store.first_name} {store.last_name}</span>
                </div>
              )}
              {/* Phone */}
              {store.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-[#285153]" />
                  <span>{store.phone}</span>
                </div>
              )}
              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#285153]" />
                <span>{store.city}, {store.wilaya}</span>
              </div>
              {/* Address */}
              {store.address && (
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#285153]" />
                  <span>{store.address}</span>
                </div>
              )}
              {/* Bio Certified Badge */}
              {store.is_bio_certified && (
                <div className="flex items-center gap-2">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                    ✓ Bio Certified
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Store Products Section */}
          <div>
            <h2 className="text-3xl font-bold text-[#285153] mb-8">Store Products</h2>

            {productsLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#285153]"></div>
              </div>
            )}

            {!productsLoading && storeProducts.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl">
                <p className="text-gray-600">No products available in this store.</p>
              </div>
            )}

            {!productsLoading && storeProducts.length > 0 && (
              <div className="relative">
                {storeProducts.length > 3 && (
                  <>
                    <button
                      onClick={prevProduct}
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                    >
                      <ChevronLeft className="w-6 h-6 text-[#285153]" />
                    </button>

                    <button
                      onClick={nextProduct}
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                    >
                      <ChevronRight className="w-6 h-6 text-[#285153]" />
                    </button>
                  </>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {getVisibleProducts().map((product) => {
                    const rating = productRatings[product.id] || { average_rating: 0, total_ratings: 0 };

                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <div className="relative">
                          {getImageUrl(product.image || product.photo_url) ? (
                            <img
                              src={getImageUrl(product.image || product.photo_url)}
                              alt={product.name}
                              className="w-full h-48 object-cover"
                            />
                          ) : (
                            <div className="w-full h-48 bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center">
                              <span className="text-8xl">
                                {getCategoryFallbackEmoji(product.product_type)}
                              </span>
                            </div>
                          )}
                          {product.is_seasonal && (
                            <span className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              🌱 In Season
                            </span>
                          )}
                          {product.has_anti_waste_discount && (
                            <span className="absolute top-12 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              -50%
                            </span>
                          )}
                        </div>

                        <div className="p-4">
                          <h3 className="font-bold text-lg text-gray-800 mb-2">{product.name}</h3>

                          {/* Product Rating */}
                          <div className="mb-2">
                            <StarRating rating={rating.average_rating} count={rating.total_ratings} />
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[#285153] font-bold text-xl">
                              {product.has_anti_waste_discount ? (
                                <>
                                  <span className="line-through text-gray-400 text-sm mr-2">
                                    {product.original_price} DA
                                  </span>
                                  {product.price} DA
                                </>
                              ) : (
                                `${product.price} DA`
                              )}
                              /{product.unit}
                            </span>
                          </div>
                          {product.stock && (
                            <p className="text-xs text-gray-500 mt-2">
                              Stock: {product.stock} {product.unit}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <footer className="bg-[#285153] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 text-center">
          <p className="text-lg mb-4">DZ-Fellah - Connecting Algerian Farmers with Consumers</p>
          <p className="text-sm text-gray-300">© 2025 DZ-Fellah. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
