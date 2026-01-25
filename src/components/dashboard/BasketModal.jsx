import { useState, useEffect } from 'react';
import { FiX, FiTrash2 } from 'react-icons/fi';
import basketService from '../../services/basketService';
import productService from '../../services/productService';
import { getImageUrl, getCategoryFallbackEmoji } from '../../utils/imageUtils';
import './css-weekly/BasketModal.css';

// Simple product item for basket (no Edit button, just quantity and remove)
const BasketProductItem = ({ product, quantity, onQuantityChange, onRemove }) => {
    const imageUrl = getImageUrl(product.photo_url);
    const categoryEmoji = getCategoryFallbackEmoji(product.product_type);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            marginBottom: '8px'
        }}>
            {/* Product Image */}
            <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0
            }}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={product.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <div style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#e8efef',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                    }}>
                        {categoryEmoji}
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div style={{ flex: 1 }}>
                <p style={{ fontWeight: '600', fontSize: '14px', margin: 0 }}>{product.name}</p>
                <p style={{ fontSize: '12px', color: '#666', margin: '2px 0 0 0' }}>
                    {product.price} DA / {product.sale_type === 'weight' ? 'kg' : 'unit'}
                </p>
            </div>

            {/* Quantity Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <label style={{ fontSize: '12px', color: '#666' }}>Qty:</label>
                <input
                    type="number"
                    value={quantity}
                    onChange={(e) => onQuantityChange(e.target.value)}
                    min="1"
                    style={{
                        width: '60px',
                        padding: '6px 8px',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '14px'
                    }}
                />
            </div>

            {/* Remove Button */}
            <button
                type="button"
                onClick={onRemove}
                style={{
                    background: '#fee2e2',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px',
                    cursor: 'pointer',
                    color: '#dc2626'
                }}
            >
                <FiTrash2 size={16} />
            </button>
        </div>
    );
};

function BasketModal({ isOpen, onClose, basket, onSave }) {
    const isEditMode = !!basket;

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        products: [],
        original_price: '',
        discount_percentage: '',
         pickup_day: 'Saturday'
    });

    const [availableProducts, setAvailableProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showProductSelector, setShowProductSelector] = useState(false);

    // Load producer's products
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const response = await productService.getMyProducts();
                setAvailableProducts(response.products || response || []);
            } catch (error) {
                console.error('Error loading products:', error);
            }
        };

        if (isOpen) {
            loadProducts();
        }
    }, [isOpen]);

    // Initialize form with basket data when editing
    useEffect(() => {
        if (basket) {
            setFormData({
                name: basket.name || '',
                description: basket.description || '',
                products: basket.products || [],
                original_price: basket.original_price || '',
                discount_percentage: basket.discount_percentage || '',
                pickup_day: basket.pickup_day || 'Saturday'
            });
        } else {
            setFormData({
                name: '',
                description: '',
                products: [],
                original_price: '',
                discount_percentage: '',
                pickup_day: 'Saturday'
            });
        }
    }, [basket, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddProduct = (product) => {
        setFormData(prev => ({
            ...prev,
            products: [...prev.products, { ...product, quantity: 1 }],
        }));
        setShowProductSelector(false);
    };

    const handleRemoveProduct = (productId) => {
        setFormData(prev => ({
            ...prev,
            products: prev.products.filter(p => p.id !== productId),
        }));
    };

    const handleQuantityChange = (productId, newQuantity) => {
        setFormData(prev => ({
            ...prev,
            products: prev.products.map(p =>
                p.id === productId ? { ...p, quantity: parseInt(newQuantity) || 1 } : p
            ),
        }));
    };

    const calculateOriginalPrice = () => {
        return formData.products.reduce((total, product) => {
            return total + (product.price * product.quantity);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Step 1: Create/Update the basket
            const basketData = {
                name: formData.name,
                description: formData.description,
                discount_percentage: parseFloat(formData.discount_percentage) || 0,
                original_price: parseFloat(formData.original_price) || calculateOriginalPrice(),
                pickup_day: formData.pickup_day,
            };

            let savedBasket;
            if (isEditMode) {
                const response = await basketService.updateBasket(basket.id, basketData);
                savedBasket = response.basket || response;
            } else {
                const response = await basketService.createBasket(basketData);
                savedBasket = response.basket || response;
            }

            // Step 2: Add products to the basket (if any)
            if (savedBasket && savedBasket.id && formData.products.length > 0) {
                // Remove all existing products first (for edit mode)
                if (isEditMode && basket.products) {
                    for (const product of basket.products) {
                        try {
                            await basketService.removeProductFromBasket(savedBasket.id, product.product_id || product.id);
                        } catch (err) {
                            console.error('Error removing product:', err);
                        }
                    }
                }

                // Add all current products
                for (const product of formData.products) {
                    try {
                        await basketService.addProductToBasket(
                            savedBasket.id,
                            product.id,
                            product.quantity
                        );
                    } catch (err) {
                        console.error('Error adding product to basket:', err);
                        throw err; // Re-throw to catch in outer try-catch
                    }
                }
            }

            // Step 3: Close modal and trigger refresh
            onClose();
            await onSave(); // Just refresh, don't pass basketData
            
        } catch (error) {
            console.error('Error saving basket:', error);
            throw error; // Let parent handle the toast
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Filter out already added products
    const addedProductIds = formData.products.map(p => p.id);
    const productsToAdd = availableProducts.filter(p => !addedProductIds.includes(p.id));

    const calculatedPrice = calculateOriginalPrice();
    const discountedPrice = calculatedPrice - (calculatedPrice * (formData.discount_percentage / 100));

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose}>
                    <FiX />
                </button>

                <form onSubmit={handleSubmit} className="basket-form">
                    <h2 className="modal-title">{isEditMode ? 'Edit Basket' : 'Create New Basket'}</h2>

                    {/* Basket Name */}
                    <div className="form-group">
                        <label className="form-label">BASKET NAME *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="e.g., Summer Vegetables Box"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">DESCRIPTION</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="Describe what's in this basket..."
                            rows="3"
                        />
                    </div>

                    {/* Add Products Section */}
                    <div className="form-group">
                        <button
                            type="button"
                            className="add-products-btn"
                            onClick={() => setShowProductSelector(!showProductSelector)}
                        >
                            + ADD PRODUCTS
                        </button>

                        {/* Product Selector Dropdown */}
                        {showProductSelector && (
                            <div className="product-selector">
                                {productsToAdd.length === 0 ? (
                                    <p className="no-products-msg">No more products to add</p>
                                ) : (
                                    productsToAdd.map(product => {
                                        const imageUrl = getImageUrl(product.photo_url);
                                        const categoryEmoji = getCategoryFallbackEmoji(product.product_type);

                                        return (
                                            <div
                                                key={product.id}
                                                className="product-selector-item"
                                                onClick={() => handleAddProduct(product)}
                                            >
                                                {imageUrl ? (
                                                    <img
                                                        src={imageUrl}
                                                        alt={product.name}
                                                        className="product-selector-image"
                                                    />
                                                ) : (
                                                    <div className="product-selector-image" style={{ background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                                                        {categoryEmoji}
                                                    </div>
                                                )}
                                                <div className="product-selector-info">
                                                    <span className="product-selector-name">{product.name}</span>
                                                    <span className="product-selector-price">{product.price} DA/{product.sale_type === 'weight' ? 'kg' : 'unit'}</span>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}

                        {/* Products List */}
                        <div className="products-container">
                            {formData.products.length === 0 ? (
                                <p className="no-products-msg">No products added yet</p>
                            ) : (
                                formData.products.map(product => (
                                    <BasketProductItem
                                        key={product.id}
                                        product={product}
                                        quantity={product.quantity}
                                        onQuantityChange={(qty) => handleQuantityChange(product.id, qty)}
                                        onRemove={() => handleRemoveProduct(product.id)}
                                    />
                                ))
                            )}
                        </div>
                    </div>

                    {/* Price Calculation */}
                    {formData.products.length > 0 && (
                        <div className="price-summary">
                            <div className="price-row">
                                <span>Calculated Total:</span>
                                <span>{calculatedPrice.toFixed(2)} DA</span>
                            </div>
                        </div>
                    )}

                    {/* Original Price Override */}
                    <div className="form-group">
                        <label className="form-label">ORIGINAL PRICE (DA) *</label>
                        <input
                            type="number"
                            name="original_price"
                            value={formData.original_price}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder={calculatedPrice > 0 ? calculatedPrice.toFixed(2) : "0"}
                            min="0"
                            step="0.01"
                        />
                        <small className="form-hint">Auto-calculated: {calculatedPrice.toFixed(2)} DA</small>
                    </div>

                    {/* Discount */}
                    <div className="form-group">
                        <label className="form-label">DISCOUNT % *</label>
                        <input
                            type="number"
                            name="discount_percentage"
                            value={formData.discount_percentage}
                            onChange={handleInputChange}
                            className="form-input"
                            placeholder="e.g., 10"
                            min="0"
                            max="100"
                            required
                        />
                        {formData.discount_percentage > 0 && (
                            <small className="form-hint">
                                Final Price: {discountedPrice.toFixed(2)} DA (Save {(calculatedPrice - discountedPrice).toFixed(2)} DA)
                            </small>
                        )}
                    </div>
                    <div className="form-group">
  <label className="form-label">
    Pickup Day <span className="required">*</span>
  </label>
  <select
    name="pickup_day"
    value={formData.pickup_day}
    onChange={handleInputChange}
    required
    className="form-input"
  >
    <option value="Monday">Monday</option>
    <option value="Tuesday">Tuesday</option>
    <option value="Wednesday">Wednesday</option>
    <option value="Thursday">Thursday</option>
    <option value="Friday">Friday</option>
    <option value="Saturday">Saturday</option>
    <option value="Sunday">Sunday</option>
  </select>
  <p className="form-hint">Which day of the week is this basket available for pickup?</p>
</div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading || !formData.name || !formData.discount_percentage}
                    >
                        {loading ? 'Saving...' : (isEditMode ? 'UPDATE BASKET' : 'CREATE BASKET')}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default BasketModal;