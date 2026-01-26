import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import basketService from '../../services/basketService';

const ProducerNotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        fetchAllNotifications();
    }, []);

    const fetchAllNotifications = async () => {
        setLoading(true);
        const allNotifications = [];

        try {
            // 1. Fetch Orders (sub-orders)
            const ordersResponse = await api.get('/producer-orders/my_orders/');
            const subOrders = ordersResponse.sub_orders || [];

            subOrders.forEach(subOrder => {
                const clientDetails = subOrder.client_details || {};
                const clientName = `${clientDetails.first_name || ''} ${clientDetails.last_name || ''}`.trim() || 'Client';

                allNotifications.push({
                    id: `order-${subOrder.id}`,
                    type: 'order',
                    icon: 'order',
                    title: getOrderTitle(subOrder.status),
                    message: getOrderMessage(subOrder),
                    clientName: clientName,
                    clientEmail: clientDetails.email || '',
                    clientPhone: clientDetails.phone || '',
                    clientAvatar: clientDetails.avatar,
                    status: subOrder.status,
                    orderNumber: subOrder.sub_order_number,
                    total: subOrder.total,
                    time: subOrder.updated_at || subOrder.created_at,
                    isNew: subOrder.status === 'pending'
                });
            });

            // 2. Fetch Subscriptions from all baskets
            try {
                const basketsResponse = await basketService.getMyBaskets();
                const baskets = basketsResponse.baskets || [];

                for (const basket of baskets) {
                    try {
                        const subscribersResponse = await api.get(`/my-seasonal-baskets/${basket.id}/subscribers/`);
                        const subscribers = subscribersResponse.subscribers || [];

                        subscribers.forEach(sub => {
                            const subName = `${sub.first_name || ''} ${sub.last_name || ''}`.trim() || 'Client';

                            allNotifications.push({
                                id: `sub-${sub.subscription_id}`,
                                type: 'subscription',
                                icon: 'subscription',
                                title: getSubscriptionTitle(sub.status),
                                message: `${subName} ${getSubscriptionAction(sub.status)} "${basket.name}"`,
                                clientName: subName,
                                clientEmail: sub.email || '',
                                clientPhone: sub.phone || '',
                                basketName: basket.name,
                                subscriptionStatus: sub.status,
                                deliveryMethod: sub.delivery_method,
                                totalDeliveries: sub.total_deliveries,
                                time: sub.start_date,
                                isNew: sub.status === 'active' && isRecent(sub.start_date, 3)
                            });
                        });
                    } catch (err) {
                        console.log(`No subscribers for basket ${basket.id}`);
                    }
                }
            } catch (err) {
                console.log('Could not fetch baskets:', err);
            }

            // 3. Fetch Ratings - Get products first, then check ratings
            try {
                const productsResponse = await api.get('/my-products/');
                const products = productsResponse.products || [];

                for (const product of products) {
                    try {
                        const ratingsResponse = await api.get(`/products/${product.id}/ratings/`);
                        if (ratingsResponse.total_ratings > 0) {
                            allNotifications.push({
                                id: `rating-${product.id}`,
                                type: 'rating',
                                icon: 'rating',
                                title: 'Product Rated',
                                message: `Your product "${product.name}" has ${ratingsResponse.total_ratings} rating(s) with an average of ${parseFloat(ratingsResponse.average_rating).toFixed(1)} stars`,
                                productName: product.name,
                                productId: product.id,
                                averageRating: ratingsResponse.average_rating,
                                totalRatings: ratingsResponse.total_ratings,
                                time: product.updated_at || product.created_at,
                                isNew: false
                            });
                        }
                    } catch (err) {
                        // No ratings for this product
                    }
                }
            } catch (err) {
                console.log('Could not fetch products for ratings:', err);
            }

            // Sort notifications: pending orders first, then by time
            allNotifications.sort((a, b) => {
                // New items first
                if (a.isNew && !b.isNew) return -1;
                if (b.isNew && !a.isNew) return 1;
                // Then by time
                return new Date(b.time) - new Date(a.time);
            });

            setNotifications(allNotifications);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const getOrderTitle = (status) => {
        switch (status) {
            case 'pending': return 'New Order Received!';
            case 'confirmed': return 'Order Confirmed';
            case 'preparing': return 'Order In Preparation';
            case 'ready': return 'Order Ready';
            case 'completed': return 'Order Completed';
            case 'cancelled': return 'Order Cancelled';
            default: return 'Order Update';
        }
    };

    const getOrderMessage = (subOrder) => {
        const clientDetails = subOrder.client_details || {};
        const clientName = `${clientDetails.first_name || ''} ${clientDetails.last_name || ''}`.trim() || 'A client';
        const itemCount = subOrder.items?.length || 0;

        switch (subOrder.status) {
            case 'pending':
                return `${clientName} placed an order with ${itemCount} item(s). Total: ${parseFloat(subOrder.total).toFixed(2)} DA`;
            case 'confirmed':
                return `Order #${subOrder.sub_order_number} confirmed. Please prepare ${itemCount} item(s).`;
            case 'preparing':
                return `You are preparing order #${subOrder.sub_order_number} for ${clientName}.`;
            case 'ready':
                return `Order #${subOrder.sub_order_number} is ready. Waiting for ${clientName} to pick up.`;
            case 'completed':
                return `Order #${subOrder.sub_order_number} completed. ${clientName} picked up their order.`;
            case 'cancelled':
                return `Order #${subOrder.sub_order_number} was cancelled.`;
            default:
                return `Order #${subOrder.sub_order_number} status: ${subOrder.status}`;
        }
    };

    const getSubscriptionTitle = (status) => {
        switch (status) {
            case 'active': return 'New Subscription!';
            case 'paused': return 'Subscription Paused';
            case 'cancelled': return 'Subscription Cancelled';
            default: return 'Subscription Update';
        }
    };

    const getSubscriptionAction = (status) => {
        switch (status) {
            case 'active': return 'subscribed to';
            case 'paused': return 'paused their subscription to';
            case 'cancelled': return 'cancelled their subscription to';
            default: return 'updated their subscription to';
        }
    };

    const isRecent = (dateString, days) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);
        return diffDays <= days;
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return date.toLocaleDateString();
    };

    const getIconForType = (type, status) => {
        if (type === 'order') {
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
            );
        }
        if (type === 'subscription') {
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            );
        }
        if (type === 'rating') {
            return (
                <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" width="20" height="20">
                    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
            );
        }
        return null;
    };

    const getIconBgColor = (type, status) => {
        if (type === 'order') {
            switch (status) {
                case 'pending': return '#f39c12';
                case 'confirmed': return '#9b59b6';
                case 'preparing': return '#3498db';
                case 'ready': return '#2ecc71';
                case 'completed': return '#27ae60';
                case 'cancelled': return '#e74c3c';
                default: return '#285153';
            }
        }
        if (type === 'subscription') {
            switch (status) {
                case 'active': return '#27ae60';
                case 'paused': return '#f39c12';
                case 'cancelled': return '#e74c3c';
                default: return '#285153';
            }
        }
        if (type === 'rating') {
            return '#FFB800';
        }
        return '#285153';
    };

    const filteredNotifications = activeFilter === 'all'
        ? notifications
        : notifications.filter(n => n.type === activeFilter);

    const orderCount = notifications.filter(n => n.type === 'order').length;
    const subscriptionCount = notifications.filter(n => n.type === 'subscription').length;
    const ratingCount = notifications.filter(n => n.type === 'rating').length;
    const newCount = notifications.filter(n => n.isNew).length;

    if (loading) {
        return (
            <div className="notifications-page">
                <h1 className="notifications-title">Notifications</h1>
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <div style={{
                        display: 'inline-block',
                        width: '50px',
                        height: '50px',
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #285153',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ marginTop: '20px', color: '#666' }}>Loading notifications...</p>
                </div>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="notifications-page">
            <h1 className="notifications-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                Notifications
                {newCount > 0 && (
                    <span style={{
                        background: '#e74c3c',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}>
                        {newCount} New
                    </span>
                )}
            </h1>

            {/* Filter Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                marginBottom: '20px',
                flexWrap: 'wrap'
            }}>
                <FilterButton
                    active={activeFilter === 'all'}
                    onClick={() => setActiveFilter('all')}
                    count={notifications.length}
                    label="All"
                />
                <FilterButton
                    active={activeFilter === 'order'}
                    onClick={() => setActiveFilter('order')}
                    count={orderCount}
                    label="Orders"
                    color="#3498db"
                />
                <FilterButton
                    active={activeFilter === 'subscription'}
                    onClick={() => setActiveFilter('subscription')}
                    count={subscriptionCount}
                    label="Subscriptions"
                    color="#27ae60"
                />
                <FilterButton
                    active={activeFilter === 'rating'}
                    onClick={() => setActiveFilter('rating')}
                    count={ratingCount}
                    label="Ratings"
                    color="#FFB800"
                />
            </div>

            {/* Notifications List */}
            <div className="notification-list">
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '16px',
                                marginBottom: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                border: notification.isNew ? '2px solid #f39c12' : '1px solid #e0e0e0',
                                position: 'relative'
                            }}
                        >
                            {notification.isNew && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-8px',
                                    right: '12px',
                                    background: '#f39c12',
                                    color: 'white',
                                    padding: '2px 10px',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    fontWeight: 'bold'
                                }}>
                                    NEW
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '14px' }}>
                                {/* Icon */}
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    borderRadius: '50%',
                                    backgroundColor: getIconBgColor(notification.type, notification.status || notification.subscriptionStatus),
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    {getIconForType(notification.type, notification.status)}
                                </div>

                                {/* Content */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                                            {notification.title}
                                        </h4>
                                        <span style={{ fontSize: '12px', color: '#888', whiteSpace: 'nowrap', marginLeft: '10px' }}>
                                            {formatTimeAgo(notification.time)}
                                        </span>
                                    </div>

                                    <p style={{ margin: '6px 0', fontSize: '14px', color: '#4b5563', lineHeight: '1.4' }}>
                                        {notification.message}
                                    </p>

                                    {/* Client Info for orders and subscriptions */}
                                    {(notification.type === 'order' || notification.type === 'subscription') && notification.clientName && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            marginTop: '10px',
                                            padding: '10px',
                                            backgroundColor: '#f8f9fa',
                                            borderRadius: '8px',
                                            fontSize: '13px'
                                        }}>
                                            <div style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: '50%',
                                                backgroundColor: '#285153',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '14px'
                                            }}>
                                                {notification.clientName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#1f2937' }}>{notification.clientName}</div>
                                                <div style={{ color: '#666', fontSize: '12px' }}>
                                                    {notification.clientEmail}
                                                    {notification.clientPhone && <span style={{ marginLeft: '10px' }}>{notification.clientPhone}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Order details */}
                                    {notification.type === 'order' && notification.total && (
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginTop: '10px',
                                            paddingTop: '10px',
                                            borderTop: '1px solid #e0e0e0'
                                        }}>
                                            <span style={{ color: '#666', fontSize: '13px' }}>
                                                Order #{notification.orderNumber}
                                            </span>
                                            <span style={{ fontWeight: 'bold', color: '#285153', fontSize: '15px' }}>
                                                {parseFloat(notification.total).toFixed(2)} DA
                                            </span>
                                        </div>
                                    )}

                                    {/* Subscription details */}
                                    {notification.type === 'subscription' && (
                                        <div style={{
                                            display: 'flex',
                                            gap: '12px',
                                            marginTop: '10px',
                                            paddingTop: '10px',
                                            borderTop: '1px solid #e0e0e0',
                                            fontSize: '12px',
                                            color: '#666'
                                        }}>
                                            <span>Deliveries: {notification.totalDeliveries || 0}</span>
                                            <span>Method: {notification.deliveryMethod === 'pickup_producer' ? 'Pickup' : 'Delivery'}</span>
                                        </div>
                                    )}

                                    {/* Rating details */}
                                    {notification.type === 'rating' && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            marginTop: '10px'
                                        }}>
                                            <div style={{ display: 'flex', gap: '2px' }}>
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <svg
                                                        key={star}
                                                        viewBox="0 0 24 24"
                                                        fill={star <= Math.round(notification.averageRating) ? '#FFB800' : '#e0e0e0'}
                                                        width="18"
                                                        height="18"
                                                    >
                                                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <span style={{ fontWeight: '600', color: '#1f2937' }}>
                                                {parseFloat(notification.averageRating).toFixed(1)}
                                            </span>
                                            <span style={{ color: '#888', fontSize: '13px' }}>
                                                ({notification.totalRatings} rating{notification.totalRatings !== 1 ? 's' : ''})
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: '#888'
                    }}>
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            width="60"
                            height="60"
                            style={{ margin: '0 auto 20px', color: '#ddd' }}
                        >
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '8px' }}>
                            No {activeFilter !== 'all' ? activeFilter : ''} notifications yet
                        </h3>
                        <p style={{ fontSize: '14px' }}>
                            {activeFilter === 'order' && "You'll see new orders from your customers here"}
                            {activeFilter === 'subscription' && "You'll see subscription activity here"}
                            {activeFilter === 'rating' && "Product ratings will appear here"}
                            {activeFilter === 'all' && "Your notifications will appear here"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Filter Button Component
const FilterButton = ({ active, onClick, count, label, color = '#285153' }) => (
    <button
        onClick={onClick}
        style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: active ? color : '#f3f4f6',
            color: active ? 'white' : '#4b5563',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
        }}
    >
        {label}
        {count > 0 && (
            <span style={{
                backgroundColor: active ? 'rgba(255,255,255,0.3)' : '#e5e7eb',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '12px'
            }}>
                {count}
            </span>
        )}
    </button>
);

export default ProducerNotificationsPage;
