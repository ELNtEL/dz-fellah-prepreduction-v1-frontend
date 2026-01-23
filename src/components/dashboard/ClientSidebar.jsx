import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import logo from "../../assets/dashboard/images/logo.png";

const ClientSidebar = ({ cartItemCount = 0 }) => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const activePage = location.pathname.split('/')[2] || 'profile';
    
    const handlePageChange = (page) => {
        navigate(`/client/${page}`);
    };
    
    const handleGoHome = () => {
        navigate('/');
    };
    
    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.clear();
            window.location.href = '/login';
        }
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <img src={logo} alt="FELLAH" />
            </div>

            <nav className="sidebar-nav">
                <button
                    className={`sidebar-nav-item ${activePage === 'profile' ? 'active' : ''}`}
                    onClick={() => handlePageChange('profile')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                    Profile
                </button>

                <button
                    className={`sidebar-nav-item ${activePage === 'cart' ? 'active' : ''}`}
                    onClick={() => handlePageChange('cart')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1" />
                        <circle cx="20" cy="21" r="1" />
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                    </svg>
                    Cart
                    {cartItemCount > 0 && (
                        <span className="cart-badge">{cartItemCount}</span>
                    )}
                </button>

                <button
                    className={`sidebar-nav-item ${activePage === 'orders' ? 'active' : ''}`}
                    onClick={() => handlePageChange('orders')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10,9 9,9 8,9" />
                    </svg>
                    Orders
                </button>

                {/* Only show subscriptions for clients */}
                {localStorage.getItem('userType') === 'client' && (
                    <button
                        className={`sidebar-nav-item ${activePage === 'subscriptions' ? 'active' : ''}`}
                        onClick={() => handlePageChange('subscriptions')}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                            <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
                        </svg>
                        My Subscriptions
                    </button>
                )}

                <button
                    className={`sidebar-nav-item ${activePage === 'notifications' ? 'active' : ''}`}
                    onClick={() => handlePageChange('notifications')}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    Notifications
                </button>
            </nav>

            {/* HOME BUTTON AND LOGOUT */}
            <div style={{
                marginTop: 'auto',
                padding: '20px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <button 
                    onClick={handleGoHome}
                    style={{
                        width: '100%',
                        padding: '12px 20px',
                        background: '#ffffff',
                        color: '#285153',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        marginBottom: '10px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f0f0f0';
                        e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#ffffff';
                        e.currentTarget.style.transform = 'translateX(0)';
                    }}
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9,22 9,12 15,12 15,22" />
                    </svg>
                    Back to Home
                </button>
                
                <div className="sidebar-logout">
                    <button onClick={handleLogout}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16,17 21,12 16,7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        log out
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default ClientSidebar;