import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartItem from '../../components/dashboard/CartItem';
import DeliveryMethodModal from '../../components/dashboard/DeliveryMethodModal';
import Toast from '../../components/Toast';
import cartService from '../../services/cartService';
import orderService from '../../services/orderService';

const CartPage = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        fetchCart();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchCart = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await cartService.getMyCart();
            const cartData = response.cart || response;
            const items = cartData.items || [];
            
            const transformedItems = items.map(item => ({
                id: item.id,
                productId: item.product_id,
                name: item.product_details?.name || 'Unknown Product',
                farm: item.product_details?.producer?.shop_name || 'Unknown Farm',
                price: parseFloat(item.price_snapshot || 0),
                quantity: parseFloat(item.quantity || 1),
                unit: item.product_details?.sale_type || 'unit',
                image: item.product_details?.photo_url || null,
            }));
            
            setCartItems(transformedItems);
        } catch (err) {
            console.error('Failed to fetch cart:', err);
            setError('Failed to load cart. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        try {
            await cartService.updateItem(itemId, newQuantity);
            setCartItems(prev => 
                prev.map(item => 
                    item.id === itemId ? { ...item, quantity: newQuantity } : item
                )
            );
            showToast('Quantity updated', 'success');
        } catch (err) {
            console.error('Failed to update quantity:', err);
            showToast('Failed to update quantity', 'error');
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await cartService.removeItem(itemId);
            setCartItems(prev => prev.filter(item => item.id !== itemId));
            showToast('Item removed from cart', 'success');
        } catch (err) {
            console.error('Failed to remove item:', err);
            showToast('Failed to remove item', 'error');
        }
    };

    const handleOrderNowClick = () => {
        if (cartItems.length === 0) {
            showToast('Your cart is empty', 'warning');
            return;
        }

        // Check if user is logged in
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            showToast('Please login to place an order', 'warning');
            navigate('/login');
            return;
        }

        // Show delivery method modal
        setShowDeliveryModal(true);
    };

    const handleDeliveryMethodConfirm = async (deliveryData) => {
        setShowDeliveryModal(false);
        setCheckoutLoading(true);

        try {
            // Step 1: Validate cart
            const validation = await cartService.validateCart();
            
            if (!validation.valid) {
                const errors = validation.errors.map(e => 
                    `${e.product_name}: ${e.error}`
                ).join('\n');
                showToast(`Cannot place order: ${errors}`, 'error');
                setCheckoutLoading(false);
                return;
            }

            // Show warnings if any
            if (validation.warnings && validation.warnings.length > 0) {
                const warnings = validation.warnings.map(w => 
                    `${w.product_name}: Price changed from ${w.old_price} DA to ${w.new_price} DA`
                ).join('\n');
                const confirmWithWarnings = window.confirm(
                    `Notice:\n\n${warnings}\n\nDo you want to continue?`
                );
                if (!confirmWithWarnings) {
                    setCheckoutLoading(false);
                    return;
                }
            }

            // Step 2: Create order from cart
            const orderData = {
                delivery_method: deliveryData.delivery_method,
                delivery_address: deliveryData.delivery_address,
                notes: ''
            };

            const orderResponse = await orderService.createOrderFromCart(orderData);
            const order = orderResponse.order;

            // Step 3: Show success message
            showToast(
                `Order #${order.order_number} placed successfully! Total: ${order.total_amount} DA`,
                'success'
            );

            // Step 4: Navigate to orders page
            setTimeout(() => {
                navigate('/client/orders');
            }, 1500);

        } catch (err) {
            console.error('Checkout failed:', err);
            
            let errorMessage = 'Failed to place order';
            if (err.response?.data?.error) {
                errorMessage = err.response.data.error;
            } else if (err.response?.data?.errors) {
                errorMessage = err.response.data.errors.map(e => e.error).join(', ');
            }
            
            showToast(errorMessage, 'error');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const handleDeliveryMethodCancel = () => {
        setShowDeliveryModal(false);
    };

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = cartItems.length > 0 ? 500 : 0;
    const total = subtotal + deliveryFee;

    if (loading) {
        return (
            <div className="cart-page">
                <h1 className="cart-title">Shopping Cart</h1>
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
                    <p style={{ marginTop: '20px', color: '#666' }}>Loading cart...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="cart-page">
                <h1 className="cart-title">Shopping Cart</h1>
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#d32f2f' }}>
                    <p>{error}</p>
                    <button 
                        onClick={fetchCart}
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
        <div className="cart-page">
            {/* Toast Notifications */}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}

            {/* Delivery Method Modal */}
            {showDeliveryModal && (
                <DeliveryMethodModal
                    onConfirm={handleDeliveryMethodConfirm}
                    onCancel={handleDeliveryMethodCancel}
                />
            )}

            <h1 className="cart-title">Shopping Cart ({cartItems.length} items)</h1>

            {cartItems.length > 0 ? (
                <div className="cart-container">
                    <div className="cart-items-section">
                        <div className="cart-items-header">
                            <span>Product</span>
                            <span>Details</span>
                            <span>Quantity</span>
                            <span>Total</span>
                            <span></span>
                        </div>
                        <div className="cart-items-list">
                            {cartItems.map(item => (
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemove={handleRemoveItem}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="cart-summary">
                        <h3 className="summary-title">Order Summary</h3>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>{subtotal.toFixed(2)} DA</span>
                        </div>

                        <div className="summary-row">
                            <span>Delivery Fee</span>
                            <span>{deliveryFee.toFixed(2)} DA</span>
                        </div>

                        <div className="summary-divider"></div>

                        <div className="summary-row summary-total">
                            <span>Total</span>
                            <span>{total.toFixed(2)} DA</span>
                        </div>

                        <button 
                            className="btn-checkout" 
                            onClick={handleOrderNowClick}
                            disabled={checkoutLoading}
                        >
                            {checkoutLoading ? 'Processing...' : 'Order Now'}
                        </button>

                        <p className="cart-note">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="16" x2="12" y2="12" />
                                <line x1="12" y1="8" x2="12.01" y2="8" />
                            </svg>
                            Choose your delivery method at checkout
                        </p>
                    </div>
                </div>
            ) : (
                <div className="empty-cart">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="80" height="80">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    <h3>Your cart is empty</h3>
                    <p>Start shopping to add products to your cart!</p>
                    <button 
                        onClick={() => navigate('/products')}
                        style={{
                            marginTop: '20px',
                            padding: '12px 24px',
                            backgroundColor: '#285153',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        Browse Products
                    </button>
                </div>
            )}

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default CartPage;