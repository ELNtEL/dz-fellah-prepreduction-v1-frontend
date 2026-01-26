import React, { useState, useEffect } from 'react';
import orderService from '../../services/orderService';

const ClientNotificationsPage = () => {
    const [activeTab, setActiveTab] = useState('all');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        const allNotifications = [];

        try {
            // Fetch all orders with their sub-orders
            const response = await orderService.getMyOrders();
            const orders = response.orders || [];

            // Generate notifications from each sub-order (per producer)
            for (const order of orders) {
                // Fetch full order details to get sub-orders
                try {
                    const orderDetails = await orderService.getOrderById(order.id);
                    const fullOrder = orderDetails.order || orderDetails;
                    const subOrders = fullOrder.sub_orders || [];

                    if (subOrders.length > 0) {
                        // Create notification for each sub-order status
                        for (const subOrder of subOrders) {
                            const producerName = subOrder.producer_details?.shop_name || 'Producer';
                            const items = subOrder.items || [];
                            const itemNames = items.map(i => i.product_name).slice(0, 2).join(', ');
                            const moreItems = items.length > 2 ? ` +${items.length - 2} more` : '';

                            let message = '';
                            let isNew = false;

                            switch (subOrder.status) {
                                case 'pending':
                                    message = `Waiting for ${producerName} to confirm`;
                                    isNew = true;
                                    break;
                                case 'confirmed':
                                    message = `${producerName} has confirmed your order`;
                                    isNew = isRecent(subOrder.updated_at, 24);
                                    break;
                                case 'preparing':
                                    message = `${producerName} is preparing your order`;
                                    isNew = isRecent(subOrder.updated_at, 24);
                                    break;
                                case 'ready':
                                    message = `Your order from ${producerName} is ready for pickup!`;
                                    isNew = isRecent(subOrder.updated_at, 48);
                                    break;
                                case 'completed':
                                    message = `Order from ${producerName} completed`;
                                    break;
                                case 'cancelled':
                                    message = `${producerName} cancelled this order`;
                                    isNew = isRecent(subOrder.updated_at, 48);
                                    break;
                                default:
                                    message = `Order status: ${subOrder.status}`;
                            }

                            allNotifications.push({
                                type: 'order',
                                title: `Order #${fullOrder.order_number}`,
                                message: message,
                                status: subOrder.status,
                                producerName: producerName,
                                items: itemNames + moreItems,
                                subtotal: subOrder.subtotal,
                                time: subOrder.updated_at || subOrder.created_at,
                                timeFormatted: formatTimeAgo(subOrder.updated_at || subOrder.created_at),
                                orderId: order.id,
                                subOrderId: subOrder.id,
                                isNew: isNew,
                                producerPhone: subOrder.producer_details?.phone,
                                producerAddress: subOrder.producer_details?.address,
                                producerCity: subOrder.producer_details?.city
                            });
                        }
                    } else {
                        // Fallback for orders without sub-orders
                        allNotifications.push({
                            type: 'order',
                            title: `Order #${order.order_number}`,
                            message: getOrderStatusMessage(order.status),
                            status: order.status,
                            time: order.updated_at || order.created_at,
                            timeFormatted: formatTimeAgo(order.updated_at || order.created_at),
                            orderId: order.id,
                            isNew: order.status === 'pending' || (order.status === 'ready' && isRecent(order.updated_at, 48))
                        });
                    }
                } catch (err) {
                    // If can't fetch details, use basic order info
                    allNotifications.push({
                        type: 'order',
                        title: `Order #${order.order_number}`,
                        message: getOrderStatusMessage(order.status),
                        status: order.status,
                        time: order.updated_at || order.created_at,
                        timeFormatted: formatTimeAgo(order.updated_at || order.created_at),
                        orderId: order.id,
                        isNew: order.status === 'pending'
                    });
                }
            }

            // Sort by most recent first
            allNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));

            setNotifications(allNotifications);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const getOrderStatusMessage = (status) => {
        switch (status) {
            case 'pending': return 'Order is pending confirmation';
            case 'confirmed': return 'Order has been confirmed';
            case 'preparing': return 'Order is being prepared';
            case 'ready': return 'Order is ready for pickup!';
            case 'completed': return 'Order has been completed';
            case 'cancelled': return 'Order has been cancelled';
            default: return `Status: ${status}`;
        }
    };

    const isRecent = (dateString, hours = 24) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        const now = new Date();
        const diffHours = (now - date) / (1000 * 60 * 60);
        return diffHours < hours;
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        return date.toLocaleDateString();
    };

    // Filter notifications based on active tab
    const filteredNotifications = notifications.filter(n => {
        if (activeTab === 'all') return true;
        if (activeTab === 'pending') return n.status === 'pending';
        if (activeTab === 'active') return ['confirmed', 'preparing'].includes(n.status);
        if (activeTab === 'ready') return n.status === 'ready';
        if (activeTab === 'completed') return ['completed', 'cancelled'].includes(n.status);
        return true;
    });

    // Count for badges
    const pendingCount = notifications.filter(n => n.status === 'pending').length;
    const readyCount = notifications.filter(n => n.status === 'ready').length;
    const activeCount = notifications.filter(n => ['confirmed', 'preparing'].includes(n.status)).length;

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
            </div>
        );
    }

    return (
        <div className="notifications-page">
            <h1 className="notifications-title">Notifications</h1>

            {/* Filter Tabs */}
            <div style={{
                display: 'flex',
                gap: '8px',
                padding: '0 20px 20px',
                overflowX: 'auto',
                flexWrap: 'wrap'
            }}>
                <FilterTab
                    label="All"
                    active={activeTab === 'all'}
                    onClick={() => setActiveTab('all')}
                    count={notifications.length}
                />
                <FilterTab
                    label="Pending"
                    active={activeTab === 'pending'}
                    onClick={() => setActiveTab('pending')}
                    count={pendingCount}
                    highlight={pendingCount > 0}
                />
                <FilterTab
                    label="In Progress"
                    active={activeTab === 'active'}
                    onClick={() => setActiveTab('active')}
                    count={activeCount}
                />
                <FilterTab
                    label="Ready"
                    active={activeTab === 'ready'}
                    onClick={() => setActiveTab('ready')}
                    count={readyCount}
                    highlight={readyCount > 0}
                />
                <FilterTab
                    label="History"
                    active={activeTab === 'completed'}
                    onClick={() => setActiveTab('completed')}
                />
            </div>

            {/* Notifications List */}
            <div className="notification-list">
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification, index) => (
                        <div key={`${notification.orderId}-${notification.subOrderId || index}`}
                             className="notification-card"
                             style={{
                                 position: 'relative',
                                 borderLeft: `4px solid ${getStatusColor(notification.status)}`,
                                 marginBottom: '12px'
                             }}>

                            {/* NEW Badge */}
                            {notification.isNew && (
                                <span style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    backgroundColor: '#e74c3c',
                                    color: 'white',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontSize: '10px',
                                    fontWeight: 'bold'
                                }}>
                                    NEW
                                </span>
                            )}

                            <div className="notification-icon-wrapper" style={{ backgroundColor: getStatusColor(notification.status) }}>
                                {getStatusIcon(notification.status)}
                            </div>

                            <div className="notification-content" style={{ flex: 1 }}>
                                {/* Header with order number and status */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                    <h4 style={{ margin: 0 }}>{notification.title}</h4>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '10px',
                                        backgroundColor: getStatusColor(notification.status),
                                        color: 'white',
                                        fontSize: '10px',
                                        fontWeight: '600',
                                        textTransform: 'uppercase'
                                    }}>
                                        {getStatusLabel(notification.status)}
                                    </span>
                                </div>

                                {/* Main message */}
                                <p className="notification-message" style={{
                                    margin: '4px 0',
                                    fontWeight: notification.isNew ? '600' : '400'
                                }}>
                                    {notification.message}
                                </p>

                                {/* Items preview */}
                                {notification.items && (
                                    <p style={{
                                        margin: '4px 0',
                                        fontSize: '12px',
                                        color: '#666'
                                    }}>
                                        Items: {notification.items}
                                    </p>
                                )}

                                {/* Producer contact info for ready orders */}
                                {notification.status === 'ready' && notification.producerPhone && (
                                    <div style={{
                                        marginTop: '8px',
                                        padding: '8px 12px',
                                        backgroundColor: '#e8f5e9',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}>
                                        <div style={{ fontWeight: '600', color: '#27ae60', marginBottom: '4px' }}>
                                            Pickup Information
                                        </div>
                                        <div style={{ color: '#333' }}>
                                            {notification.producerName}
                                        </div>
                                        {notification.producerAddress && (
                                            <div style={{ color: '#666' }}>
                                                {notification.producerAddress}
                                                {notification.producerCity && `, ${notification.producerCity}`}
                                            </div>
                                        )}
                                        <div style={{ color: '#285153', fontWeight: '500' }}>
                                            Phone: {notification.producerPhone}
                                        </div>
                                    </div>
                                )}

                                {/* Subtotal and time */}
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginTop: '8px'
                                }}>
                                    {notification.subtotal && (
                                        <span style={{
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            color: '#285153'
                                        }}>
                                            {parseFloat(notification.subtotal).toLocaleString()} DA
                                        </span>
                                    )}
                                    <span className="notification-time" style={{
                                        fontSize: '12px',
                                        color: '#888'
                                    }}>
                                        {notification.timeFormatted}
                                    </span>
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
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" style={{ opacity: 0.5 }}>
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <p style={{ marginTop: '16px' }}>
                            {activeTab === 'all'
                                ? 'No notifications yet'
                                : `No ${activeTab} orders`}
                        </p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .notification-card {
                    background: white;
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    gap: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                }
                .notification-icon-wrapper {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
            `}</style>
        </div>
    );
};

// Filter Tab Component
const FilterTab = ({ label, active, onClick, count, highlight }) => (
    <button
        onClick={onClick}
        style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: active ? '#285153' : (highlight ? '#fff3cd' : '#f0f0f0'),
            color: active ? 'white' : (highlight ? '#856404' : '#333'),
            fontWeight: active || highlight ? '600' : '400',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            transition: 'all 0.2s'
        }}
    >
        {label}
        {count !== undefined && count > 0 && (
            <span style={{
                backgroundColor: active ? 'rgba(255,255,255,0.3)' : (highlight ? '#856404' : '#285153'),
                color: active ? 'white' : (highlight ? 'white' : 'white'),
                padding: '1px 6px',
                borderRadius: '10px',
                fontSize: '11px',
                fontWeight: 'bold'
            }}>
                {count}
            </span>
        )}
    </button>
);

const getStatusColor = (status) => {
    switch (status) {
        case 'completed': return '#27ae60';
        case 'ready': return '#2ecc71';
        case 'preparing': return '#3498db';
        case 'confirmed': return '#9b59b6';
        case 'pending': return '#f39c12';
        case 'cancelled': return '#e74c3c';
        default: return '#3D7A7A';
    }
};

const getStatusLabel = (status) => {
    switch (status) {
        case 'completed': return 'Completed';
        case 'ready': return 'Ready';
        case 'preparing': return 'Preparing';
        case 'confirmed': return 'Confirmed';
        case 'pending': return 'Pending';
        case 'cancelled': return 'Cancelled';
        default: return status;
    }
};

const getStatusIcon = (status) => {
    switch (status) {
        case 'completed':
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="18" height="18">
                    <polyline points="20,6 9,17 4,12" />
                </svg>
            );
        case 'ready':
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="18" height="18">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22,4 12,14.01 9,11.01" />
                </svg>
            );
        case 'preparing':
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="18" height="18">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,10" />
                </svg>
            );
        case 'confirmed':
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="18" height="18">
                    <polyline points="20,6 9,17 4,12" />
                </svg>
            );
        case 'pending':
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="18" height="18">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                </svg>
            );
        case 'cancelled':
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="18" height="18">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
            );
        default:
            return (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" width="18" height="18">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
            );
    }
};

export default ClientNotificationsPage;
