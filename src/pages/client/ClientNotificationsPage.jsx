import React, { useState, useEffect } from 'react';
import orderService from '../../services/orderService';

const ClientNotificationsPage = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        
        try {
            // Fetch orders and generate notifications from them
            const response = await orderService.getMyOrders();
            const orders = response.orders || [];
            
            // Generate notifications from orders
            const orderNotifs = orders.map(order => {
                let message = '';
                let status = order.status;
                
                switch (order.status) {
                    case 'pending':
                        message = `Order ${order.order_number} is pending confirmation`;
                        break;
                    case 'confirmed':
                        message = `Order ${order.order_number} has been confirmed by the producer`;
                        break;
                    case 'preparing':
                        message = `Order ${order.order_number} is being prepared`;
                        break;
                    case 'ready':
                        message = `Order ${order.order_number} is ready for pickup!`;
                        break;
                    case 'completed':
                        message = `Order ${order.order_number} has been completed`;
                        break;
                    case 'cancelled':
                        message = `Order ${order.order_number} has been cancelled`;
                        break;
                    default:
                        message = `Order ${order.order_number} status: ${order.status}`;
                }
                
                return {
                    type: 'order',
                    title: `Order Update`,
                    message: message,
                    status: status,
                    time: formatTimeAgo(order.updated_at || order.created_at),
                    orderId: order.id
                };
            });
            
            // Sort by most recent first
            orderNotifs.sort((a, b) => new Date(b.time) - new Date(a.time));
            
            setNotifications(orderNotifs);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
        return date.toLocaleDateString();
    };

    const orderNotifications = notifications.filter(n => n.type === 'order');
    const promotionNotifications = notifications.filter(n => n.type === 'promotion');

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

            <div className="notifications-tabs">
                <button
                    className={`notification-tab ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    Order Updates
                    {orderNotifications.length > 0 && (
                        <span className="tab-badge">{orderNotifications.length}</span>
                    )}
                </button>
                <button
                    className={`notification-tab ${activeTab === 'promotions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('promotions')}
                >
                    Promotions
                </button>
            </div>

            <div className="notification-list">
                {activeTab === 'orders' ? (
                    orderNotifications.length > 0 ? (
                        orderNotifications.map((notification, index) => (
                            <div key={index} className="notification-card">
                                <div className="notification-icon-wrapper" style={{ backgroundColor: getStatusColor(notification.status) }}>
                                    {getStatusIcon(notification.status)}
                                </div>
                                <div className="notification-content">
                                    <h4>{notification.title}</h4>
                                    <p className="notification-message">{notification.message}</p>
                                    <span className="notification-time">{notification.time}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>
                            No order notifications yet.
                        </p>
                    )
                ) : (
                    promotionNotifications.length > 0 ? (
                        promotionNotifications.map((notification, index) => (
                            <div key={index} className="notification-promo">
                                <div className="promo-badge">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2" />
                                    </svg>
                                </div>
                                <div className="notification-content">
                                    <h4>{notification.title}</h4>
                                    <p className="notification-message">{notification.message}</p>
                                    <span className="notification-time">{notification.time}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>
                            No promotions yet.
                        </p>
                    )
                )}
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .tab-badge {
                    margin-left: 8px;
                    background: #285153;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                }
            `}</style>
        </div>
    );
};

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
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                    <line x1="15" y1="9" x2="9" y2="15" />
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