import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const ProducerNotificationsPage = () => {
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
                    phone: clientDetails.phone || null,  // ✅ ADD PHONE
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

    if (loading) {
        return (
            <div className="notifications-page">
                <h1 className="notifications-title">Order Notifications</h1>
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
            <h1 className="notifications-title">
                Order Notifications
                {notifications.length > 0 && (
                    <span style={{
                        marginLeft: '12px',
                        background: '#285153',
                        color: 'white',
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '16px',
                        fontWeight: 'normal'
                    }}>
                        {notifications.length}
                    </span>
                )}
            </h1>

            <div className="notification-list">
                {notifications.length > 0 ? (
                    notifications.map((notification, index) => {
                        const firstName = notification.userName.split(' ')[0] || 'C';
                        
                        return (
                            <div key={index} className="notification-card">
                                <div className="notification-header">
                                    {/* Avatar with fallback */}
                                    {notification.avatar ? (
                                        <img
                                            src={notification.avatar}
                                            alt={notification.userName}
                                            className="notification-avatar"
                                        />
                                    ) : (
                                        <div 
                                            className="notification-avatar"
                                            style={{
                                                backgroundColor: '#1a3839',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '18px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            {firstName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    
                                    <div className="notification-user-info">
                                        <h4>{notification.userName}</h4>
                                        <p>{notification.userEmail}</p>
                                        {/* ✅ Phone Number Display */}
                                        {notification.phone && (
                                            <p style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                                                📞 {notification.phone}
                                            </p>
                                        )}
                                        {notification.orderNumber && (
                                            <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                                📦 Order: {notification.orderNumber}
                                            </p>
                                        )}
                                    </div>
                                    
                                    {notification.status === 'pending' && (
                                        <span style={{
                                            marginLeft: 'auto',
                                            background: '#f39c12',
                                            color: 'white',
                                            padding: '6px 14px',
                                            borderRadius: '16px',
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
                        );
                    })
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
                            strokeWidth="2" 
                            width="60" 
                            height="60"
                            style={{ margin: '0 auto 20px', color: '#ddd' }}
                        >
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '8px' }}>
                            No order notifications yet
                        </h3>
                        <p style={{ fontSize: '14px' }}>
                            You'll see new orders from your customers here
                        </p>
                    </div>
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