import React, { useState } from 'react';
import { getImageUrl, getCategoryFallbackEmoji } from '../../utils/imageUtils';

// Category fallback for products
const getCategoryFallbackImage = (category) => {
    return getCategoryFallbackEmoji(category);
};

const oldFallbacks = {
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

const ShopProductCard = ({ product, onAddToCart }) => {
    const [quantity, setQuantity] = useState(1);

    const handleQuantityChange = (delta) => {
        setQuantity(prev => Math.max(1, prev + delta));
    };

    const handleAddToCart = () => {
        onAddToCart(product, quantity);
        setQuantity(1);
    };

    const imageUrl = getImageUrl(product.photo_url || product.image);

    return (
        <div className="product-card shop-product-card">
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="product-image"
                />
            ) : (
                <div className="product-image" style={{
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '64px'
                }}>
                    {getCategoryFallbackImage(product.product_type)}
                </div>
            )}

            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-farm">{product.farm}</p>
                <p className="product-price">price: {product.price}Da/{product.unit}</p>
            </div>

            <div className="shop-product-actions">
                <div className="quantity-selector">
                    <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                    >
                        −
                    </button>
                    <span className="qty-value">{quantity}</span>
                    <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange(1)}
                    >
                        +
                    </button>
                </div>
                <button className="btn-add-cart" onClick={handleAddToCart}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    Add to Cart
                </button>
            </div>
        </div>
    );
};

export default ShopProductCard;