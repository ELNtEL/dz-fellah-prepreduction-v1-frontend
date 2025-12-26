import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import ProductDetailModal from "./product-detail-modal";
import productService from "../services/productService";
import PublicNavBar from "./PublicNavBar";

// Assets
import farmerImage from "../assets/farmer.png";
import leafImage from "../assets/leaf.png";
import decor1 from "../assets/decoration.png";

// Helper function to build full image URL
const getImageUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `http://localhost:8000/media/${path}`;
};

// Category fallback images
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

export default function ProductsPage({ 
  onNavigateToHome, 
  onNavigateToLogin, 
  onNavigateToSignup, 
  onNavigateToStores 
}) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentStoreIndex, setCurrentStoreIndex] = useState(0);
  
  // Enhanced filters state
  const [filters, setFilters] = useState({
    search: '',
    producer_search: '',
    product_type: null,
    is_anti_gaspi: false
  });
  
  // Backend integration
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Categories
  const categories = [
    { value: 'Vegetables', label: '🥬 Vegetables', emoji: '🥬' },
    { value: 'Fruits', label: '🍎 Fruits', emoji: '🍎' },
    { value: 'Dairy', label: '🥛 Dairy', emoji: '🥛' },
    { value: 'Oils', label: '🫒 Oils', emoji: '🫒' },
    { value: 'Honey', label: '🍯 Honey', emoji: '🍯' },
    { value: 'Grains', label: '🌾 Grains', emoji: '🌾' },
    { value: 'Meat', label: '🥩 Meat', emoji: '🥩' },
    { value: 'Other', label: '📦 Other', emoji: '📦' },
  ];

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiFilters = {};
      
      if (filters.search) {
        apiFilters.search = filters.search;
      }
      
      if (filters.producer_search) {
        apiFilters.producer_search = filters.producer_search;
      }
      
      if (filters.product_type) {
        apiFilters.product_type = filters.product_type;
      }
      
      if (filters.is_anti_gaspi) {
        apiFilters.is_anti_gaspi = true;
      }
      
      const response = await productService.getAllProducts(apiFilters);
      setProducts(response.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleCategoryClick = (category) => {
    setFilters(prev => ({
      ...prev,
      product_type: prev.product_type === category ? null : category
    }));
  };

  const handleAntiGaspiToggle = () => {
    setFilters(prev => ({
      ...prev,
      is_anti_gaspi: !prev.is_anti_gaspi
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      producer_search: '',
      product_type: null,
      is_anti_gaspi: false
    });
  };

  // Apply filters when they change
  useEffect(() => {
    fetchProducts();
  }, [filters.product_type, filters.is_anti_gaspi]);

  const hasActiveFilters = filters.search || filters.producer_search || filters.product_type || filters.is_anti_gaspi;

  // Featured stores carousel
  const featuredStores = [
    { name: "tizi_wezou_farm", products: "vegetables, oils" },
    { name: "boumerdas_lands", products: "vegetables, fruits" },
    { name: "jijel_mountain_farm", products: "honey, natural products" },
  ];

  const nextStore = () => {
    setCurrentStoreIndex((prev) => (prev + 1) % featuredStores.length);
  };

  const prevStore = () => {
    setCurrentStoreIndex((prev) => (prev - 1 + featuredStores.length) % featuredStores.length);
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation Bar */}
      <PublicNavBar currentPage="products" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-teal-50 to-green-50 py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl lg:text-6xl font-bold text-[#285153] mb-6">
              Fresh from <br />
              <span className="text-green-600">Local Farms</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover authentic Algerian products directly from producers
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

        {/* Decorative elements */}
        <img src={leafImage} alt="" className="absolute top-10 right-10 w-32 opacity-20" />
        <img src={decor1} alt="" className="absolute bottom-10 left-10 w-24 opacity-20" />
      </section>

      {/* Search & Filter Section */}
      <section className="bg-white py-12 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          {/* Search Inputs */}
          <form onSubmit={handleSearch} className="space-y-4 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Product Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products by name..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#285153]"
                />
              </div>

              {/* Producer Search */}
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

            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3 bg-[#285153] text-white rounded-lg font-semibold hover:bg-[#1f3f40] transition"
            >
              Search
            </button>
          </form>

          {/* Category Filter Buttons */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories:</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryClick(cat.value)}
                  className={`px-4 py-2 rounded-full font-semibold transition ${
                    filters.product_type === cat.value
                      ? 'bg-[#285153] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">Filters:</span>
            
            {/* Anti-Gaspi Filter */}
            <button
              onClick={handleAntiGaspiToggle}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                filters.is_anti_gaspi
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ♻️ Anti-Waste (-50%)
            </button>

            {/* Clear Filters */}
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

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {filters.search && (
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  Product: "{filters.search}"
                </span>
              )}
              {filters.producer_search && (
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  Producer: "{filters.producer_search}"
                </span>
              )}
              {filters.product_type && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {categories.find(c => c.value === filters.product_type)?.emoji} {filters.product_type}
                </span>
              )}
              {filters.is_anti_gaspi && (
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                  Anti-Waste Only
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#285153]">
              {hasActiveFilters ? 'Filtered Products' : 'All Products'}
            </h2>
            <p className="text-gray-600">
              {!loading && `${products.length} product${products.length !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#285153]"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchProducts}
                className="mt-4 px-6 py-2 bg-[#285153] text-white rounded-lg hover:bg-[#1f3f40]"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No products found matching your filters.</p>
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

          {!loading && !error && products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const imageUrl = getImageUrl(product.photo_url);
                
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="relative">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.name}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            // Fallback if image fails to load
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-full h-48 bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center"
                        style={{ display: imageUrl ? 'none' : 'flex' }}
                      >
                        <span className="text-8xl">
                          {getCategoryFallbackImage(product.product_type)}
                        </span>
                      </div>
                      {product.is_anti_gaspi && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          -50% Anti-gaspi
                        </span>
                      )}
                      {product.product_type && (
                        <span className="absolute top-2 right-2 bg-[#285153] text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {categories.find(c => c.value === product.product_type)?.emoji || '📦'} {product.product_type}
                        </span>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 mb-2">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {product.producer_name || 'Local Farm'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-[#285153] font-bold text-xl">
                          {product.price} DA/{product.sale_type === 'weight' ? 'kg' : 'unit'}
                        </span>
                      </div>
                      {product.stock > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Stock: {product.stock} {product.sale_type === 'weight' ? 'kg' : 'units'}
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

      {/* Featured Stores Carousel */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-[#285153]">Featured Stores</h2>
            <button
              onClick={onNavigateToStores}
              className="text-[#285153] font-semibold hover:underline"
            >
              View All Stores →
            </button>
          </div>

          <div className="relative">
            <button
              onClick={prevStore}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <ChevronLeft className="w-6 h-6 text-[#285153]" />
            </button>

            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <h3 className="text-2xl font-bold text-[#285153] mb-2">
                {featuredStores[currentStoreIndex].name}
              </h3>
              <p className="text-gray-600">
                Specializing in: {featuredStores[currentStoreIndex].products}
              </p>
            </div>

            <button
              onClick={nextStore}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
            >
              <ChevronRight className="w-6 h-6 text-[#285153]" />
            </button>
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* Footer */}
      <footer className="bg-[#285153] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 text-center">
          <p className="text-lg mb-4">DZ-Fellah - Connecting Algerian Farmers with Consumers</p>
          <p className="text-sm text-gray-300">© 2025 DZ-Fellah. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}