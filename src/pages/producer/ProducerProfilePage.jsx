import React, { useState, useEffect } from 'react';
import UploadBox from '../../components/dashboard/UploadBox';
import Toast from '../../components/Toast';
import api from '../../services/api';
import authService from '../../services/authService';

const ProducerProfilePage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [toast, setToast] = useState(null);

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        password: '',
        avatar: ''
    });

    const [farmData, setFarmData] = useState({
        farmName: '',
        location: '',
        phone: '',
        description: '',
        farmPhoto: '',
        productTypes: [],
        isBioCertified: false
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/users/me/');
            const userData = response.user || response;
            
            setUser(userData);
            
            setProfileData({
                name: `${userData.first_name} ${userData.last_name}`.trim(),
                email: userData.email,
                password: '',
                avatar: userData.producer_profile?.avatar || userData.avatar || ''
            });

            const profile = userData.producer_profile || {};
            setFarmData({
                farmName: profile.shop_name || '',
                location: `${profile.city || ''}, ${profile.wilaya || ''}`.trim(),
                phone: userData.phone || '',
                description: profile.description || '',
                farmPhoto: profile.photo_url || '',
                productTypes: [],
                isBioCertified: profile.is_bio_certified || false,
                city: profile.city || '',
                wilaya: profile.wilaya || '',
                address: profile.address || '',
                methods: profile.methods || ''
            });
        } catch (err) {
            console.error('Failed to fetch user data:', err);
            showToast('Failed to load profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleFarmChange = (e) => {
        const { name, value } = e.target;
        setFarmData(prev => ({ ...prev, [name]: value }));
    };

   const handleProfilePhotoUpload = (file) => {
    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
};

const handleFarmPhotoUpload = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        setFarmData(prev => ({ ...prev, farmPhoto: reader.result }));
    };
    reader.readAsDataURL(file);
};

    const handleSaveProfile = async () => {
        try {
            const nameParts = profileData.name.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            const updateData = {
                first_name: firstName,
                last_name: lastName,
                email: profileData.email,
                avatar: profileData.avatar
            };

            if (profileData.password) {
                updateData.password = profileData.password;
            }

            const response = await api.patch('/users/update_me/', updateData);
            
            // Update localStorage with new user data
            const updatedUser = response.user || response;
            localStorage.setItem('user', JSON.stringify(updatedUser));

            showToast('Profile updated successfully', 'success');
            setProfileData(prev => ({ ...prev, password: '' }));
            
            // Reload user data to get updated avatar path
            await fetchUserData();
            
            // Force page reload after 1.5 seconds to update header
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err) {
            console.error('Failed to update profile:', err);
            showToast('Failed to update profile. Please try again.', 'error');
        }
    };

    const handleSaveFarm = async () => {
        try {
            const locationParts = farmData.location.split(',').map(s => s.trim());
            const city = locationParts[0] || farmData.city || '';
            const wilaya = locationParts[1] || farmData.wilaya || '';

            const farmUpdate = {
                shop_name: farmData.farmName,
                description: farmData.description,
                phone: farmData.phone,
                photo_url: farmData.farmPhoto,  // ← FIXED: Send as photo_url
                city: city,
                wilaya: wilaya,
                address: farmData.address,
                methods: farmData.methods,
                is_bio_certified: farmData.isBioCertified
            };

            console.log('Sending farm update:', farmUpdate);

            const response = await api.patch('/users/update_me/', farmUpdate);
            
            // Update localStorage
            const updatedUser = response.user || response;
            localStorage.setItem('user', JSON.stringify(updatedUser));

            showToast('Farm details updated successfully', 'success');
            
            // Reload user data to get updated photo path
            await fetchUserData();
            
            // Force page reload after 1.5 seconds to update header
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err) {
            console.error('Failed to update farm details:', err);
            showToast('Failed to update farm details. Please try again.', 'error');
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

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    Profile Settings
                </button>
                <button
                    className={`tab ${activeTab === 'farm' ? 'active' : ''}`}
                    onClick={() => setActiveTab('farm')}
                >
                    Farm Details
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
                        onFileSelect={handleProfilePhotoUpload}
                    />

                    <div className="form-group" style={{ marginTop: '30px' }}>
                        <label className="form-label">Producer name</label>
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
                        Change Farm Picture
                    </h2>

                    <UploadBox
                        title="Upload farm photo"
                        preview={farmData.farmPhoto}
                        onFileSelect={handleFarmPhotoUpload}
                    />

                    <div className="form-group" style={{ marginTop: '30px' }}>
                        <label className="form-label">Farm/Shop name</label>
                        <input
                            type="text"
                            name="farmName"
                            className="form-input"
                            value={farmData.farmName}
                            onChange={handleFarmChange}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Location (City, Wilaya)</label>
                        <input
                            type="text"
                            name="location"
                            className="form-input"
                            value={farmData.location}
                            onChange={handleFarmChange}
                            placeholder="e.g. Alger, Alger"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Phone number</label>
                        <input
                            type="tel"
                            name="phone"
                            className="form-input"
                            value={farmData.phone}
                            onChange={handleFarmChange}
                            placeholder="+213 XXX XXX XXX"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            name="description"
                            className="form-input"
                            value={farmData.description}
                            onChange={handleFarmChange}
                            rows="4"
                            placeholder="Describe your farm and products..."
                        />
                    </div>

                    <div className="form-group">
                        <label className="checkbox-item">
                            <input
                                type="checkbox"
                                checked={farmData.isBioCertified}
                                onChange={(e) => setFarmData(prev => ({ 
                                    ...prev, 
                                    isBioCertified: e.target.checked 
                                }))}
                            />
                            Bio Certified
                        </label>
                    </div>

                    <button className="btn-save" onClick={handleSaveFarm}>
                        Save Farm Details
                    </button>
                </div>
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

export default ProducerProfilePage;
