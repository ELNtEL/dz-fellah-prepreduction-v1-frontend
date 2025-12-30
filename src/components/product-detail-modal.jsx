import { X, ShoppingBasket, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import cartService from "../services/cartService";
import authService from "../services/authService";
import { getImageUrl, getCategoryFallbackEmoji } from '../utils/imageUtils';

export default function ProductDetailModal({ product, onClose }) {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  if (!product) return null;

  // Use actual product image
  const imageUrl = getImageUrl(product.photo_url || product.image);
  const images = imageUrl ? [imageUrl] : [];

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleAddToCart = async () => {
    const isAuthenticated = authService.isAuthenticated();
    
    if (!isAuthenticated) {
      alert("Please login to add items to cart");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      await cartService.addToCart(product.id, quantity);
      alert(`${product.name} added to cart!`);
      onClose();
    } catch (err) {
      console.error('Failed to add to cart:', err);
      alert('Failed to add to cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToCart = () => {
    navigate("/client/cart");
    onClose();
  };

  const formatPrice = () => {
    const price = product.current_price || product.price || 0;
    const saleType = product.sale_type;
    
    if (saleType === 'weight') {
      return `${price} DA/kg`;
    } else if (saleType === 'unit') {
      return `${price} DA/unit`;
    }
    return `${price} DA`;
  };

  const getCategoryName = () => {
    return product.product_type || 'General';
  };

  const getProductState = () => {
    if (product.is_anti_gaspi) {
      return 'Anti-Waste (50% off)';
    }
    if (product.is_seasonal) {
      return 'Seasonal Product';
    }
    return 'Fresh';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-[32px] w-full max-w-4xl overflow-hidden shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <X className="w-6 h-6 text-[#285153]" />
        </button>

        {/* Cart Icon */}
        <button 
          onClick={goToCart}
          className="absolute right-20 top-6 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
        >
          <ShoppingBasket className="w-6 h-6 text-[#285153]" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image Section with Fallback */}
          <div className="relative h-[400px] md:h-[600px]">
            {imageUrl ? (
              <img 
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center"
              style={{ display: imageUrl ? 'none' : 'flex' }}
            >
              <span className="text-9xl">
                {getCategoryFallbackEmoji(product.product_type)}
              </span>
            </div>
            
            {/* Show navigation only if multiple images */}
            {images.length > 1 && (
              <>
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
                  <button 
                    onClick={prevImage}
                    className="bg-white/80 p-2 rounded-full hover:bg-white transition-colors backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-6 h-6 text-[#285153]" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="bg-white/80 p-2 rounded-full hover:bg-white transition-colors backdrop-blur-sm"
                  >
                    <ChevronRight className="w-6 h-6 text-[#285153]" />
                  </button>
                </div>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        idx === currentImage ? "bg-[#285153]" : "bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Seasonal Badge */}
            {product.is_seasonal && (
              <div className="absolute top-6 left-6 bg-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                🌱 In Season
              </div>
            )}

            {/* Anti-gaspi Badge */}
            {product.is_anti_gaspi && (
              <div className="absolute top-20 left-6 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                -50% Anti-Waste
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="p-8 md:p-12 flex flex-col h-full bg-white overflow-y-auto">
            <h2 className="text-4xl text-[#285153] font-bold mb-4 font-serif">Product details</h2>
            
            <h3 className="text-3xl text-[#285153] font-bold mb-2">{product.name}</h3>
            <p className="text-gray-600 font-semibold mb-2">
              {product.producer_name || product.producer?.shop_name || "Local Farm"}
            </p>
            
            <p className="text-[#8B7355] text-xl mb-4 font-bold">
              {formatPrice()}
            </p>

            <div className="space-y-2 mb-6 text-[#285153]">
              <p><span className="font-semibold">Category:</span> {getCategoryName()}</p>
              <p><span className="font-semibold">State:</span> {getProductState()}</p>
              <p><span className="font-semibold">Stock:</span> {product.stock} {product.sale_type === 'weight' ? 'kg' : 'units'} available</p>
              {product.harvest_date && (
                <p><span className="font-semibold">Harvest Date:</span> {new Date(product.harvest_date).toLocaleDateString()}</p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h4 className="text-[#285153] font-bold mb-2">Description:</h4>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {product.description}
                </p>
              </div>
            )}

            {/* Quantity selector */}
            <div className="mb-6 flex items-center gap-4">
              <span className="text-[#285153] font-semibold">
                Quantity {product.sale_type === 'weight' ? '(kg)' : ''}:
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={decreaseQuantity}
                  className="p-2 bg-[#4A6768] rounded-full text-white hover:bg-[#3d5556] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xl font-bold text-[#285153] min-w-[2rem] text-center">
                  {quantity}
                </span>
                <button 
                  onClick={increaseQuantity}
                  disabled={quantity >= product.stock}
                  className="p-2 bg-[#4A6768] rounded-full text-white hover:bg-[#3d5556] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stock warning */}
            {quantity > product.stock && (
              <p className="text-red-500 text-sm mb-4">
                Only {product.stock} {product.sale_type === 'weight' ? 'kg' : 'units'} available in stock
              </p>
            )}

            <div className="mt-auto flex gap-4">
              <button 
                onClick={handleAddToCart}
                disabled={loading || quantity > product.stock || product.stock === 0}
                className="flex-1 bg-[#4A6768] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#3d5556] transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Adding..." : product.stock === 0 ? "Out of Stock" : "Add to Basket"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}