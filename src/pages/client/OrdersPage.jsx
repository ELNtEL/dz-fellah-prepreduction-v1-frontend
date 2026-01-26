import React, { useState, useEffect } from 'react';
import OrderCard from '../../components/dashboard/OrderCard';
import DeleteConfirmationModal from '../../components/dashboard/DeleteConfirmationModal';
import Toast from '../../components/Toast';
import orderService from '../../services/orderService';

const OrdersPage = () => {
    const [activeTab, setActiveTab] = useState('active');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingOrder, setDeletingOrder] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await orderService.getMyOrders();
            setOrders(data.orders || []);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError('Failed to load orders. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = (orderId) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            setDeletingOrder(order);
        }
    };

    const confirmDelete = async () => {
        try {
            await orderService.deleteFromHistory(deletingOrder.id);
            setOrders(prev => prev.filter(o => o.id !== deletingOrder.id));
            setToast({ message: 'Order removed from history', type: 'success' });
        } catch (err) {
            console.error('Failed to delete order:', err);
            setToast({ message: 'Failed to remove order from history', type: 'error' });
        } finally {
            setDeletingOrder(null);
        }
    };

    const activeOrders = orders?.filter(o => 
        o.status === 'pending' || 
        o.status === 'confirmed' || 
        o.status === 'preparing' || 
        o.status === 'ready'
    ) || [];

    const completedOrders = orders?.filter(o => 
        o.status === 'completed' || 
        o.status === 'cancelled'
    ) || [];

    if (loading) {
        return (
            <div className="orders-page">
                <h1 className="orders-title">My Orders</h1>
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
                <h1 className="orders-title">My Orders</h1>
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
        <>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {deletingOrder && (
                <DeleteConfirmationModal
                    productName={`Order #${deletingOrder.order_number || deletingOrder.id}`}
                    title="Remove from history?"
                    confirmText="Yes, Remove"
                    message={<>Are you sure you want to remove <strong>Order #{deletingOrder.order_number || deletingOrder.id}</strong> from your history? This action cannot be undone.</>}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeletingOrder(null)}
                />
            )}

            <div className="orders-page">
                <h1 className="orders-title">My Orders</h1>

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
                                <OrderCard key={order.id} order={order} />
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
                                <p>You don't have any orders in progress.</p>
                            </div>
                        )
                    ) : (
                        completedOrders.length > 0 ? (
                            completedOrders.map(order => (
                                <OrderCard
                                    key={order.id}
                                    order={order}
                                    showRating={true}
                                    showDeleteButton={true}
                                    onDelete={handleDeleteOrder}
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
        </>
    );
};

export default OrdersPage;