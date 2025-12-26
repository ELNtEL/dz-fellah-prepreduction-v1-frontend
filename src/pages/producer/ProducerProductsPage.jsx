import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/dashboard/ProductCard';
import FilterButtons from '../../components/dashboard/FilterButtons';
import ProductModal from '../../components/dashboard/ProductModal';
import DeleteConfirmationModal from '../../components/dashboard/DeleteConfirmationModal';
import Toast from '../../components/Toast';
import api from '../../services/api';

const ProducerProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [activeFilter, setActiveFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);

    const categories = ['All', 'Fruits', 'Oils', 'Dairy', 'Vegetables', 'Honey'];

    useEffect(() => {
        fetchMyProducts();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchMyProducts = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await api.get('/my-products/');
            setProducts(response.products || []);
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError('Failed to load products. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = activeFilter === 'All'
        ? products
        : products.filter(p => p.category === activeFilter);

    const handleAddClick = () => {
        setEditingProduct(null);
        setShowModal(true);
    };

    const handleEditClick = (product) => {
        setEditingProduct(product);
        setShowModal(true);
    };

    const handleSave = async (productData) => {
        try {
            if (editingProduct) {
                const response = await api.put(`/my-products/${editingProduct.id}/`, productData);
                setProducts(prev => 
                    prev.map(p => p.id === editingProduct.id ? response.product : p)
                );
                showToast('Product updated successfully', 'success');
            } else {
                const response = await api.post('/my-products/', productData);
                setProducts(prev => [...prev, response.product]);
                showToast('Product added successfully', 'success');
            }
            
            setShowModal(false);
            setEditingProduct(null);
        } catch (err) {
            console.error('Failed to save product:', err);
            console.error('Backend error:', err.response?.data);
            showToast('Failed to save product. Please try again.', 'error');
        }
    };

    const handleDeleteClick = (product) => {
        setDeleteConfirmation(product);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirmation) return;

        try {
            await api.delete(`/my-products/${deleteConfirmation.id}/`);
            
            // Remove from local state
            setProducts(prev => prev.filter(p => p.id !== deleteConfirmation.id));
            
            // Close modal
            setDeleteConfirmation(null);
            
            // Show success toast
            showToast('Product deleted successfully', 'success');
        } catch (err) {
            console.error('Failed to delete product:', err);
            setDeleteConfirmation(null);
            showToast('Failed to delete product. Please try again.', 'error');
        }
    };

    const handleDeleteCancel = () => {
        setDeleteConfirmation(null);
    };

    if (loading) {
        return (
            <div>
                <div className="products-header">
                    <h1 className="products-title">Manage your products</h1>
                </div>
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
                    <p style={{ marginTop: '20px', color: '#666' }}>Loading products...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <div className="products-header">
                    <h1 className="products-title">Manage your products</h1>
                </div>
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#d32f2f' }}>
                    <p>{error}</p>
                    <button 
                        onClick={fetchMyProducts}
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
        <div>
            {/* Toast Notification */}
            {toast && (
                <Toast 
                    message={toast.message} 
                    type={toast.type} 
                    onClose={() => setToast(null)} 
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <DeleteConfirmationModal
                    productName={deleteConfirmation.name}
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                />
            )}

            <div className="products-header">
                <h1 className="products-title">Manage your products</h1>
                <button className="btn-icon notification-bell">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px' }}>
                <FilterButtons
                    categories={categories}
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                />
                <button className="btn-add-product" onClick={handleAddClick}>
                    Add Product
                </button>
            </div>

            {filteredProducts.length > 0 ? (
                <div className="products-grid">
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onEdit={handleEditClick}
                            onDelete={handleDeleteClick}
                        />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
                    <p>No products found. Click "Add Product" to get started!</p>
                </div>
            )}

            {showModal && (
                <ProductModal
                    product={editingProduct}
                    onSave={handleSave}
                    onClose={() => {
                        setShowModal(false);
                        setEditingProduct(null);
                    }}
                />
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

export default ProducerProductsPage;