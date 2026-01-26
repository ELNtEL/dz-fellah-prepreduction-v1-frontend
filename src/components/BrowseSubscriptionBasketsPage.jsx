import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, X, Package, Calendar, Store } from "lucide-react";
import BasketDetailModal from "./BasketDetailModal";
import SubscriptionFormModal from "./SubscriptionFormModal";
import basketService from "../services/basketService";
import authService from "../services/authService";
import { useNavigate } from 'react-router-dom';
import PublicNavBar from "./PublicNavBar";
import { getImageUrl } from "../utils/imageUtils";

// Assets
import farmerImage from "../assets/basket.png";
import leafImage from "../assets/leaf.png";
import decor1 from "../assets/decoration.png";
// This import is already here in your code, so we will use it below
import basketpng from "../assets/basketpng.png";

// Get unique categories from products
const getProductCategories = (products) => {
  if (!products || products.length === 0) return [];
  const categories = [...new Set(products.map(p => p.product_type).filter(Boolean))];
  return categories;
};

export default function BrowseSubscriptionBasketsPage() {
  const navigate = useNavigate();
  const [selectedBasket, setSelectedBasket] = useState(null);
  const [subscriptionBasket, setSubscriptionBasket] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    producer_search: ''
  });

  const [baskets, setBaskets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBaskets();
  }, []);

  const fetchBaskets = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiFilters = {};

      if (filters.search) apiFilters.search = filters.search;
      if (filters.producer_search) apiFilters.producer_id = filters.producer_search;

      const response = await basketService.getAllBaskets(apiFilters);
      const fetchedBaskets = response.baskets || [];

      // Fetch details for each basket to get products and categories
      const basketsWithDetails = await Promise.all(
        fetchedBaskets.map(async (basket) => {
          try {
            const details = await basketService.getBasketDetail(basket.id);
            return {
              ...basket,
              products: details.products || [],
              categories: getProductCategories(details.products)
            };
          } catch (err) {
            return {
              ...basket,
              products: [],
              categories: []
            };
          }
        })
      );

      setBaskets(basketsWithDetails);
    } catch (err) {
      console.error('Failed to fetch baskets:', err);
      setError('Failed to load baskets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBaskets();
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      producer_search: ''
    });
  };

  useEffect(() => {
    fetchBaskets();
  }, [filters]);

  const hasActiveFilters = filters.search || filters.producer_search;

  const handleViewDetails = async (basketId) => {
    try {
      const basket = await basketService.getBasketDetail(basketId);
      setSelectedBasket(basket);
    } catch (err) {
      console.error('Failed to fetch basket details:', err);
    }
  };

  const handleSubscribeClick = (basket) => {
    // Check authentication before subscribing
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }

    setSubscriptionBasket(basket);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <PublicNavBar currentPage="subscriptions" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-50 to-green-50 py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-[#285153] mb-6">
              Weekly Baskets <br />
              <span className="text-green-600">Fresh & Delivered</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Subscribe to weekly baskets from local farms - prepared for you
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <img src={farmerImage} alt="Farmer" className="w-full max-w-md mx-auto" />
          </motion.div>
        </div>

        <img src={leafImage} alt="" className="absolute top-10 right-10 w-32 opacity-20" />
        <img src={decor1} alt="" className="absolute bottom-10 left-10 w-24 opacity-20" />
      </section>

      {/* Search & Filters */}
      <section className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <form onSubmit={handleSearch} className="space-y-4 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search baskets by name..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#285153]"
                />
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by farm/producer name..."
                  value={filters.producer_search}
                  onChange={(e) => setFilters(prev => ({ ...prev, producer_search: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#285153]"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-8 py-3 bg-[#285153] text-white rounded-lg font-semibold hover:bg-[#1f3f40] transition"
              >
                Search
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold transition flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              )}
            </div>
          </form>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Basket: "{filters.search}"
                </span>
              )}
              {filters.producer_search && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Producer: "{filters.producer_search}"
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Baskets Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#285153]">
              {hasActiveFilters ? 'Filtered Baskets' : 'Available Baskets'}
            </h2>
            <p className="text-gray-600">
              {!loading && `${baskets.length} basket${baskets.length !== 1 ? 's' : ''} available`}
            </p>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#285153]"></div>
              <p className="mt-4 text-gray-600">Loading baskets...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchBaskets}
                className="mt-4 px-6 py-2 bg-[#285153] text-white rounded-lg hover:bg-[#1f3f40]"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && baskets.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No baskets found.</p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-[#285153] text-white rounded-lg hover:bg-[#1f3f40]"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}

          {!loading && !error && baskets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {baskets.map((basket) => {
                const bannerUrl = getImageUrl(basket.producer_banner);
                const currentUser = authService.getCurrentUser();
                const currentUserId = currentUser?.id;
                const isProducer = currentUser?.user_type === 'producer';
                const isOwnBasket = currentUserId && basket.producer_id === currentUserId;

                return (
                  <motion.div
                    key={basket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
                  >
                    {/* Basket Image with Banner + Overlay Image */}
                    <div className="relative h-48">
                      {/* Producer Banner Background */}
                      {bannerUrl ? (
                        <img
                          src={bannerUrl}
                          alt={basket.producer_shop_name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'block';
                          }}
                        />
                      ) : null}
                      <div
                        className="w-full h-full bg-gradient-to-br from-green-100 to-teal-100"
                        style={{ display: bannerUrl ? 'none' : 'block' }}
                      ></div>

                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

                      {/* Basket Image Overlay (Replaced the hardcoded laundry image) */}
                      <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
                        <img
                          src={basketpng}
                          alt="Subscription Basket"
                          className="inline-block w-20 h-20 drop-shadow-2xl align-middle object-contain"
                        />
                      </div>

                      {/* Discount Badge */}
                      {basket.discount_percentage > 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg z-20">
                          -{basket.discount_percentage}% OFF
                        </div>
                      )}

                      {/* Producer Name at Bottom */}
                      <div className="absolute bottom-2 left-2 right-2 z-20">
                        <div className="bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Store className="w-4 h-4 text-[#285153]" />
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {basket.producer_shop_name || 'Local Farm'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Basket Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 mb-2 truncate">{basket.name}</h3>

                      {/* Product Categories */}
                      {basket.categories && basket.categories.length > 0 && (
                        <div className="mb-3">
                          <div className="flex flex-wrap gap-1.5">
                            {basket.categories.map((category, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" />
                          {basket.product_count || 0} items
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {basket.delivery_frequency === 'weekly' ? 'Weekly' : basket.delivery_frequency === 'biweekly' ? 'Bi-weekly' : 'Monthly'}
                        </span>
                      </div>

                      {/* Pricing */}
                      <div className="mb-3">
                        {basket.discount_percentage > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-[#285153]">
                              {parseFloat(basket.discounted_price).toFixed(2)} DA
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              {parseFloat(basket.original_price).toFixed(2)} DA
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl font-bold text-[#285153]">
                            {parseFloat(basket.original_price).toFixed(2)} DA
                          </span>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">per delivery</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(basket.id)}
                          className={`${isOwnBasket || isProducer ? 'w-full' : 'flex-1'} py-2 border border-[#285153] text-[#285153] rounded-lg font-semibold text-sm hover:bg-[#285153] hover:text-white transition`}
                        >
                          View Details
                        </button>
                        {!isOwnBasket && !isProducer && (
                          <button
                            onClick={() => handleSubscribeClick(basket)}
                            className="flex-1 py-2 bg-[#285153] text-white rounded-lg font-semibold text-sm hover:bg-[#1f3f40] transition"
                          >
                            Subscribe
                          </button>
                        )}
                      </div>
                      {isOwnBasket && (
                        <p className="text-xs text-amber-700 text-center mt-2 font-medium">
                          📦 Your basket
                        </p>
                      )}
                      {isProducer && !isOwnBasket && (
                        <p className="text-xs text-gray-500 text-center mt-2 font-medium">
                          Producers cannot subscribe to baskets
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Basket Detail Modal */}
      {selectedBasket && (
        <BasketDetailModal
          basket={selectedBasket}
          onClose={() => setSelectedBasket(null)}
          onSubscribe={handleSubscribeClick}
        />
      )}

      {/* Subscription Form Modal */}
      {subscriptionBasket && (
        <SubscriptionFormModal
          basket={subscriptionBasket}
          onClose={() => setSubscriptionBasket(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-[#285153] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 text-center">
          <p className="text-lg mb-4">DZ-Fellah - Fresh Weekly Baskets from Local Farms</p>
          <p className="text-sm text-gray-300">© 2025 DZ-Fellah. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}