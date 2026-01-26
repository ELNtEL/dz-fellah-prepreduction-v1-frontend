import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../utils/imageUtils';

const Header = ({ user, onNotificationClick }) => {
    const navigate = useNavigate();

    // For producers, the display name is the farm/shop name
    const getFarmName = () => {
        if (user.producer_profile?.shop_name) return user.producer_profile.shop_name;
        if (user.farmName) return user.farmName;
        return 'Your Farm';
    };

    const farmName = getFarmName();

    // Get first letter for avatar fallback
    const getAvatarLetter = () => {
        return farmName.charAt(0).toUpperCase();
    };
    
    // Build full URLs for images
    const avatarUrl = getImageUrl(user?.avatar || user?.producer_profile?.avatar);
    const bannerUrl = getImageUrl(user?.producer_profile?.photo_url || user?.photo_url);

    return (
        <header className="header">
            {bannerUrl ? (
                <img
                    src={bannerUrl}
                    alt="Farm Banner"
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
                        alt={farmName}
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
                        {getAvatarLetter()}
                    </div>
                )}

                <div className="header-info">
                    <h1 className="header-name">{farmName}</h1>
                    <p className="header-email">{user.email}</p>
                </div>

                <div className="header-actions">
                    <button 
                        className="btn-landing"
                        onClick={() => navigate('/')}
                    >
                        landing page
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
                <h2>Welcome to {farmName}!</h2>
                <p>Manage your products, orders, and inventory all in one place. Keep your farm running smoothly.</p>
            </div>
        </header>
    );
};

export default Header;