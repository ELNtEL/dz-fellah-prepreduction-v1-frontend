import React, { useState, useEffect } from 'react';
import orderService from '../../services/orderService';
import ratingService from '../../services/ratingService';
import Toast from '../Toast';

const OrderCard = ({ order, onRateProduct, showRating = false }) => {
    const [fullOrder, setFullOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [productRatings, setProductRatings] = useState({});
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchOrderDetails();
    }, [order.id]);

    const fetchOrderDetails = async () => {
        try {
            const details = await orderService.getOrderById(order.id);
            setFullOrder(details.order || details);
            
            if (showRating && (details.order?.status === 'completed' || details.status === 'completed')) {
                await loadProductRatings(details.order || details);
            }
        } catch (err) {
            setFullOrder(order);
        } finally {
            setLoading(false);
        }
    };

    const loadProductRatings = async (orderData) => {
        const subOrders = orderData.sub_orders || [];
        const ratings = {};
        
        for (const subOrder of subOrders) {
            const items = subOrder.items || [];
            for (const item of items) {
                const productId = item.product_id || item.id;
                try {
                    const myRating = await ratingService.getMyRating(productId);
                    ratings[productId] = myRating.rating || 0;
                } catch (err) {
                    ratings[productId] = 0;
                }
            }
        }
        
        setProductRatings(ratings);
    };

    const handleRateProduct = async (productId, rating) => {
        try {
            await ratingService.rateProduct(productId, rating);
            setProductRatings(prev => ({ ...prev, [productId]: rating }));
            setToast({ message: 'Rating submitted successfully!', type: 'success' });
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Failed to submit rating. Please try again.';
            setToast({ message: errorMessage, type: 'error' });
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
            case 'delivered': return '#27ae60';
            case 'ready':
            case 'shipped': return '#3498db';
            case 'preparing': return '#9b59b6';
            case 'confirmed': return '#1abc9c';
            case 'pending': return '#f39c12';
            case 'cancelled': return '#e74c3c';
            default: return '#888';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
            case 'delivered':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <polyline points="20,6 9,17 4,12" />
                    </svg>
                );
            case 'ready':
            case 'shipped':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <rect x="1" y="3" width="15" height="13" />
                        <polygon points="16,8 20,8 23,11 23,16 16,16 16,8" />
                        <circle cx="5.5" cy="18.5" r="2.5" />
                        <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                );
            case 'pending':
                return (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12,6 12,12 16,14" />
                    </svg>
                );
            default:
                return null;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="order-card">
                <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                    Loading order details...
                </div>
            </div>
        );
    }

    const orderData = fullOrder || order;
    const subOrders = orderData.sub_orders || [];
    
    const allItems = [];
    const producerContacts = {}; // ✅ Track producer contact info
    
    subOrders.forEach(subOrder => {
        const producerDetails = subOrder.producer_details || {};
        const producerName = producerDetails.shop_name || 'Unknown Producer';
        
        // ✅ Store producer contact info
        if (!producerContacts[producerName]) {
            producerContacts[producerName] = {
                phone: producerDetails.phone,
                address: producerDetails.address,
                city: producerDetails.city,
                wilaya: producerDetails.wilaya
            };
        }
        
        const items = subOrder.items || [];
        items.forEach(item => {
            allItems.push({
                ...item,
                producerName: producerName,
                product_id: item.product_id || item.id
            });
        });
    });

    const canRate = showRating && orderData.status === 'completed';

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="order-card">
                <div className="order-header">
                    <div className="order-info">
                        <h4 className="order-id">Order #{orderData.order_number || orderData.id}</h4>
                        <p className="order-date">{formatDate(orderData.created_at)}</p>
                    </div>
                    <div
                        className="order-status"
                        style={{ backgroundColor: getStatusColor(orderData.status) }}
                    >
                        {getStatusIcon(orderData.status)}
                        <span>{orderData.status}</span>
                    </div>
                </div>

                {/* ✅ Producer Contact Info Section */}
                {Object.keys(producerContacts).length > 0 && (
                    <div style={{
                        padding: '15px 20px',
                        backgroundColor: '#f9f9f9',
                        borderBottom: '1px solid #e0e0e0'
                    }}>
                        <h5 style={{ fontSize: '13px', fontWeight: '600', color: '#285153', marginBottom: '8px' }}>
                            Producer Contact{Object.keys(producerContacts).length > 1 ? 's' : ''}:
                        </h5>
                        {Object.entries(producerContacts).map(([name, contact]) => (
                            <div key={name} style={{ marginBottom: '6px', fontSize: '12px', color: '#666' }}>
                                <span style={{ fontWeight: '600', color: '#333' }}>{name}</span>
                                {contact.phone && <span style={{ marginLeft: '10px' }}>📞 {contact.phone}</span>}
                                {contact.city && contact.wilaya && (
                                    <span style={{ marginLeft: '10px' }}>📍 {contact.city}, {contact.wilaya}</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="order-items">
                    {allItems.length > 0 ? (
                        allItems.map((item, index) => (
                            <div key={item.id || index}>
                                <div className="order-item">
                                    {item.product_photo && (
                                        <img
                                            src={item.product_photo}
                                            alt={item.product_name}
                                            className="order-item-image"
                                        />
                                    )}
                                    <div className="order-item-info">
                                        <span className="order-item-name">
                                            {item.product_name}
                                            <span style={{ 
                                                fontSize: '11px', 
                                                color: '#888', 
                                                marginLeft: '8px',
                                                fontWeight: 'normal'
                                            }}>
                                                from {item.producerName}
                                            </span>
                                        </span>
                                        <span className="order-item-qty">
                                            x{item.quantity_ordered || item.quantity} {item.sale_type === 'weight' ? 'kg' : ''}
                                        </span>
                                    </div>
                                    <span className="order-item-price">
                                        {(item.subtotal || 0).toLocaleString()} DA
                                    </span>
                                </div>

                                {canRate && (
                                    <div style={{
                                        padding: '8px 20px 12px 20px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        borderBottom: index < allItems.length - 1 ? '1px solid #f0f0f0' : 'none'
                                    }}>
                                        <span style={{ fontSize: '13px', color: '#666' }}>Rate:</span>
                                        <div style={{ display: 'flex', gap: '4px' }}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => handleRateProduct(item.product_id, star)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: 0,
                                                        transition: 'transform 0.2s'
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                                >
                                                    <svg 
                                                        viewBox="0 0 24 24" 
                                                        fill={star <= (productRatings[item.product_id] || 0) ? '#FFB800' : 'none'} 
                                                        stroke="#FFB800" 
                                                        strokeWidth="2" 
                                                        width="20" 
                                                        height="20"
                                                    >
                                                        <polygon points="12,2 15,8.5 22,9.3 17,14 18.5,21 12,17.5 5.5,21 7,14 2,9.3 9,8.5" />
                                                    </svg>
                                                </button>
                                            ))}
                                        </div>
                                        {productRatings[item.product_id] > 0 && (
                                            <span style={{ fontSize: '12px', color: '#FFB800', marginLeft: '5px' }}>
                                                ✓ Rated
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                            {orderData.sub_orders_count ? (
                                `${orderData.sub_orders_count} item${orderData.sub_orders_count > 1 ? 's' : ''}`
                            ) : (
                                'No items in this order'
                            )}
                        </div>
                    )}
                </div>

                <div className="order-footer">
                    <span className="order-total-label">Total:</span>
                    <span className="order-total-amount">
                        {parseFloat(orderData.total_amount || 0).toLocaleString()} DA
                    </span>
                </div>

                {subOrders.length > 1 && (
                    <div style={{ 
                        padding: '10px 20px', 
                        fontSize: '12px', 
                        color: '#666',
                        borderTop: '1px solid #e0e0e0',
                        backgroundColor: '#f9f9f9'
                    }}>
                        Split across {subOrders.length} producers
                    </div>
                )}
            </div>
        </>
    );
};

export default OrderCard;