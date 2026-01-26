import React, { useState, useEffect } from 'react';
import orderService from '../../services/orderService';
import ratingService from '../../services/ratingService';
import Toast from '../Toast';

const OrderCard = ({ order, onRateProduct, showRating = false, onDelete = null, showDeleteButton = false }) => {
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

            // Load ratings for completed sub-orders only
            if (showRating) {
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
            // Only load ratings for completed sub-orders
            if (subOrder.status === 'completed') {
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

    const getStatusLabel = (status) => {
        switch (status) {
            case 'completed': return 'Completed';
            case 'ready': return 'Ready for Pickup';
            case 'preparing': return 'Preparing';
            case 'confirmed': return 'Confirmed';
            case 'pending': return 'Pending';
            case 'cancelled': return 'Cancelled';
            default: return status;
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

    // Calculate overall order status based on sub-orders
    const getOverallStatus = (subOrders) => {
        if (!subOrders || subOrders.length === 0) return 'pending';

        const statuses = subOrders.map(so => so.status);

        // If all cancelled, overall is cancelled
        if (statuses.every(s => s === 'cancelled')) return 'cancelled';

        // If all completed, overall is completed
        if (statuses.every(s => s === 'completed' || s === 'cancelled')) return 'completed';

        // If any is ready (and none pending/preparing), overall is ready
        const nonCancelledStatuses = statuses.filter(s => s !== 'cancelled');
        if (nonCancelledStatuses.every(s => s === 'ready' || s === 'completed')) return 'ready';

        // If any is preparing, overall is preparing
        if (nonCancelledStatuses.some(s => s === 'preparing')) return 'preparing';

        // If any is confirmed, overall is confirmed
        if (nonCancelledStatuses.some(s => s === 'confirmed')) return 'confirmed';

        return 'pending';
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
    const overallStatus = subOrders.length > 0 ? getOverallStatus(subOrders) : orderData.status;

    return (
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="order-card" style={{ position: 'relative' }}>
                {/* Delete Button */}
                {showDeleteButton && onDelete && (
                    <button
                        onClick={() => onDelete(orderData.id)}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: 'none',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            transition: 'all 0.2s',
                            zIndex: 10
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#dc2626';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#fee2e2';
                            e.currentTarget.style.color = '#dc2626';
                        }}
                        title="Remove from history"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                )}

                {/* Order Header */}
                <div className="order-header">
                    <div className="order-info">
                        <h4 className="order-id">Order #{orderData.order_number || orderData.id}</h4>
                        <p className="order-date">{formatDate(orderData.created_at)}</p>
                    </div>
                    <div
                        className="order-status"
                        style={{ backgroundColor: getStatusColor(overallStatus) }}
                    >
                        <span>{getStatusLabel(overallStatus)}</span>
                    </div>
                </div>

                {/* Sub-Orders - Each producer group with their status */}
                {subOrders.length > 0 ? (
                    <div className="order-items" style={{ padding: 0 }}>
                        {subOrders.map((subOrder, subIndex) => {
                            const producerDetails = subOrder.producer_details || {};
                            const producerName = producerDetails.shop_name || 'Unknown Producer';
                            const items = subOrder.items || [];
                            const canRateSubOrder = showRating && subOrder.status === 'completed';

                            return (
                                <div key={subOrder.id || subIndex} style={{ borderBottom: subIndex < subOrders.length - 1 ? '2px solid #e0e0e0' : 'none' }}>
                                    {/* Producer Header with Status */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 20px',
                                        backgroundColor: '#f8f9fa',
                                        borderBottom: '1px solid #e0e0e0'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                backgroundColor: '#285153',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '14px',
                                                fontWeight: 'bold'
                                            }}>
                                                {producerName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <span style={{ fontWeight: '600', color: '#285153', fontSize: '14px' }}>
                                                    {producerName}
                                                </span>
                                                {producerDetails.phone && (
                                                    <span style={{ marginLeft: '10px', fontSize: '12px', color: '#666' }}>
                                                        {producerDetails.phone}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {/* Sub-order Status Badge */}
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            backgroundColor: getStatusColor(subOrder.status),
                                            color: 'white',
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            textTransform: 'uppercase'
                                        }}>
                                            {getStatusLabel(subOrder.status)}
                                        </div>
                                    </div>

                                    {/* Items from this producer */}
                                    {items.map((item, itemIndex) => (
                                        <div key={item.id || itemIndex}>
                                            <div className="order-item" style={{ padding: '12px 20px' }}>
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
                                                    </span>
                                                    <span className="order-item-qty">
                                                        x{item.quantity_ordered || item.quantity} {item.sale_type === 'weight' ? 'kg' : ''}
                                                    </span>
                                                </div>
                                                <span className="order-item-price">
                                                    {(item.subtotal || 0).toLocaleString()} DA
                                                </span>
                                            </div>

                                            {/* Rating - Only for completed sub-orders */}
                                            {canRateSubOrder && (
                                                <div style={{
                                                    padding: '8px 20px 12px 20px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    backgroundColor: '#f0fff4',
                                                    borderBottom: itemIndex < items.length - 1 ? '1px solid #e0e0e0' : 'none'
                                                }}>
                                                    <span style={{ fontSize: '13px', color: '#666' }}>Rate this product:</span>
                                                    <div style={{ display: 'flex', gap: '4px' }}>
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <button
                                                                key={star}
                                                                onClick={() => handleRateProduct(item.product_id || item.id, star)}
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
                                                                    fill={star <= (productRatings[item.product_id || item.id] || 0) ? '#FFB800' : 'none'}
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
                                                    {productRatings[item.product_id || item.id] > 0 && (
                                                        <span style={{ fontSize: '12px', color: '#27ae60', marginLeft: '5px' }}>
                                                            Rated
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {/* Show message if sub-order not completed yet */}
                                            {showRating && subOrder.status !== 'completed' && subOrder.status !== 'cancelled' && itemIndex === items.length - 1 && (
                                                <div style={{
                                                    padding: '8px 20px',
                                                    fontSize: '12px',
                                                    color: '#666',
                                                    backgroundColor: '#fff8e1',
                                                    fontStyle: 'italic'
                                                }}>
                                                    Rating available once this producer marks the order as completed
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {/* Sub-order subtotal */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        padding: '10px 20px',
                                        backgroundColor: '#f8f9fa',
                                        fontSize: '13px',
                                        fontWeight: '500'
                                    }}>
                                        <span style={{ color: '#666' }}>Subtotal from {producerName}:</span>
                                        <span style={{ color: '#285153' }}>{parseFloat(subOrder.subtotal || 0).toLocaleString()} DA</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="order-items">
                        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                            {orderData.sub_orders_count ? (
                                `${orderData.sub_orders_count} item${orderData.sub_orders_count > 1 ? 's' : ''}`
                            ) : (
                                'No items in this order'
                            )}
                        </div>
                    </div>
                )}

                {/* Delivery/Pickup Info */}
                {orderData.delivery_method && (
                    <div style={{
                        padding: '12px 20px',
                        backgroundColor: '#e3f2fd',
                        borderBottom: '1px solid #e0e0e0',
                        fontSize: '13px'
                    }}>
                        <span style={{ fontWeight: '600', color: '#1565c0' }}>
                            {orderData.delivery_method === 'pickup_producer' ? 'Pickup at Farm' : 'Pickup Point'}:
                        </span>
                        <span style={{ marginLeft: '8px', color: '#333' }}>
                            {orderData.delivery_method === 'pickup_producer'
                                ? 'Collect your order directly from each producer'
                                : orderData.delivery_address || 'Address not specified'}
                        </span>
                    </div>
                )}

                {/* Order Total */}
                <div className="order-footer">
                    <span className="order-total-label">Total:</span>
                    <span className="order-total-amount">
                        {parseFloat(orderData.total_amount || 0).toLocaleString()} DA
                    </span>
                </div>

                {/* Multi-producer info */}
                {subOrders.length > 1 && (
                    <div style={{
                        padding: '10px 20px',
                        fontSize: '12px',
                        color: '#666',
                        borderTop: '1px solid #e0e0e0',
                        backgroundColor: '#f9f9f9',
                        textAlign: 'center'
                    }}>
                        This order is split across {subOrders.length} producers - each has their own status
                    </div>
                )}
            </div>
        </>
    );
};

export default OrderCard;
