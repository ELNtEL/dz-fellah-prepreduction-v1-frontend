"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Globe, Mail, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import farmerImage from "../assets/farmer.png";
import leafImage from "../assets/leaf.png";
import oliveOilImage from "../assets/olive-oil.png";
import tomatoesImage from "../assets/tomatoes.png";
import potatoesImage from "../assets/potatoes.png";
import orangesImage from "../assets/oranges.png";
import vegetablesBgImage from "../assets/vegetables-bg.png";
import logoImage from "../assets/logo-dzfellah1.png";
import decor1 from "../assets/decoration.png";
import decor2 from "../assets/decoration2.png";
import decor3 from "../assets/decoration3.png";
import decor4 from "../assets/decoration4.png";
import PublicNavBar from './PublicNavBar';
import productService from '../services/productService';

export default function LandingPage({ onNavigateToLogin, onNavigateToSignup, onNavigateToProducts, onNavigateToStores }) {
  const navigate = useNavigate();
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fallback products (your original hardcoded ones)
  const fallbackProducts = [
    {
      id: 1,
      name: "oil 250ml",
      category: "oil, organic",
      price: null,
      image: oliveOilImage,
      seasonal: false,
    },
    {
      id: 2,
      name: "toumattich",
      category: "Seasonal, 200 DA",
      price: "200 DA",
      image: tomatoesImage,
      seasonal: true,
    },
    {
      id: 3,
      name: "batata",
      category: "Seasonal, 200 DA",
      price: "200 DA",
      image: potatoesImage,
      seasonal: true,
    },
  ];

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  // Handle Join Us button click
  const handleJoinUs = () => {
    if (isAuthenticated()) {
      // If authenticated, go to products page
      navigate('/products');
    } else {
      // If not authenticated, go to signup
      if (onNavigateToSignup) {
        onNavigateToSignup();
      } else {
        navigate('/signup');
      }
    }
  };

  // Fetch random products on mount
  useEffect(() => {
    fetchRandomProducts();
  }, []);

  const fetchRandomProducts = async () => {
    try {
      // Fetch all products
      const response = await productService.getAllProducts();
      const allProducts = response.products || [];

      if (allProducts.length > 0) {
        // Pick 3 random products
        const randomProducts = [];
        const usedIndices = new Set();
        
        while (randomProducts.length < Math.min(3, allProducts.length)) {
          const randomIndex = Math.floor(Math.random() * allProducts.length);
          
          if (!usedIndices.has(randomIndex)) {
            usedIndices.add(randomIndex);
            const product = allProducts[randomIndex];
            
            randomProducts.push({
              id: product.id,
              name: product.name,
              category: product.product_type || 'Fresh Product',
              price: product.sale_type === 'unit' 
                ? `${product.unit_price} DA/unit` 
                : `${product.weight_price} DA/kg`,
              image: product.photo_url || oliveOilImage,
              seasonal: product.is_seasonal,
              anti_gaspi: product.is_anti_gaspi,
              stock: product.stock_quantity
            });
          }
        }
        
        setProducts(randomProducts);
      } else {
        // No products available, use fallback
        setProducts(fallbackProducts);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      // Use fallback products on error
      setProducts(fallbackProducts);
    } finally {
      setLoading(false);
    }
  };

  const nextProduct = () => {
    setCurrentProductIndex((prev) => (prev + 1) % products.length);
  };

  const prevProduct = () => {
    setCurrentProductIndex((prev) => (prev - 1 + products.length) % products.length);
  };

  const getVisibleProducts = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      visible.push(products[(currentProductIndex + i) % products.length]);
    }
    return visible;
  };

  const handleSeeMore = () => {
    navigate('/products');
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation Bar */}
      <PublicNavBar currentPage="home" />
      
      {/* Hero Section */}
      <section id="home" className="bg-[#285153] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white"
            >
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Salam,
                <br />
                welcome to dz fellah
              </h1>
              <p className="text-xl font-semibold mb-4">Fresh from Our Farmers, Directly to You</p>
              <p className="text-white/90 mb-6 leading-relaxed">
                Discover local fruits, vegetables, and farm products while supporting Algeria's small producers
              </p>
              
              <div className="flex gap-4 mb-8">
                {['facebook', 'instagram', 'twitter', 'youtube'].map((social, index) => (
                  <motion.a 
                    key={social}
                    href="#" 
                    whileHover={{ scale: 1.2, color: "#B0C4C2" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="text-white hover:text-white/80"
                  >
                    <i className={`fab fa-${social} text-xl`}></i>
                  </motion.a>
                ))}
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleJoinUs}
                className="bg-white text-[#285153] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
              >
                {isAuthenticated() ? 'Browse Products' : 'Join us'}
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
                className="w-full max-w-md mx-auto rounded-lg"
              />
              {/* Decorative elements */}
              <motion.img 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                src={decor3} alt="" className="absolute -top-10 -right-10 w-24 h-24" 
              />
              <motion.img 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                src={decor2} alt="" className="absolute -bottom-10 -left-10 w-32 h-32" 
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img 
                src={leafImage} 
                alt="Decorative leaf" 
                className="w-full max-w-md mx-auto"
              />
              {/* Decorative elements */}
              <motion.img 
                animate={{ rotate: -10, y: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                src={decor2} alt="" className="absolute -top-8 -left-8 w-24 h-24" 
              />
              <img src={decor1} alt="" className="absolute -bottom-8 -left-8 w-20 h-20" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-[#285153] mb-6">About Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                At <span className="font-semibold">dz Fellah</span>, we believe that access to fresh, local food can 
                transform communities. We connect farmers, small producers, and consumers to promote sustainable agriculture and support 
                local livelihoods across Algeria. Our platform makes it simple, 
                convenient, and rewarding to buy seasonal products, discover 
                high-quality seasonal products, by highlighting local producers 
                and streamlining direct purchases, we help communities access 
                fresh produce while empowering farmers to grow and thrive. 
                Together, we nurture local growth and empower citizens to make 
                conscious, meaningful choices in their daily lives.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Available Products Section */}
      <section id="products" className="py-16 lg:py-24 bg-[#285153] relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white text-center mb-12">
            Available Products
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-white mt-4">Loading products...</p>
            </div>
          ) : (
            <div className="relative">
              {/* Navigation Arrows */}
              {products.length > 3 && (
                <>
                  <button
                    onClick={prevProduct}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-10"
                  >
                    <ChevronLeft className="w-6 h-6 text-[#285153]" />
                  </button>

                  <button
                    onClick={nextProduct}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 bg-white rounded-full p-3 shadow-lg hover:bg-gray-100 transition-colors z-10"
                  >
                    <ChevronRight className="w-6 h-6 text-[#285153]" />
                  </button>
                </>
              )}

              {/* Product Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {getVisibleProducts().map((product, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    key={`${product.id}-${index}`}
                    className="bg-white rounded-3xl p-6 shadow-lg"
                  >
                    <div className="aspect-square bg-gray-100 rounded-2xl mb-4 overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-[#285153] mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                    <p className="text-sm font-semibold text-[#285153] mb-4">{product.price}</p>
                    
                    <div className="flex gap-2 mb-4">
                      {product.seasonal && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                          Seasonal
                        </span>
                      )}
                      {product.anti_gaspi && (
                        <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-3 py-1 rounded-full">
                          -50% Anti-Waste
                        </span>
                      )}
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/products')}
                      className="w-full bg-[#285153] hover:bg-[#1a3839] text-white py-2 rounded-full font-semibold transition-colors"
                    >
                      View Details
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center mt-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSeeMore}
              className="bg-white text-[#285153] px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors"
            >
              See more
            </motion.button>
          </div>
        </div>

        {/* Decorative element */}
        <img src={decor4} alt="" className="absolute bottom-8 right-8 w-24 h-24" />
      </section>

      {/* Seasonal Offers Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl lg:text-5xl font-bold text-[#285153] mb-6">
                Seasonal offers
              </h2>
              <p className="text-lg font-semibold text-[#285153] mb-4">
                Special Orange Offer - Fresh, Local and Perfectly Priced
              </p>
              <p className="text-gray-700 leading-relaxed">
                Enjoy the rich taste of Algeria's finest winter oranges, 
                harvested at peak ripeness for maximum flavor and nutrition. 
                Due to high availability this year, we offer exceptional 
                prices without compromising on freshness or quality. 
                Don't miss the chance to stock up on these sweet, 
                juicy oranges—perfect for breakfast, fresh juice, or healthy 
                snacks. But oranges' shelves' wholesale value 
                won't last for long, so grab up on this limited-time offer 
                at the best price of the season!
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img 
                src={orangesImage} 
                alt="Fresh oranges" 
                className="w-full max-w-md mx-auto rounded-3xl"
              />
              {/* Decorative elements */}
              <motion.img 
                animate={{ rotate: 10, y: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                src={decor2} alt="" className="absolute -bottom-10 -right-10 w-28 h-28" 
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative py-24 lg:py-32">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${vegetablesBgImage})` }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Be Part of Algeria's Fresh
              <br />
              Food Revolution
            </h2>
            <p className="text-xl text-white mb-8">
              Join DZ Fellah and Support Local Farmers Today
            </p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleJoinUs}
              className="bg-white text-[#285153] px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              {isAuthenticated() ? 'Browse Products' : 'join us'}
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-[#285153] text-center mb-12">
            contact us
          </h2>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-2xl font-bold text-[#285153] mb-6">Get in touch with us</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#285153]"
                  />
                  <input
                    type="tel"
                    placeholder="Phone"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#285153]"
                  />
                </div>
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#285153]"
                />
                <textarea
                  placeholder="Type your demands"
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#285153]"
                ></textarea>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-[#285153] hover:bg-[#1a3839] text-white py-3 rounded-full font-bold transition-colors"
                >
                  Submit
                </motion.button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h3 className="text-2xl font-bold text-[#285153] mb-6">Contact Information</h3>
              <p className="text-gray-700 mb-8">
                If you have any questions at all, we're here to help! Our friendly team is ready 
                to assist you with any inquiries. Don't hesitate to reach out!
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-[#285153]" />
                  <div>
                    <p className="font-semibold text-sm">Address</p>
                    <p className="text-xs text-gray-600">Algiers, Algeria</p>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-3">
                  <Globe className="w-5 h-5 text-[#285153]" />
                  <div>
                    <p className="font-semibold text-sm">Phone</p>
                    <p className="text-xs text-gray-600">+213 555 555</p>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#285153]" />
                  <div>
                    <p className="font-semibold text-sm">Email</p>
                    <p className="text-xs text-gray-600">dzfellah@gmail.com</p>
                  </div>
                </div>

                <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-3">
                  <Clock className="w-5 h-5 text-[#285153]" />
                  <div>
                    <p className="font-semibold text-sm">Availability</p>
                    <p className="text-xs text-gray-600">24/7</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#285153] py-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white text-sm">
              Check out our social media for updates and fresh farm news
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-white hover:text-white/80"><i className="fab fa-facebook text-xl"></i></a>
              <a href="#" className="text-white hover:text-white/80"><i className="fab fa-instagram text-xl"></i></a>
              <a href="#" className="text-white hover:text-white/80"><i className="fab fa-twitter text-xl"></i></a>
              <a href="#" className="text-white hover:text-white/80"><i className="fab fa-youtube text-xl"></i></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}