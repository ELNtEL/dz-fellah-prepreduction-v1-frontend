import { useState, useEffect } from 'react';
import BasketCard from '../../components/dashboard/BasketCard';
import BasketModal from '../../components/dashboard/BasketModal';
import DeleteConfirmationModal from '../../components/dashboard/DeleteConfirmationModal';
import Toast from '../../components/Toast';
import basketService from '../../services/basketService';
import '../../components/dashboard/css-weekly/WeeklyBasketPage.css';

function WeeklyBasketPage() {
    const [baskets, setBaskets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBasket, setEditingBasket] = useState(null);
    const [toast, setToast] = useState(null);
    const [deletingBasket, setDeletingBasket] = useState(null);

    useEffect(() => {
        fetchBaskets();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchBaskets = async () => {
        setLoading(true);
        try {
            const response = await basketService.getMyBaskets();
            setBaskets(response?.baskets || []);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch baskets:', err);
            setError('Failed to load baskets. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddBasket = () => {
        setEditingBasket(null);
        setIsModalOpen(true);
    };

    const handleEditBasket = (basketId) => {
        const basket = baskets.find(b => b.id === basketId);
        if (basket) {
            setEditingBasket(basket);
            setIsModalOpen(true);
        }
    };

    const handleDeleteBasket = (basketId) => {
        const basket = baskets.find(b => b.id === basketId);
        if (basket) {
            setDeletingBasket(basket);
        }
    };

    const confirmDelete = async () => {
        try {
            await basketService.deleteBasket(deletingBasket.id);
            await fetchBaskets();
            showToast('Basket deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting basket:', error);
            showToast('Failed to delete basket', 'error');
        } finally {
            setDeletingBasket(null);
        }
    };

    const cancelDelete = () => {
        setDeletingBasket(null);
    };

    const handleSaveBasket = async () => {
        try {
            await fetchBaskets();
            setIsModalOpen(false);
            showToast(editingBasket ? 'Basket updated successfully' : 'Basket created successfully', 'success');
        } catch (error) {
            console.error('Error saving basket:', error);
            showToast('Failed to save basket. Please try again.', 'error');
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingBasket(null);
    };

    return (
        <div style={{ padding: '30px 40px' }}>
            {/* Toast Notification */}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            {/* Delete Confirmation Modal */}
            {deletingBasket && (
                <DeleteConfirmationModal
                    productName={deletingBasket.name}
                    onConfirm={confirmDelete}
                    onCancel={cancelDelete}
                />
            )}

            <div className="products-header">
                <h1 className="products-title">Manage Your Weekly Baskets</h1>
                <button onClick={handleAddBasket} className="btn-add-product">
                    ADD BASKET
                </button>
            </div>

            {error && (
                <div className="error-message" style={{
                    background: '#fee',
                    border: '1px solid #fcc',
                    borderRadius: '8px',
                    padding: '15px 20px',
                    color: '#c33',
                    margin: '20px 0'
                }}>
                    {error}
                </div>
            )}

            {loading ? (
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
                    <p style={{ marginTop: '20px', color: '#666' }}>Loading baskets...</p>
                </div>
            ) : (
                <div className="products-grid">
                    {baskets.length === 0 ? (
                        <div style={{ 
                            gridColumn: '1 / -1',
                            textAlign: 'center', 
                            padding: '60px 20px', 
                            color: '#666' 
                        }}>
                            <p>No baskets yet. Click "ADD BASKET" to create one.</p>
                        </div>
                    ) : (
                        baskets.map((basket) => (
                            <BasketCard
                                key={basket.id}
                                basket={basket}
                                onEdit={handleEditBasket}
                                onDelete={handleDeleteBasket}
                            />
                        ))
                    )}
                </div>
            )}

            <BasketModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                basket={editingBasket}
                onSave={handleSaveBasket}
            />

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default WeeklyBasketPage;