import { FiCheck } from 'react-icons/fi';
import { Calendar, MapPin, Package } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';
import authService from '../../services/authService';
import './css-weekly/ClientBasketCard.css';

function ClientBasketCard({ basket, subscription, onPause, onCancel, onViewDetails }) {

    // ✅ FIX: Use basket data directly (already restructured in parent)
    const {
        id,
        name,
        producer_banner,
        producer_shop_name,
        producer_id,
        discount_percentage,
        original_price,
        discounted_price,
        product_count,
        pickup_day,
        products  // ✅ ADD THIS
    } = basket;

    const bannerUrl = getImageUrl(producer_banner);

    // Check if current user is the producer of this basket
    const currentUserId = authService.getCurrentUserId();
    const isOwnBasket = currentUserId && producer_id === currentUserId;

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
                        📦 {products?.length || product_count || 0} items
                    </span>
                </div>

                {/* ✅ NEW: Products Preview */}
                {products && products.length > 0 && (
                    <div className="basket-products-preview" style={{
                        marginTop: '12px',
                        padding: '8px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '6px',
                        fontSize: '11px'
                    }}>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            marginBottom: '8px',
                            fontWeight: '600',
                            color: '#333'
                        }}>
                            <Package style={{ width: '12px', height: '12px' }} />
                            <span>Products in basket:</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {products.slice(0, 3).map((product) => (
                                <div key={product.id} style={{ 
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    color: '#666',
                                    paddingLeft: '4px'
                                }}>
                                    <span style={{ flex: 1 }}>• {product.name}</span>
                                    <span style={{ 
                                        fontWeight: '500',
                                        color: '#2d5016',
                                        fontSize: '10px'
                                    }}>
                                        {parseFloat(product.quantity).toFixed(1)}kg
                                    </span>
                                </div>
                            ))}
                            {products.length > 3 && (
                                <span style={{ 
                                    fontSize: '10px', 
                                    color: '#999', 
                                    marginTop: '4px',
                                    paddingLeft: '4px',
                                    fontStyle: 'italic'
                                }}>
                                    +{products.length - 3} more item{products.length - 3 > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>
                )}

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
                            onClick={() => onViewDetails && onViewDetails(basket)}
                        >
                            VIEW DETAILS
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
                            onClick={() => onViewDetails && onViewDetails(basket)}
                        >
                            VIEW DETAILS
                        </button>
                        {!isOwnBasket && (
                            <button
                                className="basket-btn add-btn"
                                onClick={() => {/* Subscribe logic */}}
                            >
                                SUBSCRIBE
                            </button>
                        )}
                        {isOwnBasket && (
                            <div style={{
                                padding: '8px',
                                backgroundColor: '#fef3c7',
                                borderRadius: '8px',
                                textAlign: 'center',
                                fontSize: '12px',
                                color: '#92400e',
                                fontWeight: '600'
                            }}>
                                📦 Your basket
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default ClientBasketCard;
