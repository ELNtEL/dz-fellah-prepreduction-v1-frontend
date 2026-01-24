import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, X } from "lucide-react";
import { producerService } from "../services";
import PublicNavBar from './PublicNavBar';
import { getImageUrl } from '../utils/imageUtils';

export default function StoresPage({
  onNavigateToHome,
  onNavigateToLogin,
  onNavigateToSignup,
  onNavigateToProducts
}) {
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: '',
    wilaya: null,
    city: null,
    is_bio_certified: false
  });

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

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
    setPage(1);
    setStores([]);
    fetchStores(1);
  }, [filters.wilaya, filters.city, filters.is_bio_certified]);

  const fetchStores = async (pageNum = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const apiFilters = {
        page: pageNum,
        page_size: 12, // Reduced from 50 to 12 for faster loading
      };

      if (filters.search) apiFilters.search = filters.search;
      if (filters.wilaya) apiFilters.wilaya = filters.wilaya;
      if (filters.city) apiFilters.city = filters.city;
      if (filters.is_bio_certified) apiFilters.is_bio_certified = true;

      const response = await producerService.getAllProducers(apiFilters);
      const newStores = response.producers || [];

      if (isLoadMore) {
        setStores(prev => [...prev, ...newStores]);
      } else {
        setStores(newStores);
      }

      // Check if there are more stores to load
      setHasMore(newStores.length === 12);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Failed to fetch stores:', err);

      // Auto-retry on timeout errors (up to 2 times)
      if (err.code === 'ECONNABORTED' && retryCount < 2) {
        console.log(`⚠️ Request timed out. Retrying... (${retryCount + 1}/2)`);
        setRetryCount(prev => prev + 1);
        setTimeout(() => fetchStores(pageNum, isLoadMore), 2000); // Retry after 2 seconds
        return;
      }

      const errorMessage = err.code === 'ECONNABORTED'
        ? 'Server is taking too long to respond. The backend might be slow or down.'
        : 'Failed to load stores. Please try again.';

      setError(errorMessage);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchStores(nextPage, true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setStores([]);
    fetchStores(1);
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

  const handleStoreClick = (storeId) => {
    navigate(`/stores/${storeId}`);
  };

  const hasActiveFilters = filters.search || filters.wilaya || filters.city || filters.is_bio_certified;

  return (
    <div className="min-h-screen bg-white font-sans">
      <PublicNavBar currentPage="stores" />

      {/* Hero Section */}
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

      {/* Search and Filters Section */}
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

      {/* Stores Grid Section */}
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
            <div className="text-center py-12 max-w-md mx-auto">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-600 mb-4">{error}</p>
                {retryCount > 0 && (
                  <p className="text-sm text-gray-600 mb-4">
                    Automatically retried {retryCount} time{retryCount > 1 ? 's' : ''}
                  </p>
                )}
                <button
                  onClick={() => {
                    setRetryCount(0);
                    setPage(1);
                    setStores([]);
                    fetchStores(1);
                  }}
                  className="px-6 py-2 bg-[#285153] text-white rounded-lg hover:bg-[#1f3f40] transition"
                >
                  Try Again
                </button>
              </div>
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
                  onClick={() => handleStoreClick(store.id)}
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

          {/* Load More Button */}
          {!loading && !error && stores.length > 0 && hasMore && (
            <div className="mt-12 text-center">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-[#285153] text-white rounded-lg font-semibold hover:bg-[#1f3f40] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <span className="flex items-center gap-2">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Loading...
                  </span>
                ) : (
                  'Load More Stores'
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      <footer className="bg-[#285153] text-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 text-center">
          <p className="text-lg mb-4">DZ-Fellah - Connecting Algerian Farmers with Consumers</p>
          <p className="text-sm text-gray-300">© 2025 DZ-Fellah. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
