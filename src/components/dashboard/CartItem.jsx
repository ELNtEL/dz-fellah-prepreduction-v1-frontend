import React from 'react';
import { getImageUrl, getCategoryFallbackEmoji } from '../../utils/imageUtils';

// Use emoji directly for cart items
const getCategoryFallbackImage = (category) => {
  return getCategoryFallbackEmoji(category);
};

// Keep the old structure but use imported function
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

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    const lineTotal = item.price * item.quantity;
    const imageUrl = getImageUrl(item.image || item.photo_url);

    return (
        <div className="cart-item">
            {/* Product Image with Fallback - matches CSS .cart-item-image */}
            <div style={{ width: '70px', height: '70px', position: 'relative', overflow: 'hidden', borderRadius: '8px', flexShrink: 0 }}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={item.name}
                        className="cart-item-image"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                        }}
                    />
                ) : null}
                <div 
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        background: 'linear-gradient(to bottom right, #d1fae5, #99f6e4)',
                        display: imageUrl ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        position: imageUrl ? 'absolute' : 'static',
                        top: 0,
                        left: 0
                    }}
                >
                    {getCategoryFallbackImage(item.product_type || item.category)}
                </div>
            </div>

            <div className="cart-item-details">
                <h4 className="cart-item-name">{item.name}</h4>
                <p className="cart-item-farm">{item.farm || item.producer_name || 'Local Farm'}</p>
                <p className="cart-item-price">{item.price}DA/{item.unit || (item.sale_type === 'weight' ? 'kg' : 'unit')}</p>
            </div>

            <div className="cart-item-quantity">
                <button
                    className="qty-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                >
                    −
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button
                    className="qty-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                    +
                </button>
            </div>

            <div className="cart-item-total">
                <span>{lineTotal.toLocaleString()}DA</span>
            </div>

            <button className="cart-item-remove" onClick={() => onRemove(item.id)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <polyline points="3,6 5,6 21,6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
            </button>
        </div>
    );
};

export default CartItem;