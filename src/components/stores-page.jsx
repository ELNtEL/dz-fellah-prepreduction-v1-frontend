import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, MapPin, Mail, ArrowLeft, Package, X, Star } from "lucide-react";
import ProductDetailModal from "./product-detail-modal";
import { producerService } from "../services";
import productService from "../services/productService";
import ratingService from "../services/ratingService";
import PublicNavBar from './PublicNavBar';

// Assets
import logoImage from "../assets/logo-dzfellah1.png";
import farmerImage from "../assets/farmer.png";
import farmHeader from "../assets/farm-header.png";

// Category fallback for products
const getCategoryFallbackImage = (category) => {
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

// Helper function to build full image URL
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `http://localhost:8000/media/${path}`;
};

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

export default function StoresPage({ 
  onNavigateToHome, 
  onNavigateToLogin, 
  onNavigateToSignup, 
  onNavigateToProducts 
}) {
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  
  const [filters, setFilters] = useState({
    search: '',
    wilaya: null,
    city: null,
    is_bio_certified: false
  });
  
  const [stores, setStores] = useState([]);
  const [storeProducts, setStoreProducts] = useState([]);
  const [producerRating, setProducerRating] = useState(null);
  const [productRatings, setProductRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState(null);

  const wilayas = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
    'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
    'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
    'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
    'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
    'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
    'Ghardaïa', 'Relizane'
  ];

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      fetchStoreProducts(selectedStore.id);
      fetchProducerRating(selectedStore.id);
    }
  }, [selectedStore]);

  const fetchStores = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiFilters = {
        page_size: 50,
      };
      
      if (filters.search) apiFilters.search = filters.search;
      if (filters.wilaya) apiFilters.wilaya = filters.wilaya;
      if (filters.city) apiFilters.city = filters.city;
      if (filters.is_bio_certified) apiFilters.is_bio_certified = true;
      
      const response = await producerService.getAllProducers(apiFilters);
      setStores(response.producers || []);
    } catch (err) {
      console.error('Failed to fetch stores:', err);
      setError('Failed to load stores. Please try again.');
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

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const handleWilayaChange = (wilaya) => {
    setFilters(prev => ({
      ...prev,
      wilaya: prev.wilaya === wilaya ? null : wilaya,
      city: null
    }));
  };

  const handleBioCertifiedToggle = () => {
    setFilters(prev => ({
      ...prev,
      is_bio_certified: !prev.is_bio_certified
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      wilaya: null,
      city: null,
      is_bio_certified: false
    });
  };

  useEffect(() => {
    fetchStores();
  }, [filters.wilaya, filters.city, filters.is_bio_certified]);

  const hasActiveFilters = filters.search || filters.wilaya || filters.city || filters.is_bio_certified;

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

  return (
    <div className="min-h-screen bg-white font-sans">
      <PublicNavBar currentPage="stores" />
      
      {!selectedStore && (
        <>
          <section className="relative bg-gradient-to-br from-teal-50 to-green-50 py-16">
            <div className="max-w-7xl mx-auto px-6 lg:px-16 text-center">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-5xl font-bold text-[#285153] mb-6"
              >
                Discover Local <span className="text-green-600">Farm Stores</span>
              </motion.h1>
              <p className="text-xl text-gray-600 mb-8">
                Connect directly with Algerian producers
              </p>
            </div>
          </section>

          <section className="bg-white py-12 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6 lg:px-16">
              <form onSubmit={handleSearch} className="mb-6">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search stores by name..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#285153]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-[#285153] text-white rounded-lg font-semibold hover:bg-[#1f3f40] transition"
                  >
                    Search
                  </button>
                </div>
              </form>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Wilaya:</label>
                <select
                  value={filters.wilaya || ''}
                  onChange={(e) => handleWilayaChange(e.target.value || null)}
                  className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#285153]"
                >
                  <option value="">All Wilayas</option>
                  {wilayas.map((wilaya) => (
                    <option key={wilaya} value={wilaya}>
                      {wilaya}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-gray-700">Filters:</span>
                
                <button
                  onClick={handleBioCertifiedToggle}
                  className={`px-4 py-2 rounded-full font-semibold transition ${
                    filters.is_bio_certified
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✓ Bio Certified Only
                </button>

                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold transition flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear Filters
                  </button>
                )}
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {filters.search && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      Search: "{filters.search}"
                    </span>
                  )}
                  {filters.wilaya && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      Wilaya: {filters.wilaya}
                    </span>
                  )}
                  {filters.city && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      City: {filters.city}
                    </span>
                  )}
                  {filters.is_bio_certified && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Bio Certified Only
                    </span>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-[#285153]">
                  {hasActiveFilters ? 'Filtered Stores' : 'All Stores'}
                </h2>
                <p className="text-gray-600">
                  {!loading && `${stores.length} store${stores.length !== 1 ? 's' : ''} found`}
                </p>
              </div>

              {loading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#285153]"></div>
                  <p className="mt-4 text-gray-600">Loading stores...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={fetchStores}
                    className="mt-4 px-6 py-2 bg-[#285153] text-white rounded-lg hover:bg-[#1f3f40]"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {!loading && !error && stores.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-600 text-lg mb-4">No stores found matching your filters.</p>
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

              {!loading && !error && stores.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {stores.map((store) => (
                    <motion.div
                      key={store.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
                      onClick={() => setSelectedStore(store)}
                    >
                      <div className="relative h-48">
                        {getImageUrl(store.photo_url) ? (
                          <img
                            src={getImageUrl(store.photo_url)}
                            alt={store.shop_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center">
                            <span className="text-6xl font-bold text-[#285153]">
                              {store.shop_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        {store.is_bio_certified && (
                          <span className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            ✓ Bio Certified
                          </span>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="font-bold text-xl text-gray-800 mb-2">{store.shop_name}</h3>
                        
                        {store.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {store.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{store.city || 'Unknown'}, {store.wilaya || 'Algeria'}</span>
                        </div>

                        {store.address && (
                          <p className="text-xs text-gray-500 mb-3">{store.address}</p>
                        )}

                        <button className="w-full py-2 bg-[#285153] text-white rounded-lg font-semibold hover:bg-[#1f3f40] transition">
                          View Store →
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {selectedStore && (
        <div className="min-h-screen bg-gray-50">
          <div className="relative h-64">
            {getImageUrl(selectedStore.photo_url) ? (
              <img
                src={getImageUrl(selectedStore.photo_url)}
                alt={selectedStore.shop_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center">
                <span className="text-9xl font-bold text-[#285153]">
                  {selectedStore.shop_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <button
              onClick={() => setSelectedStore(null)}
              className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-6 h-6 text-[#285153]" />
            </button>
          </div>

          <div className="max-w-7xl mx-auto px-6 lg:px-16 py-12">
            <div className="bg-white rounded-xl shadow-md p-8 -mt-32 relative z-10 mb-12">
              <h1 className="text-4xl font-bold text-[#285153] mb-4">{selectedStore.shop_name}</h1>
              
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
              
              {selectedStore.description && (
                <p className="text-gray-600 mb-6">{selectedStore.description}</p>
              )}

              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#285153]" />
                  <span>{selectedStore.city}, {selectedStore.wilaya}</span>
                </div>
                {selectedStore.address && (
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#285153]" />
                    <span>{selectedStore.address}</span>
                  </div>
                )}
                {selectedStore.is_bio_certified && (
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                      ✓ Bio Certified
                    </span>
                  </div>
                )}
              </div>
            </div>

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
                                  {getCategoryFallbackImage(product.product_type)}
                                </span>
                              </div>
                            )}
                            {product.is_seasonal && (
                              <span className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                De saison
                              </span>
                            )}
                            {product.has_anti_waste_discount && (
                              <span className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
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
      )}

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