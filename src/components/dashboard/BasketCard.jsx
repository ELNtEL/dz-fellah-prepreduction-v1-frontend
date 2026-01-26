import { Calendar, Package } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';
import basketpng from '../../assets/basketpng.png';
import './css-weekly/BasketCard.css';

function BasketCard({ basket, onEdit, onDelete }) {
    const { id, name, discount_percentage, original_price, discounted_price, product_count, subscriber_count, producer_banner, pickup_day, products } = basket;

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
                    <img src={basketpng} alt="basket" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                </div>

                {discount_percentage > 0 && (
                    <div className="basket-discount-badge">-{discount_percentage}%</div>
                )}
            </div>

            <div className="basket-info">
                <h3 className="basket-name">{name}</h3>

                <div className="basket-stats">
                    <span className="basket-stat">📦 {products?.length || product_count || 0} products</span>
                    <span className="basket-stat">👥 {subscriber_count || 0} subs</span>
                </div>

                {/* Products Preview */}
                {products && products.length > 0 && (
                    <div style={{
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
                            <span>Products:</span>
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
                                        fontWeight: '600',
                                        color: '#285153',
                                        fontSize: '10px',
                                        backgroundColor: '#e8f5e9',
                                        padding: '2px 6px',
                                        borderRadius: '4px'
                                    }}>
                                        x{product.quantity || 1} {product.sale_type === 'weight' ? 'kg' : (product.quantity > 1 ? 'units' : 'unit')}
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

                {/* Pickup Day Display */}
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
