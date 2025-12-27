import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Toast from '../../components/Toast';

const ProducerOrdersPage = () => {
    const [activeTab, setActiveTab] = useState('active');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await api.get('/producer-orders/my_orders/');
            setOrders(response.sub_orders || []);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`/producer-orders/${orderId}/update_status/`, {
                status: newStatus
            });
            
            await fetchOrders();
            
            const statusMessages = {
                'confirmed': 'Order has been confirmed',
                'preparing': 'Order preparation has started',
                'ready': 'Order is ready for pickup',
                'completed': 'Order has been completed',
                'cancelled': 'Order has been cancelled'
            };
            
            showToast(statusMessages[newStatus] || `Order status updated to ${newStatus}`, 'success');
        } catch (err) {
            console.error('Failed to update status:', err);
            showToast('Failed to update order status. Please try again.', 'error');
        }
    };

    const activeOrders = orders.filter(o => 
        o.status === 'pending' || 
        o.status === 'confirmed' || 
        o.status === 'preparing' || 
        o.status === 'ready'
    );
    
    const completedOrders = orders.filter(o => 
        o.status === 'completed' || 
        o.status === 'cancelled'
    );

    if (loading) {
        return (
            <div className="orders-page">
                <h1 className="orders-title">Incoming Orders</h1>
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
                    <p style={{ marginTop: '20px', color: '#666' }}>Loading orders...</p>
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

    if (error) {
        return (
            <div className="orders-page">
                <h1 className="orders-title">Incoming Orders</h1>
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#d32f2f' }}>
                    <p>{error}</p>
                    <button 
                        onClick={fetchOrders}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: '#285153',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <h1 className="orders-title">Incoming Orders</h1>

            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}

            <div className="orders-tabs">
                <button
                    className={`order-tab ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active Orders
                    {activeOrders.length > 0 && (
                        <span className="tab-badge">{activeOrders.length}</span>
                    )}
                </button>
                <button
                    className={`order-tab ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    Order History
                </button>
            </div>

            <div className="orders-list">
                {activeTab === 'active' ? (
                    activeOrders.length > 0 ? (
                        activeOrders.map(order => (
                            <ProducerOrderCard 
                                key={order.id} 
                                order={order} 
                                onUpdateStatus={handleUpdateStatus}
                            />
                        ))
                    ) : (
                        <div className="empty-orders">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="60" height="60">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14,2 14,8 20,8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                            </svg>
                            <h3>No active orders</h3>
                            <p>No orders to process right now.</p>
                        </div>
                    )
                ) : (
                    completedOrders.length > 0 ? (
                        completedOrders.map(order => (
                            <ProducerOrderCard 
                                key={order.id} 
                                order={order} 
                                onUpdateStatus={handleUpdateStatus}
                            />
                        ))
                    ) : (
                        <div className="empty-orders">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="60" height="60">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14,2 14,8 20,8" />
                            </svg>
                            <h3>No order history</h3>
                            <p>Your completed orders will appear here.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

// Producer Order Card Component  
const ProducerOrderCard = ({ order, onUpdateStatus }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return '#f39c12';
            case 'confirmed': return '#9b59b6';
            case 'preparing': return '#3498db';
            case 'ready': return '#2ecc71';
            case 'completed': return '#27ae60';
            case 'cancelled': return '#e74c3c';
            default: return '#95a5a6';
        }
    };

    const getNextAction = (status) => {
        switch (status) {
            case 'pending': return { label: 'Confirm Order', nextStatus: 'confirmed' };
            case 'confirmed': return { label: 'Start Preparing', nextStatus: 'preparing' };
            case 'preparing': return { label: 'Mark as Ready', nextStatus: 'ready' };
            case 'ready': return { label: 'Complete Order', nextStatus: 'completed' };
            default: return null;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const nextAction = getNextAction(order.status);
    const clientDetails = order.client_details || {};
    
    // ✅ Get client name and first initial for avatar
    const clientName = `${clientDetails.first_name || ''} ${clientDetails.last_name || ''}`.trim() || 'Client';
    const firstName = clientDetails.first_name || 'C';

    return (
        <div className="order-card" style={{ marginBottom: '20px', padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 'bold', color: '#285153' }}>
                        Order #{order.sub_order_number}
                    </h3>
                    <p style={{ margin: '0 0 12px 0', color: '#888', fontSize: '13px' }}>
                        {formatDate(order.created_at)}
                    </p>
                    
                    {/* ✅ Client Info with Avatar */}
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        padding: '12px',
                        backgroundColor: '#f9f9f9',
                        borderRadius: '8px',
                        marginTop: '12px'
                    }}>
                        {/* Avatar */}
                        {clientDetails.avatar ? (
                            <img
                                src={clientDetails.avatar}
                                alt={clientName}
                                style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    flexShrink: 0
                                }}
                            />
                        ) : (
                            <div style={{
                                width: '45px',
                                height: '45px',
                                borderRadius: '50%',
                                backgroundColor: '#1a3839',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '18px',
                                fontWeight: 'bold',
                                flexShrink: 0
                            }}>
                                {firstName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        
                        {/* Client Details */}
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: '0', fontWeight: '600', fontSize: '15px', color: '#333' }}>
                                {clientName}
                            </p>
                            {clientDetails.email && (
                                <p style={{ margin: '2px 0 0 0', color: '#666', fontSize: '13px' }}>
                                    ✉️ {clientDetails.email}
                                </p>
                            )}
                            {clientDetails.phone && (
                                <p style={{ margin: '2px 0 0 0', color: '#666', fontSize: '13px' }}>
                                    📞 {clientDetails.phone}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Status Badge */}
                <div>
                    <span style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: getStatusColor(order.status),
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {order.status}
                    </span>
                </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: '#285153' }}>
                    Order Items:
                </h4>
                {(order.items || []).map((item, idx) => (
                    <div key={idx} style={{ 
                        padding: '12px 0', 
                        borderBottom: idx < order.items.length - 1 ? '1px solid #eee' : 'none' 
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ fontWeight: '600', fontSize: '15px' }}>{item.product_name}</span>
                                <div style={{ fontSize: '13px', color: '#888', marginTop: '4px' }}>
                                    {item.unit_price} DA × {item.quantity_ordered} {item.sale_type === 'weight' ? 'kg' : 'units'}
                                </div>
                            </div>
                            <span style={{ fontWeight: 'bold', color: '#285153', fontSize: '16px' }}>
                                {(item.subtotal || 0).toFixed(2)} DA
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div style={{ marginBottom: '16px', paddingTop: '12px', borderTop: '2px solid #285153' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                    <span>Total:</span>
                    <span style={{ color: '#285153' }}>{(order.total || 0).toFixed(2)} DA</span>
                </div>
            </div>

            {/* Delivery Info */}
            {order.parent_order_details?.delivery_method && (
                <div style={{ 
                    padding: '12px', 
                    backgroundColor: '#e8f5e9', 
                    borderRadius: '8px',
                    marginBottom: '12px',
                    fontSize: '13px',
                    borderLeft: '4px solid #4caf50'
                }}>
                    <strong>📦 Delivery:</strong> {
                        order.parent_order_details.delivery_method === 'pickup_producer' 
                            ? 'Client will pickup at your farm' 
                            : `Delivery to ${order.parent_order_details.delivery_address || 'client address'}`
                    }
                </div>
            )}

            {/* Producer Notes */}
            {order.producer_notes && (
                <div style={{ 
                    marginBottom: '12px', 
                    padding: '12px', 
                    backgroundColor: '#fff8e1', 
                    borderRadius: '8px', 
                    borderLeft: '4px solid #ffa726' 
                }}>
                    <strong style={{ fontSize: '13px', color: '#666' }}>📝 Your Notes:</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>{order.producer_notes}</p>
                </div>
            )}

            {/* Actions */}
            {nextAction && (
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={() => onUpdateStatus(order.id, nextAction.nextStatus)}
                        style={{
                            flex: 1,
                            padding: '14px',
                            backgroundColor: '#285153',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#1a3839';
                            e.target.style.transform = 'translateY(-2px)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#285153';
                            e.target.style.transform = 'translateY(0)';
                        }}
                    >
                        {nextAction.label}
                    </button>
                    {order.status === 'pending' && (
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to cancel this order?')) {
                                    onUpdateStatus(order.id, 'cancelled');
                                }
                            }}
                            style={{
                                padding: '14px 24px',
                                backgroundColor: '#e74c3c',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: 'bold',
                                fontSize: '14px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.backgroundColor = '#c0392b';
                                e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.backgroundColor = '#e74c3c';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            Cancel Order
                        </button>
                    )}
                </div>
            )}

            {/* Completed/Cancelled status message */}
            {(order.status === 'completed' || order.status === 'cancelled') && (
                <div style={{ 
                    marginTop: '12px',
                    padding: '14px', 
                    backgroundColor: order.status === 'completed' ? '#d4edda' : '#f8d7da',
                    color: order.status === 'completed' ? '#155724' : '#721c24',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px'
                }}>
                    {order.status === 'completed' ? '✓ Order Completed' : '✕ Order Cancelled'}
                </div>
            )}
        </div>
    );
};

export default ProducerOrdersPage;