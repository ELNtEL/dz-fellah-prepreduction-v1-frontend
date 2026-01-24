import { Calendar } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';
import './css-weekly/BasketCard.css';

function BasketCard({ basket, onEdit, onDelete }) {
    const { id, name, discount_percentage, original_price, discounted_price, product_count, subscriber_count, producer_banner, pickup_day } = basket;

    const bannerUrl = getImageUrl(producer_banner);

    return (
        <div className="basket-card">
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
                    <div className="basket-image basket-fallback"></div>
                )}
                
                <div className="basket-emoji-overlay">
                    <span className="basket-emoji">🛒</span>
                </div>

                {discount_percentage > 0 && (
                    <div className="basket-discount-badge">-{discount_percentage}%</div>
                )}
            </div>

            <div className="basket-info">
                <h3 className="basket-name">{name}</h3>
                
                <div className="basket-stats">
                    <span className="basket-stat">📦 {product_count || 0} products</span>
                    <span className="basket-stat">👥 {subscriber_count || 0} subs</span>
                </div>

                {/* ✅ Pickup Day Display */}
                {pickup_day && (
                    <div className="basket-pickup" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px', 
                        fontSize: '13px', 
                        color: '#666',
                        marginTop: '8px'
                    }}>
                      <Calendar style={{ width: '14px', height: '14px' }} />
                      <span>Pickup: Every {pickup_day}</span>
                    </div>
                )}

                <div className="basket-price">
                    {discount_percentage > 0 ? (
                        <>
                            <span className="price-original">{parseFloat(original_price).toFixed(2)} DA</span>
                            <span className="price-final">{parseFloat(discounted_price).toFixed(2)} DA</span>
                        </>
                    ) : (
                        <span className="price-final">{parseFloat(original_price).toFixed(2)} DA</span>
                    )}
                </div>
            </div>

            <div className="basket-actions">
                <button
                    className="basket-btn edit-btn"
                    onClick={() => onEdit(id)}
                >
                    EDIT
                </button>
                <button
                    className="basket-btn delete-btn"
                    onClick={() => onDelete(id)}
                >
                    DELETE
                </button>
            </div>
        </div>
    );
}

export default BasketCard;