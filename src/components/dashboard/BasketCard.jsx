import { useState } from 'react';
import { Calendar, Package, Users, X, Phone, Mail, MapPin, Truck } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';
import basketpng from '../../assets/basketpng.png';
import basketService from '../../services/basketService';
import './css-weekly/BasketCard.css';

function BasketCard({ basket, onEdit, onDelete }) {
    const { id, name, discount_percentage, original_price, discounted_price, product_count, subscriber_count, producer_banner, pickup_day, products } = basket;

    const [showSubscribers, setShowSubscribers] = useState(false);
    const [subscribers, setSubscribers] = useState([]);
    const [loadingSubscribers, setLoadingSubscribers] = useState(false);

    const bannerUrl = getImageUrl(producer_banner);

    const handleSubscriberClick = async () => {
        if (subscriber_count === 0) return;

        if (showSubscribers) {
            setShowSubscribers(false);
            return;
        }

        setLoadingSubscribers(true);
        try {
            const response = await basketService.getBasketSubscribers(id);
            setSubscribers(response.subscribers || []);
            setShowSubscribers(true);
        } catch (err) {
            console.error('Failed to fetch subscribers:', err);
        } finally {
            setLoadingSubscribers(false);
        }
    };

    const getDeliveryMethodLabel = (method) => {
        switch (method) {
            case 'pickup_producer':
                return 'Pickup at Farm';
            case 'pickup_point':
                return 'Collection Point';
            default:
                return method || 'Not specified';
        }
    };

    const getDeliveryMethodIcon = (method) => {
        if (method === 'pickup_producer') {
            return <MapPin style={{ width: '12px', height: '12px' }} />;
        }
        return <Truck style={{ width: '12px', height: '12px' }} />;
    };

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
                    <span className="basket-stat"> {products?.length || product_count || 0} products</span>
                    <span
                        className="basket-stat"
                        onClick={handleSubscriberClick}
                        style={{
                            cursor: subscriber_count > 0 ? 'pointer' : 'default',
                            backgroundColor: subscriber_count > 0 ? '#e8f5e9' : undefined,
                            padding: subscriber_count > 0 ? '4px 8px' : undefined,
                            borderRadius: subscriber_count > 0 ? '12px' : undefined,
                            transition: 'all 0.2s',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                        onMouseOver={(e) => {
                            if (subscriber_count > 0) {
                                e.currentTarget.style.backgroundColor = '#c8e6c9';
                            }
                        }}
                        onMouseOut={(e) => {
                            if (subscriber_count > 0) {
                                e.currentTarget.style.backgroundColor = '#e8f5e9';
                            }
                        }}
                    >
                        <Users style={{ width: '14px', height: '14px' }} />
                        {loadingSubscribers ? '...' : `${subscriber_count || 0} subs`}
                        {subscriber_count > 0 && (
                            <span style={{ fontSize: '10px', opacity: 0.7 }}>
                                {showSubscribers ? '▲' : '▼'}
                            </span>
                        )}
                    </span>
                </div>

                {/* Subscribers List - Expandable */}
                {showSubscribers && subscribers.length > 0 && (
                    <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        backgroundColor: '#f0f7f0',
                        borderRadius: '8px',
                        border: '1px solid #c8e6c9',
                        maxHeight: '250px',
                        overflowY: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '10px',
                            paddingBottom: '8px',
                            borderBottom: '1px solid #c8e6c9'
                        }}>
                            <span style={{
                                fontWeight: '600',
                                fontSize: '12px',
                                color: '#285153',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <Users style={{ width: '14px', height: '14px' }} />
                                Subscribers ({subscribers.length})
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowSubscribers(false);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '2px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: '#666'
                                }}
                            >
                                <X style={{ width: '14px', height: '14px' }} />
                            </button>
                        </div>

                        {subscribers.map((sub, index) => (
                            <div
                                key={sub.subscription_id || index}
                                style={{
                                    padding: '10px',
                                    backgroundColor: 'white',
                                    borderRadius: '6px',
                                    marginBottom: index < subscribers.length - 1 ? '8px' : 0,
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                                }}
                            >
                                {/* Client Name */}
                                <div style={{
                                    fontWeight: '600',
                                    fontSize: '13px',
                                    color: '#333',
                                    marginBottom: '6px'
                                }}>
                                    {sub.first_name} {sub.last_name}
                                </div>

                                {/* Contact Info */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px',
                                    fontSize: '11px',
                                    color: '#666'
                                }}>
                                    {sub.phone && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Phone style={{ width: '11px', height: '11px' }} />
                                            <span>{sub.phone}</span>
                                        </div>
                                    )}
                                    {sub.email && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Mail style={{ width: '11px', height: '11px' }} />
                                            <span style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                                maxWidth: '150px'
                                            }}>{sub.email}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Delivery Method - Highlighted */}
                                <div style={{
                                    marginTop: '8px',
                                    padding: '6px 8px',
                                    backgroundColor: sub.delivery_method === 'pickup_producer' ? '#e3f2fd' : '#fff3e0',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    color: sub.delivery_method === 'pickup_producer' ? '#1565c0' : '#e65100'
                                }}>
                                    {getDeliveryMethodIcon(sub.delivery_method)}
                                    {getDeliveryMethodLabel(sub.delivery_method)}
                                </div>

                                {/* Subscription Status */}
                                <div style={{
                                    marginTop: '6px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '10px'
                                }}>
                                    <span style={{
                                        padding: '2px 6px',
                                        borderRadius: '10px',
                                        backgroundColor: sub.status === 'active' ? '#e8f5e9' : '#ffebee',
                                        color: sub.status === 'active' ? '#2e7d32' : '#c62828',
                                        fontWeight: '600',
                                        textTransform: 'uppercase'
                                    }}>
                                        {sub.status}
                                    </span>
                                    {sub.total_deliveries > 0 && (
                                        <span style={{ color: '#888' }}>
                                            {sub.total_deliveries} deliveries
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

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
