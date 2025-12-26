import React from 'react';

// Helper function to build full image URL
const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    return `http://localhost:8000/media/${path}`;
};

// Category fallback for products
const getCategoryFallbackImage = (category) => {
    const fallbacks = {
        'Vegetables': '🥬',
        'Fruits': '🍎',
        'Dairy': '🥛',
        'Oils': '🫒',
        'Honey': '🍯',
        'Grains': '🌾',
        'Meat': '🥩',
        'Other': '📦'
    };
    return fallbacks[category] || '📦';
};

const ProductCard = ({ product, onEdit, onDelete }) => {
    const imageUrl = getImageUrl(product.photo_url || product.image);
    
    return (
        <div className="product-card">
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="product-image"
                />
            ) : (
                <div className="product-image" style={{
                    backgroundColor: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '64px'
                }}>
                    {getCategoryFallbackImage(product.product_type)}
                </div>
            )}

            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-farm">{product.farm}</p>
                <p className="product-price">price: {product.price}Da/{product.unit}</p>
            </div>

            <div className="product-actions">
                <button className="btn-edit" onClick={() => onEdit(product)}>
                    Edit
                </button>
                <button className="btn-delete" onClick={() => onDelete(product.id)}>
                    Delete
                </button>
            </div>
        </div>
    );
};

export default ProductCard;