import { FiCheck } from 'react-icons/fi';
import { Calendar, MapPin } from 'lucide-react';
import './css-weekly/ClientBasketCard.css';

function ClientBasketCard({ basket, subscription, onPause, onCancel, onViewDetails }) {
    const getImageUrl = (path) => {
        if (!path) return null;
        if (path.startsWith('http://') || path.startsWith('https://')) {
            return path;
        }
        return `http://localhost:8000/media/${path}`;
    };

    // ✅ FIX: Use basket data directly (already restructured in parent)
    const { 
        id, 
        name, 
        producer_banner, 
        producer_shop_name,
        discount_percentage, 
        original_price, 
        discounted_price, 
        product_count, 
        pickup_day 
    } = basket;
    
    const bannerUrl = getImageUrl(producer_banner);

    return (
        <div className="basket-card">
            {/* Banner Image */}
            <div className="basket-image-container">
                {bannerUrl ? (
                    <img
                        src={bannerUrl}
                        alt={name}
                        className="basket-image"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="basket-fallback"></div>
                )}
                
                <div className="basket-emoji-overlay">
                    <span className="basket-emoji">🧺</span>
                </div>

                {/* Discount Badge */}
                {discount_percentage > 0 && (
                    <div className="basket-discount-badge">-{discount_percentage}%</div>
                )}

                {/* Status Badge */}
                {subscription && (
                    <span className={`status-badge ${subscription.status}`}>
                        {subscription.status === 'active' && <><FiCheck /> Active</>}
                        {subscription.status === 'paused' && '⏸ Paused'}
                        {subscription.status === 'cancelled' && '✕ Cancelled'}
                    </span>
                )}
            </div>

            {/* Basket Info */}
            <div className="basket-info">
                <h3 className="basket-name">{name}</h3>
                
                {/* Producer Name */}
                {producer_shop_name && (
                    <p className="basket-producer">{producer_shop_name}</p>
                )}

                {/* Stats */}
                <div className="basket-stats">
                    <span className="basket-stat">
                        📦 {product_count || 0} items
                    </span>
                </div>

                {/* Pickup Day */}
                {pickup_day && (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        fontSize: '12px', 
                        color: '#666',
                        margin: '8px 0'
                    }}>
                        <Calendar style={{ width: '14px', height: '14px' }} />
                        <span>Every {pickup_day}</span>
                    </div>
                )}

                {/* Delivery Method (for subscriptions) */}
                {subscription && subscription.delivery_method && (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        fontSize: '12px', 
                        color: '#666',
                        marginBottom: '8px'
                    }}>
                        <MapPin style={{ width: '14px', height: '14px' }} />
                        <span>
                            {subscription.delivery_method === 'pickup_producer' 
                                ? 'Pickup at farm' 
                                : 'Pickup point'}
                        </span>
                    </div>
                )}

                {/* Pricing */}
                <div className="basket-price">
                    {discount_percentage > 0 ? (
                        <>
                            <span className="price-final">{parseFloat(discounted_price).toFixed(2)} DA</span>
                            <span className="price-original">{parseFloat(original_price).toFixed(2)} DA</span>
                        </>
                    ) : (
                        <span className="price-final">{parseFloat(original_price).toFixed(2)} DA</span>
                    )}
                    <span className="price-label">per delivery</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="basket-actions">
                {subscription ? (
                    // Subscription Management
                    <>
                        <button
                            className="basket-btn view-btn"
                            onClick={() => onViewDetails && onViewDetails(id)}
                        >
                            VIEW
                        </button>
                        {subscription.status === 'active' && (
                            <button
                                className="basket-btn pause-btn"
                                onClick={() => onPause && onPause()}
                            >
                                PAUSE
                            </button>
                        )}
                        {subscription.status === 'paused' && (
                            <button
                                className="basket-btn resume-btn"
                                onClick={() => onPause && onPause()}
                            >
                                RESUME
                            </button>
                        )}
                        {subscription.status !== 'cancelled' && (
                            <button
                                className="basket-btn cancel-btn"
                                onClick={() => onCancel && onCancel()}
                            >
                                CANCEL
                            </button>
                        )}
                    </>
                ) : (
                    // Browse Mode
                    <>
                        <button
                            className="basket-btn view-btn"
                            onClick={() => onViewDetails && onViewDetails(id)}
                        >
                            VIEW
                        </button>
                        <button
                            className="basket-btn add-btn"
                            onClick={() => {/* Subscribe logic */}}
                        >
                            SUBSCRIBE
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

export default ClientBasketCard;