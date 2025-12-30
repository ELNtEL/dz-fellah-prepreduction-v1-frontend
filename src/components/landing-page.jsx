"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Mail, Calendar, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import farmerImage from "../assets/farmer.png";
import leafImage from "../assets/leaf.png";
import orangesImage from "../assets/oranges.png";
import vegetablesBgImage from "../assets/vegetables-bg.png";
import decor1 from "../assets/decoration.png";
import decor2 from "../assets/decoration2.png";
import decor3 from "../assets/decoration3.png";
import decor4 from "../assets/decoration4.png";
import PublicNavBar from './PublicNavBar';
import productService from '../services/productService';
import basketService from '../services/basketService';
import { getImageUrl, getCategoryFallbackEmoji } from '../utils/imageUtils';

// Category fallback for backwards compatibility
const getCategoryFallbackImage = (category) => {
  return getCategoryFallbackEmoji(category);
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [currentBasketIndex, setCurrentBasketIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [baskets, setBaskets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [basketsLoading, setBasketsLoading] = useState(true);

  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  const handleJoinUs = () => {
    if (isAuthenticated()) {
      navigate('/products');
    } else {
      navigate('/signup');
    }
  };

  // Fetch random products
  useEffect(() => {
    fetchRandomProducts();
    fetchRandomBaskets();
  }, []);

  const fetchRandomProducts = async () => {
    try {
      const response = await productService.getAllProducts();
      const allProducts = response.products || [];

      if (allProducts.length > 0) {
        const randomProducts = [];
        const usedIndices = new Set();
        
        while (randomProducts.length < Math.min(3, allProducts.length)) {
          const randomIndex = Math.floor(Math.random() * allProducts.length);
          
          if (!usedIndices.has(randomIndex)) {
            usedIndices.add(randomIndex);
            randomProducts.push(allProducts[randomIndex]);
          }
        }
        
        setProducts(randomProducts);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRandomBaskets = async () => {
    try {
      const response = await basketService.getAllBaskets();
      const allBaskets = response.baskets || [];

      if (allBaskets.length > 0) {
        const randomBaskets = [];
        const usedIndices = new Set();
        
        while (randomBaskets.length < Math.min(3, allBaskets.length)) {
          const randomIndex = Math.floor(Math.random() * allBaskets.length);
          
          if (!usedIndices.has(randomIndex)) {
            usedIndices.add(randomIndex);
            randomBaskets.push(allBaskets[randomIndex]);
          }
        }
        
        setBaskets(randomBaskets);
      }
    } catch (error) {
      console.error('Failed to fetch baskets:', error);
      setBaskets([]);
    } finally {
      setBasketsLoading(false);
    }
  };

  const nextProduct = () => {
    setCurrentProductIndex((prev) => (prev + 1) % products.length);
  };

  const prevProduct = () => {
    setCurrentProductIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const nextBasket = () => {
    setCurrentBasketIndex((prev) => (prev + 1) % baskets.length);
  };

  const prevBasket = () => {
    setCurrentBasketIndex((prev) => (prev - 1 + baskets.length) % baskets.length);
  };

  const getVisibleProducts = () => {
    if (products.length === 0) return [];
    const visible = [];
    for (let i = 0; i < Math.min(3, products.length); i++) {
      visible.push(products[(currentProductIndex + i) % products.length]);
    }
    return visible;
  };

  const getVisibleBaskets = () => {
    if (baskets.length === 0) return [];
    const visible = [];
    for (let i = 0; i < Math.min(3, baskets.length); i++) {
      visible.push(baskets[(currentBasketIndex + i) % baskets.length]);
    }
    return visible;
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation Bar */}
      <PublicNavBar currentPage="home" />
      
      {/* Hero Section */}
      <section id="home" className="bg-[#285153] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Salam,
                <br />
                Welcome to DZ Fellah
              </h1>
              <p className="text-2xl font-semibold mb-4">Fresh from Our Farmers, Directly to You</p>
              <p className="text-lg text-white/90 mb-8 leading-relaxed">
                Discover local fruits, vegetables, and farm products while supporting Algeria's small producers
              </p>
              
              <div className="flex items-center gap-3 mb-8 text-white/90">
                <Mail className="w-5 h-5" />
                <a href="mailto:dz-fellah@gmail.com" className="hover:text-white transition">
                  dz-fellah@gmail.com
                </a>
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleJoinUs}
                className="bg-white text-[#285153] px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
              >
                {isAuthenticated() ? 'Browse Products' : 'Join Us'}
              </motion.button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <img 
                src={farmerImage} 
                alt="Farmer with vegetables" 
                className="w-full max-w-md mx-auto rounded-2xl shadow-2xl"
              />
              <motion.img 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                src={decor3} alt="" className="absolute -top-10 -right-10 w-24 h-24 opacity-80" 
              />
              <motion.img 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                src={decor2} alt="" className="absolute -bottom-10 -left-10 w-32 h-32 opacity-80" 
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative order-2 lg:order-1"
            >
              <img 
                src={leafImage} 
                alt="Decorative leaf" 
                className="w-full max-w-md mx-auto drop-shadow-2xl"
              />
              <motion.img 
                animate={{ rotate: -10, y: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                src={decor2} alt="" className="absolute -top-8 -left-8 w-24 h-24 opacity-70" 
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-[#285153] mb-6">About Us</h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                At <span className="font-bold text-[#285153]">DZ Fellah</span>, we believe in connecting communities through fresh, local food. 
                We empower Algerian farmers and producers by providing a platform to reach customers directly, 
                eliminating middlemen and ensuring fair prices for both producers and consumers.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mt-4">
                Our mission is to promote sustainable agriculture, support local livelihoods, and make it simple 
                for Algerians to access fresh, seasonal products. Together, we're building a stronger, 
                more sustainable food system for Algeria.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Available Products Section */}
      <section id="products" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#285153] mb-4">
              Available Products
            </h2>
            <p className="text-lg text-gray-600">Fresh, local, and seasonal products from Algerian farms</p>
          </div>

          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-12 h-12 border-4 border-[#285153] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-4">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600">No products available at the moment</p>
            </div>
          ) : (
            <div className="relative">
              {products.length > 3 && (
                <>
                  <button
                    onClick={prevProduct}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 bg-white rounded-full p-3 shadow-xl hover:bg-gray-50 transition-all z-10 border border-gray-200"
                  >
                    <ChevronLeft className="w-6 h-6 text-[#285153]" />
                  </button>

                  <button
                    onClick={nextProduct}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 bg-white rounded-full p-3 shadow-xl hover:bg-gray-50 transition-all z-10 border border-gray-200"
                  >
                    <ChevronRight className="w-6 h-6 text-[#285153]" />
                  </button>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {getVisibleProducts().map((product, index) => {
                  const imageUrl = getImageUrl(product.photo_url);
                  
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                      key={`${product.id}-${index}`}
                      className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100"
                    >
                      {/* Product Image with Fallback - EXACT SAME AS PRODUCTS PAGE */}
                      <div className="relative">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
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

                        {/* Badges */}
                        {product.is_anti_gaspi && (
                          <span className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            -50% Anti-Waste
                          </span>
                        )}
                        {product.product_type && (
                          <span className="absolute top-2 right-2 bg-[#285153] text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {product.product_type}
                          </span>
                        )}
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-[#285153] mb-2">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{product.product_type || 'Fresh Product'}</p>
                        <p className="text-lg font-bold text-[#285153] mb-4">
                          {product.price} DA/{product.sale_type === 'weight' ? 'kg' : 'unit'}
                        </p>

                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate('/products')}
                          className="w-full bg-[#285153] hover:bg-[#1a3839] text-white py-3 rounded-xl font-semibold transition-colors shadow-md"
                        >
                          View Details
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-center mt-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/products')}
              className="bg-[#285153] text-white px-10 py-4 rounded-full font-bold hover:bg-[#1a3839] transition-colors shadow-lg"
            >
              See All Products
            </motion.button>
          </div>
        </div>
      </section>

      {/* Weekly Subscription Baskets Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-teal-50 to-green-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#285153] mb-4">
              Weekly Subscription Baskets
            </h2>
            <p className="text-lg text-gray-600">Fresh produce delivered to your door every week</p>
          </div>

          {basketsLoading ? (
            <div className="text-center py-16">
              <div className="inline-block w-12 h-12 border-4 border-[#285153] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600 mt-4">Loading baskets...</p>
            </div>
          ) : baskets.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-600">No subscription baskets available at the moment</p>
            </div>
          ) : (
            <div className="relative">
              {baskets.length > 3 && (
                <>
                  <button
                    onClick={prevBasket}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 bg-white rounded-full p-3 shadow-xl hover:bg-gray-50 transition-all z-10 border border-gray-200"
                  >
                    <ChevronLeft className="w-6 h-6 text-[#285153]" />
                  </button>

                  <button
                    onClick={nextBasket}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 bg-white rounded-full p-3 shadow-xl hover:bg-gray-50 transition-all z-10 border border-gray-200"
                  >
                    <ChevronRight className="w-6 h-6 text-[#285153]" />
                  </button>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {getVisibleBaskets().map((basket, index) => {
                  const bannerUrl = getImageUrl(basket.producer_banner);

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                      key={`${basket.id}-${index}`}
                      className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100"
                    >
                      {/* Banner Image Section - SAME PATTERN AS PRODUCTS */}
                      <div className="relative h-48">
                        {bannerUrl ? (
                          <img
                            src={bannerUrl}
                            alt={basket.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <div 
                          className="w-full h-full bg-gradient-to-br from-green-100 to-teal-100"
                          style={{ display: bannerUrl ? 'none' : 'block' }}
                        ></div>
                        
                        {/* Dark overlay for better visibility */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                        
                        {/* Basket Emoji - Always visible */}
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <span className="text-7xl drop-shadow-2xl filter brightness-110">🧺</span>
                        </div>

                        {/* Discount Badge */}
                        {basket.discount_percentage > 0 && (
                          <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg z-20">
                            -{basket.discount_percentage}% OFF
                          </div>
                        )}
                      </div>

                      {/* Basket Details */}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-[#285153] mb-2 truncate">{basket.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 truncate">{basket.shop_name || basket.producer_shop_name || 'Local Farm'}</p>
                        
                        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Package className="w-4 h-4" />
                            {basket.product_count || 0} items
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {basket.delivery_frequency === 'weekly' ? 'Weekly' : basket.delivery_frequency === 'biweekly' ? 'Bi-weekly' : 'Monthly'}
                          </span>
                        </div>

                        <div className="mb-4">
                          {basket.discount_percentage > 0 ? (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-2xl font-bold text-[#285153]">
                                {parseFloat(basket.discounted_price).toFixed(2)} DA
                              </span>
                              <span className="text-sm text-gray-400 line-through">
                                {parseFloat(basket.original_price).toFixed(2)} DA
                              </span>
                            </div>
                          ) : (
                            <span className="text-2xl font-bold text-[#285153]">
                              {parseFloat(basket.original_price).toFixed(2)} DA
                            </span>
                          )}
                          <p className="text-xs text-gray-500 mt-1">per delivery</p>
                        </div>

                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => navigate('/subscriptions')}
                          className="w-full bg-[#285153] hover:bg-[#1a3839] text-white py-3 rounded-xl font-semibold transition-colors shadow-md"
                        >
                          View Basket
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-center mt-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/subscriptions')}
              className="bg-[#285153] text-white px-10 py-4 rounded-full font-bold hover:bg-[#1a3839] transition-colors shadow-lg"
            >
              Browse All Baskets
            </motion.button>
          </div>
        </div>
      </section>

    {/* Seasonal Products Section */}
<section className="py-20 lg:py-28 bg-white">
  <div className="max-w-7xl mx-auto px-6 lg:px-16">
    <div className="text-center mb-12">
      <h2 className="text-4xl lg:text-5xl font-bold text-[#285153] mb-4">
        🌱 Seasonal Products
      </h2>
      <p className="text-xl text-gray-600 mb-2">
        Fresh, In-Season Produce at Peak Flavor
      </p>
      <p className="text-lg text-gray-500">
        Discover locally grown products harvested at their best time of year
      </p>
    </div>

    {loading ? (
      <div className="text-center py-16">
        <div className="inline-block w-12 h-12 border-4 border-[#285153] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4">Loading seasonal products...</p>
      </div>
    ) : products.filter(p => p.is_seasonal).length === 0 ? (
      <div className="text-center py-16 bg-gradient-to-br from-teal-50 to-green-50 rounded-3xl">
        <span className="text-7xl mb-4 block">🌱</span>
        <h3 className="text-2xl font-bold text-[#285153] mb-2">No Seasonal Products Yet</h3>
        <p className="text-gray-600 text-lg">Check back soon for fresh, in-season produce!</p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {getVisibleProducts()
          .filter(product => product.is_seasonal)
          .slice(0, 3)
          .map((product, index) => {
            const imageUrl = getImageUrl(product.photo_url);
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
                key={`seasonal-${product.id}-${index}`}
                className="bg-white rounded-2xl overflow-hidden shadow-lg border-2 border-orange-200"
              >
                {/* Product Image with Seasonal Badge */}
                <div className="relative">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-56 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-full h-56 bg-gradient-to-br from-orange-100 to-green-100 flex items-center justify-center"
                    style={{ display: imageUrl ? 'none' : 'flex' }}
                  >
                    <span className="text-9xl">
                      {getCategoryFallbackImage(product.product_type)}
                    </span>
                  </div>

                  {/* Seasonal Badge - PROMINENT */}
                  <span className="absolute top-3 left-3 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                    🌱 In Season
                  </span>

                  {/* Anti-gaspi Badge */}
                  {product.is_anti_gaspi && (
                    <span className="absolute top-16 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      -50% Off
                    </span>
                  )}

                  {/* Category Badge */}
                  {product.product_type && (
                    <span className="absolute top-3 right-3 bg-[#285153] text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      {product.product_type}
                    </span>
                  )}

                  {/* Fresh Indicator Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
                    <p className="text-white text-sm font-semibold">
                      ✨ Peak Freshness & Nutrition
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-[#285153] mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{product.producer_name || 'Local Farm'}</p>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-green-700 font-medium">
                      🍃 Harvested at the perfect time for maximum flavor and nutrition
                    </p>
                  </div>

                  <p className="text-2xl font-bold text-orange-500 mb-4">
                    {product.price} DA/{product.sale_type === 'weight' ? 'kg' : 'unit'}
                  </p>

                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/products')}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-colors shadow-md"
                  >
                    Get Fresh Now →
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
      </div>
    )}

    {products.filter(p => p.is_seasonal).length > 0 && (
      <div className="text-center mt-12">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/products')}
          className="bg-orange-500 text-white px-12 py-4 rounded-full font-bold text-lg hover:bg-orange-600 transition-colors shadow-lg"
        >
          View All Seasonal Products
        </motion.button>
      </div>
    )}
  </div>
</section>

      {/* Call to Action Section */}
      <section className="relative py-24 lg:py-32">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${vegetablesBgImage})` }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Join Algeria's Fresh Food Revolution
            </h2>
            <p className="text-xl text-white/90 mb-10">
              Support Local Farmers and Get Fresh Produce Delivered to Your Door
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJoinUs}
              className="bg-white text-[#285153] px-12 py-5 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-2xl"
            >
              {isAuthenticated() ? 'Start Shopping' : 'Get Started'}
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#285153] py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-white text-lg font-semibold mb-2">DZ Fellah</p>
              <p className="text-white/80 text-sm">
                Connecting Algerian farmers with local communities
              </p>
            </div>
            <div className="flex items-center gap-3 text-white/90">
              <Mail className="w-5 h-5" />
              <a href="mailto:dz-fellah@gmail.com" className="hover:text-white transition">
                dz-fellah@gmail.com
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/20 text-center text-white/60 text-sm">
            © 2025 DZ Fellah. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}