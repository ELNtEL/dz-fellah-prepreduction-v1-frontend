import { useState, useEffect } from 'react';
import ClientBasketCard from '../../components/dashboard/ClientBasketCard';
import SubscriptionDetailModal from '../../components/dashboard/SubscriptionDetailModal';
import DeleteConfirmationModal from '../../components/dashboard/DeleteConfirmationModal';
import Toast from '../../components/Toast';
import subscriptionService from '../../services/subscriptionService';
import '../../components/dashboard/css-weekly/ClientWeeklyBasketPage.css';

function ClientWeeklyBasketPage() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBasket, setSelectedBasket] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cancellingSubscription, setCancellingSubscription] = useState(null);
    const [toast, setToast] = useState(null);
    const [showCancelled, setShowCancelled] = useState(false); // ✅ ADD THIS

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const response = await subscriptionService.getMySubscriptions();
            console.log('📦 Subscription response:', response);
            setSubscriptions(response?.subscriptions || response || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch subscriptions:', err);
            setError('Failed to load your subscriptions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (subscriptionId) => {
        const subscription = subscriptions.find(s => s.id === subscriptionId);
        if (subscription) {
            setSelectedBasket({
                id: subscription.basket_id,
                name: subscription.basket_name,
                description: subscription.basket_description,
                producer_banner: subscription.producer_banner,
                discount_percentage: subscription.discount_percentage,
                original_price: subscription.original_price,
                discounted_price: subscription.discounted_price,
                product_count: subscription.product_count,
                producer_shop_name: subscription.shop_name,
                producer_id: subscription.producer_id,
                delivery_frequency: subscription.delivery_frequency,
                pickup_day: subscription.pickup_day
            });
            setIsModalOpen(true);
        }
    };

    const handlePauseSubscription = async (subscriptionId) => {
        try {
            await subscriptionService.pauseSubscription(subscriptionId);
            await fetchSubscriptions();
            showToast('Subscription paused successfully', 'success');
        } catch (err) {
            console.error('Failed to pause subscription:', err);
            showToast('Failed to pause subscription', 'error');
        }
    };

    const handleCancelSubscription = (subscriptionId) => {
        const subscription = subscriptions.find(s => s.id === subscriptionId);
        if (subscription) {
            setCancellingSubscription(subscription);
        }
    };

    const confirmCancel = async () => {
        try {
            await subscriptionService.cancelSubscription(cancellingSubscription.id);
            await fetchSubscriptions();
            showToast('Subscription cancelled successfully', 'success');
        } catch (err) {
            console.error('Failed to cancel subscription:', err);
            showToast('Failed to cancel subscription', 'error');
        } finally {
            setCancellingSubscription(null);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBasket(null);
    };

    // ✅ SEPARATE ACTIVE AND CANCELLED SUBSCRIPTIONS
    const activeSubscriptions = subscriptions.filter(s => s.status !== 'cancelled');
    const cancelledSubscriptions = subscriptions.filter(s => s.status === 'cancelled');

    return (
        <>
            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {cancellingSubscription && (
                <DeleteConfirmationModal
                    productName={`${cancellingSubscription.basket_name} subscription`}
                    onConfirm={confirmCancel}
                    onCancel={() => setCancellingSubscription(null)}
                />
            )}

            <div className="dashboard-header">
                <h1>My Weekly Subscriptions</h1>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your subscriptions...</p>
                </div>
            ) : (
                <>
                    {/* ✅ ACTIVE SUBSCRIPTIONS SECTION */}
                    <div className="subscriptions-section">
                        <h2 style={{ 
                            fontSize: '20px', 
                            fontWeight: '600', 
                            color: '#285153',
                            marginBottom: '16px'
                        }}>
                            Active Subscriptions ({activeSubscriptions.length})
                        </h2>
                        
                        <div className="baskets-grid">
                            {activeSubscriptions.length === 0 ? (
                                <div className="empty-state">
                                    <p>You don't have any active subscriptions yet.</p>
                                    <p>Browse available baskets to subscribe!</p>
                                </div>
                            ) : (
                                activeSubscriptions.map((subscription) => (
                                    <ClientBasketCard
                                        key={subscription.id}
                                        basket={{
                                            id: subscription.basket_id,
                                            name: subscription.basket_name,
                                            description: subscription.basket_description,
                                            producer_banner: subscription.producer_banner,
                                            discount_percentage: subscription.discount_percentage,
                                            original_price: subscription.original_price,
                                            discounted_price: subscription.discounted_price,
                                            product_count: subscription.product_count,
                                            producer_shop_name: subscription.shop_name,
                                            pickup_day: subscription.pickup_day
                                        }}
                                        subscription={subscription}
                                        onPause={() => handlePauseSubscription(subscription.id)}
                                        onCancel={() => handleCancelSubscription(subscription.id)}
                                        onViewDetails={() => handleViewDetails(subscription.id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* ✅ CANCELLED SUBSCRIPTIONS SECTION (COLLAPSIBLE) */}
                    {cancelledSubscriptions.length > 0 && (
                        <div className="subscriptions-section" style={{ marginTop: '40px' }}>
                            <button
                                onClick={() => setShowCancelled(!showCancelled)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: '#666',
                                    cursor: 'pointer',
                                    marginBottom: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <span>{showCancelled ? '▼' : '▶'}</span>
                                Cancelled Subscriptions ({cancelledSubscriptions.length})
                            </button>
                            
                            {showCancelled && (
                                <div className="baskets-grid" style={{ opacity: '0.7' }}>
                                    {cancelledSubscriptions.map((subscription) => (
                                        <ClientBasketCard
                                            key={subscription.id}
                                            basket={{
                                                id: subscription.basket_id,
                                                name: subscription.basket_name,
                                                description: subscription.basket_description,
                                                producer_banner: subscription.producer_banner,
                                                discount_percentage: subscription.discount_percentage,
                                                original_price: subscription.original_price,
                                                discounted_price: subscription.discounted_price,
                                                product_count: subscription.product_count,
                                                producer_shop_name: subscription.shop_name,
                                                pickup_day: subscription.pickup_day
                                            }}
                                            subscription={subscription}
                                            onViewDetails={() => handleViewDetails(subscription.id)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            <SubscriptionDetailModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                basket={selectedBasket}
            />
        </>
    );
}

export default ClientWeeklyBasketPage;