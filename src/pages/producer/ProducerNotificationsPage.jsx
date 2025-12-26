import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ProducerNotificationsPage = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        
        try {
            // Fetch producer's orders (sub-orders)
            const response = await api.get('/producer-orders/my_orders/');
            const subOrders = response.sub_orders || [];
            
            // Generate order notifications from sub-orders
            const orderNotifs = subOrders.map(subOrder => {
                let message = '';
                
                switch (subOrder.status) {
                    case 'pending':
                        message = `New order received! Total: ${subOrder.total} DA`;
                        break;
                    case 'confirmed':
                        message = `Order confirmed. Please prepare the items.`;
                        break;
                    case 'preparing':
                        message = `Order is being prepared.`;
                        break;
                    case 'ready':
                        message = `Order is ready for pickup.`;
                        break;
                    case 'completed':
                        message = `Order completed. Client picked up order.`;
                        break;
                    case 'cancelled':
                        message = `Order cancelled.`;
                        break;
                    default:
                        message = `Order status: ${subOrder.status}`;
                }
                
                // Get client info
                const clientDetails = subOrder.client_details || {};
                
                return {
                    type: 'order',
                    userName: `${clientDetails.first_name || ''} ${clientDetails.last_name || ''}`.trim() || 'Client',
                    userEmail: clientDetails.email || 'No email',
                    avatar: clientDetails.avatar || null,
                    message: message,
                    status: subOrder.status,
                    orderNumber: subOrder.sub_order_number,
                    total: subOrder.total,
                    time: subOrder.created_at
                };
            });
            
            // Sort by most recent first, prioritize pending
            orderNotifs.sort((a, b) => {
                if (a.status === 'pending' && b.status !== 'pending') return -1;
                if (b.status === 'pending' && a.status !== 'pending') return 1;
                return new Date(b.time) - new Date(a.time);
            });
            
            setNotifications(orderNotifs);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const orderNotifications = notifications.filter(n => n.type === 'order');
    const productNotifications = notifications.filter(n => n.type === 'product');

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
                    orders
                    {orderNotifications.length > 0 && (
                        <span style={{
                            marginLeft: '8px',
                            background: '#285153',
                            color: 'white',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '12px'
                        }}>
                            {orderNotifications.length}
                        </span>
                    )}
                </button>
                <button
                    className={`notification-tab ${activeTab === 'my-notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my-notifications')}
                >
                    my notifications
                </button>
            </div>

            <div className="notification-list">
                {activeTab === 'orders' ? (
                    orderNotifications.length > 0 ? (
                        orderNotifications.map((notification, index) => (
                            <div key={index} className="notification-card">
                                <div className="notification-header">
                                    <img
                                        src={notification.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'}
                                        alt={notification.userName}
                                        className="notification-avatar"
                                    />
                                    <div className="notification-user-info">
                                        <h4>{notification.userName}</h4>
                                        <p>{notification.userEmail}</p>
                                        {notification.orderNumber && (
                                            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                Order: {notification.orderNumber}
                                            </p>
                                        )}
                                    </div>
                                    {notification.status === 'pending' && (
                                        <span style={{
                                            marginLeft: 'auto',
                                            background: '#f39c12',
                                            color: 'white',
                                            padding: '4px 12px',
                                            borderRadius: '12px',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}>
                                            NEW
                                        </span>
                                    )}
                                </div>
                                <p className="notification-message">{notification.message}</p>
                                {notification.total && (
                                    <p style={{ 
                                        marginTop: '8px', 
                                        fontWeight: 'bold', 
                                        color: '#285153',
                                        fontSize: '16px'
                                    }}>
                                        Total: {notification.total.toFixed(2)} DA
                                    </p>
                                )}
                            </div>
                        ))
                    ) : (
                        <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>
                            No order notifications yet.
                        </p>
                    )
                ) : (
                    productNotifications.length > 0 ? (
                        productNotifications.map((notification, index) => (
                            <div key={index} className="notification-simple">
                                {notification.message}
                            </div>
                        ))
                    ) : (
                        <p style={{ color: '#888', textAlign: 'center', padding: '40px' }}>
                            No notifications yet.
                        </p>
                    )
                )}
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ProducerNotificationsPage;