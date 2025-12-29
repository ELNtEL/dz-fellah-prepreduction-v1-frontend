import React, { useState, useEffect } from 'react';
import UploadBox from './UploadBox';

const ProductModal = ({ product, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        harvest_date: '',
        sale_type: 'unit',
        product_type: 'Vegetables',
        stock: 100,
        description: '',
        photo_url: '',
        is_anti_gaspi: false
    });

    // Perishable product types that can be anti-gaspi
    const PERISHABLE_TYPES = ['Vegetables', 'Fruits', 'Dairy', 'Meat'];

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                price: product.price || '',
                harvest_date: product.harvest_date || '',
                sale_type: product.sale_type || 'unit',
                product_type: product.product_type || 'Vegetables',
                stock: product.stock || 100,
                description: product.description || '',
                photo_url: product.photo_url || '',
                is_anti_gaspi: product.is_anti_gaspi || false
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProductTypeChange = (e) => {
        const newProductType = e.target.value;
        
        // If changing to non-perishable type, disable anti-gaspi
        if (!PERISHABLE_TYPES.includes(newProductType)) {
            setFormData(prev => ({ 
                ...prev, 
                product_type: newProductType,
                is_anti_gaspi: false  // Auto-disable anti-gaspi
            }));
        } else {
            setFormData(prev => ({ 
                ...prev, 
                product_type: newProductType
            }));
        }
    };
const handleImageUpload = (file) => {
    if (!file) {
        console.error('❌ No file provided!');
        return;
    }
    
    // Compress and convert to base64
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
        // Resize to max 800x800 while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        const maxSize = 800;
        
        if (width > height) {
            if (width > maxSize) {
                height = (height * maxSize) / width;
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = (width * maxSize) / height;
                height = maxSize;
            }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with compression (0.7 quality)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        console.log('✅ Product image compressed, length:', compressedBase64.length);
        
        setFormData(prev => ({ ...prev, photo_url: compressedBase64 }));
    };
    
    img.onerror = (error) => {
        console.error('❌ Image load error:', error);
    };
    
    img.src = URL.createObjectURL(file);
};

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const productData = {
            name: formData.name,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            sale_type: formData.sale_type,
            product_type: formData.product_type,
            description: formData.description || '',
            photo_url: formData.photo_url || '',
            harvest_date: formData.harvest_date || null,
            is_anti_gaspi: formData.is_anti_gaspi
        };
        
        onSave(productData);
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const isPerishable = PERISHABLE_TYPES.includes(formData.product_type);

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                <div className="modal-body">
                    <form className="modal-form" onSubmit={handleSubmit}>
                        <UploadBox
                            title="Upload product photo"
                            preview={formData.photo_url}
                            onFileSelect={handleImageUpload}
                        />

                        <div className="form-group" style={{ marginTop: '25px' }}>
                            <label className="form-label">Product name</label>
                            <input
                                type="text"
                                name="name"
                                className="form-input"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Product price (DZD)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="price"
                                className="form-input"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Stock quantity</label>
                            <input
                                type="number"
                                name="stock"
                                className="form-input"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Harvest date</label>
                            <input
                                type="date"
                                name="harvest_date"
                                className="form-input"
                                value={formData.harvest_date}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Unit of sale</label>
                            <div className="radio-group">
                                <label className="radio-item">
                                    <input
                                        type="radio"
                                        name="sale_type"
                                        value="unit"
                                        checked={formData.sale_type === 'unit'}
                                        onChange={handleChange}
                                    />
                                    Unit (per piece)
                                </label>
                                <label className="radio-item">
                                    <input
                                        type="radio"
                                        name="sale_type"
                                        value="weight"
                                        checked={formData.sale_type === 'weight'}
                                        onChange={handleChange}
                                    />
                                    Weight (Kg)
                                </label>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Product Category</label>
                            <select
                                name="product_type"
                                className="form-input"
                                value={formData.product_type}
                                onChange={handleProductTypeChange}
                                required
                            >
                                <option value="Vegetables">🥬 Vegetables</option>
                                <option value="Fruits">🍎 Fruits</option>
                                <option value="Dairy">🥛 Dairy</option>
                                <option value="Oils">🫒 Oils</option>
                                <option value="Honey">🍯 Honey</option>
                                <option value="Grains">🌾 Grains</option>
                                <option value="Meat">🥩 Meat</option>
                                <option value="Other">📦 Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Freshness</label>
                            <div className="radio-group">
                                <label 
                                    className="radio-item"
                                    style={{ 
                                        opacity: isPerishable ? 1 : 0.5,
                                        cursor: isPerishable ? 'pointer' : 'not-allowed'
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        name="is_anti_gaspi"
                                        checked={formData.is_anti_gaspi}
                                        disabled={!isPerishable}
                                        onChange={(e) => setFormData(prev => ({ 
                                            ...prev, 
                                            is_anti_gaspi: e.target.checked 
                                        }))}
                                    />
                                    Anti-waste product (older than 48h)
                                </label>
                            </div>
                            {!isPerishable && (
                                <p style={{ 
                                    fontSize: '12px', 
                                    color: '#666', 
                                    marginTop: '8px',
                                    fontStyle: 'italic'
                                }}>
                                    Only perishable products (Vegetables, Fruits, Dairy, Meat) can be marked as anti-waste
                                </p>
                            )}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <textarea
                                name="description"
                                className="form-input"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Describe your product..."
                            />
                        </div>

                        <button type="submit" className="btn-done">Done</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProductModal;
