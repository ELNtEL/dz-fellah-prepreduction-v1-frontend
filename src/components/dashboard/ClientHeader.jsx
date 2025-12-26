import React from 'react';

const ClientHeader = ({ user, cartItemCount = 0, onCartClick, onNotificationClick }) => {
    const firstName = user?.first_name || 'User';
    const fullName = user?.first_name && user?.last_name 
        ? `${user.first_name} ${user.last_name}`
        : user?.first_name || user?.email || 'User';
    
    // Only use real avatar, no placeholder
    const avatarUrl = user?.client_profile?.avatar || user?.avatar || null;

    // Only use real banner, no placeholder
    const bannerUrl = user?.client_profile?.banner_photo || null;

    return (
        <header className="header">
            {bannerUrl ? (
                <img
                    src={bannerUrl}
                    alt="Profile Banner"
                    className="header-banner"
                />
            ) : (
                <div className="header-banner" style={{ 
                    backgroundColor: '#285153',
                    height: '200px'
                }}></div>
            )}

            <div className="header-profile">
                {avatarUrl ? (
                    <img
                        src={avatarUrl}
                        alt={fullName}
                        className="header-avatar"
                    />
                ) : (
                    <div className="header-avatar" style={{
                        backgroundColor: '#1a3839',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: 'bold'
                    }}>
                        {firstName.charAt(0).toUpperCase()}
                    </div>
                )}

                <div className="header-info">
                    <h1 className="header-name">{fullName}</h1>
                    <p className="header-email">{user?.email || ''}</p>
                </div>

                <div className="header-actions">
                    <button className="btn-icon cart-icon" onClick={onCartClick}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                        </svg>
                        {cartItemCount > 0 && (
                            <span className="notification-badge">{cartItemCount}</span>
                        )}
                    </button>
                    <button className="btn-icon notification-bell" onClick={onNotificationClick}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="welcome-message">
                <h2>Welcome back, {firstName}!</h2>
                <p>Discover fresh, local products from our trusted producers. Browse, add to cart, and enjoy farm-to-table goodness!</p>
            </div>
        </header>
    );
};

export default ClientHeader;