import React, { useState, useEffect } from 'react';
import UploadBox from '../../components/dashboard/UploadBox';

const ClientProfilePage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        password: '',
        avatar: ''
    });

    const [addressData, setAddressData] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        wilaya: '',
        postalCode: ''
    });

    // Load user from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            
            // Initialize profile data
            const fullName = userData.first_name && userData.last_name 
                ? `${userData.first_name} ${userData.last_name}`
                : userData.first_name || userData.email || '';
            
            setProfileData({
                name: fullName,
                email: userData.email || '',
                password: '',
                avatar: userData.client_profile?.avatar || userData.avatar || ''
            });

            // Initialize address data if exists
            if (userData.client_profile) {
                setAddressData({
                    fullName: fullName,
                    phone: userData.phone || userData.client_profile.phone || '',
                    address: userData.client_profile.address || '',
                    city: userData.client_profile.city || '',
                    wilaya: userData.client_profile.wilaya || '',
                    postalCode: userData.client_profile.postal_code || ''
                });
            } else {
                setAddressData({
                    fullName: fullName,
                    phone: userData.phone || '',
                    address: '',
                    city: '',
                    wilaya: '',
                    postalCode: ''
                });
            }
        }
        setLoading(false);
    }, []);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddressData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfilePhotoUpload = (imageData) => {
        setProfileData(prev => ({ ...prev, avatar: imageData }));
    };

    const handleSaveProfile = async () => {
        try {
            // TODO: Call API to update profile
            // await userService.updateProfile(profileData);
            
            // Update localStorage
            const updatedUser = {
                ...user,
                first_name: profileData.name.split(' ')[0],
                last_name: profileData.name.split(' ').slice(1).join(' '),
                email: profileData.email,
                avatar: profileData.avatar
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile. Please try again.');
        }
    };

    const handleSaveAddress = async () => {
        try {
            // TODO: Call API to update address
            // await userService.updateAddress(addressData);
            
            alert('Delivery address saved successfully!');
        } catch (error) {
            console.error('Failed to update address:', error);
            alert('Failed to update address. Please try again.');
        }
    };

    if (loading) {
        return (
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
                <p style={{ marginTop: '20px', color: '#666' }}>Loading profile...</p>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ color: '#d32f2f' }}>Failed to load user profile</p>
            </div>
        );
    }

    return (
        <div>
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile Settings
                </button>
                <button
                    className={`tab ${activeTab === 'address' ? 'active' : ''}`}
                    onClick={() => setActiveTab('address')}
                >
                    Delivery Address
                </button>
            </div>

            {activeTab === 'profile' ? (
                <div className="form-section">
                    <h2 className="form-label" style={{ fontSize: '18px', marginBottom: '20px' }}>
                        Change Profile Picture
                    </h2>

                    <UploadBox
                        title="Upload profile photo"
                        preview={profileData.avatar}
                        onUpload={handleProfilePhotoUpload}
                    />

                    <div className="form-group" style={{ marginTop: '30px' }}>
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="form-input"
                            value={profileData.name}
                            onChange={handleProfileChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            name="email"
                            className="form-input"
                            value={profileData.email}
                            onChange={handleProfileChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="form-input"
                            value={profileData.password}
                            onChange={handleProfileChange}
                            placeholder="Enter new password (leave blank to keep current)"
                        />
                    </div>

                    <button className="btn-save" onClick={handleSaveProfile}>
                        Save Changes
                    </button>
                </div>
            ) : (
                <div className="form-section">
                    <h2 className="form-label" style={{ fontSize: '18px', marginBottom: '20px' }}>
                        Delivery Information
                    </h2>

                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            className="form-input"
                            value={addressData.fullName}
                            onChange={handleAddressChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            className="form-input"
                            value={addressData.phone}
                            onChange={handleAddressChange}
                            placeholder="+213 XXX XXX XXX"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <input
                            type="text"
                            name="address"
                            className="form-input"
                            value={addressData.address}
                            onChange={handleAddressChange}
                            placeholder="Street address, apartment, etc."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">City</label>
                            <input
                                type="text"
                                name="city"
                                className="form-input"
                                value={addressData.city}
                                onChange={handleAddressChange}
                            />
                        </div>

                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Wilaya</label>
                            <input
                                type="text"
                                name="wilaya"
                                className="form-input"
                                value={addressData.wilaya}
                                onChange={handleAddressChange}
                            />
                        </div>

                        <div className="form-group" style={{ flex: 0.5 }}>
                            <label className="form-label">Postal Code</label>
                            <input
                                type="text"
                                name="postalCode"
                                className="form-input"
                                value={addressData.postalCode}
                                onChange={handleAddressChange}
                            />
                        </div>
                    </div>

                    <button className="btn-save" onClick={handleSaveAddress}>
                        Save Address
                    </button>
                </div>
            )}
        </div>
    );
};

export default ClientProfilePage;