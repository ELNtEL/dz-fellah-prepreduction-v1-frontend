import React from 'react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    const lineTotal = item.price * item.quantity;

    return (
        <div className="cart-item">
            <img
                src={item.image || 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=100&h=100&fit=crop'}
                alt={item.name}
                className="cart-item-image"
            />

            <div className="cart-item-details">
                <h4 className="cart-item-name">{item.name}</h4>
                <p className="cart-item-farm">{item.farm}</p>
                <p className="cart-item-price">{item.price}Da/{item.unit}</p>
            </div>

            <div className="cart-item-quantity">
                <button
                    className="qty-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                >
                    −
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button
                    className="qty-btn"
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                    +
                </button>
            </div>

            <div className="cart-item-total">
                <span>{lineTotal.toLocaleString()}Da</span>
            </div>

            <button className="cart-item-remove" onClick={() => onRemove(item.id)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <polyline points="3,6 5,6 21,6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
            </button>
        </div>
    );
};

export default CartItem;
