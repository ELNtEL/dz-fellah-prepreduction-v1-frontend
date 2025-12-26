import React, { useState } from 'react';

// Pickup points data - 2 pickup points per wilaya
const PICKUP_POINTS = {
    'Adrar': [
        { id: 'adrar_1', name: 'Adrar Central Collection Point', address: 'City Center, Adrar' },
        { id: 'adrar_2', name: 'Adrar Desert Farms Hub', address: 'Route Nationale 6, Adrar' }
    ],
    'Alger': [
        { id: 'alger_1', name: 'Algiers Coastal Market Hub', address: 'Port Area, Algiers' },
        { id: 'alger_2', name: 'Algiers Fresh Valley Center', address: 'Bab El Oued, Algiers' }
    ],
    'Annaba': [
        { id: 'annaba_1', name: 'Annaba Seraïdi Farms Point', address: 'Seraïdi Road, Annaba' },
        { id: 'annaba_2', name: 'Annaba Bouna Beach Collection', address: 'Bouna Beach Area, Annaba' }
    ],
    'Batna': [
        { id: 'batna_1', name: 'Batna Mountain Farms Hub', address: 'Aurès Mountains, Batna' },
        { id: 'batna_2', name: 'Batna Central Market Point', address: 'Downtown Batna' }
    ],
    'Béjaïa': [
        { id: 'bejaia_1', name: 'Béjaïa Farms of the Beach', address: 'Coastal Road, Béjaïa' },
        { id: 'bejaia_2', name: 'Béjaïa Pickup Center', address: 'City Center, Béjaïa' }
    ],
    'Biskra': [
        { id: 'biskra_1', name: 'Biskra Oasis Collection Point', address: 'Palm Grove Area, Biskra' },
        { id: 'biskra_2', name: 'Biskra Desert Gateway Hub', address: 'Route Nationale 3, Biskra' }
    ],
    'Blida': [
        { id: 'blida_1', name: 'Blida Mitidja Fields Center', address: 'Mitidja Plain, Blida' },
        { id: 'blida_2', name: 'Blida Chréa Mountain Point', address: 'Chréa Road, Blida' }
    ],
    'Boumerdès': [
        { id: 'boumerdes_1', name: 'Boumerdès Coastal Farms Hub', address: 'Seaside Route, Boumerdès' },
        { id: 'boumerdes_2', name: 'Boumerdès Valley Collection', address: 'Issers Valley, Boumerdès' }
    ],
    'Constantine': [
        { id: 'constantine_1', name: 'Constantine Bridge Market Point', address: 'Sidi M\'Cid Bridge Area, Constantine' },
        { id: 'constantine_2', name: 'Constantine Plateau Farms Hub', address: 'El Kantara, Constantine' }
    ],
    'Djelfa': [
        { id: 'djelfa_1', name: 'Djelfa Steppe Farms Center', address: 'High Plateaus, Djelfa' },
        { id: 'djelfa_2', name: 'Djelfa Central Collection Point', address: 'Downtown Djelfa' }
    ],
    'Jijel': [
        { id: 'jijel_1', name: 'Jijel Mountain Farms Point', address: 'Corniche Jijelienne, Jijel' },
        { id: 'jijel_2', name: 'Jijel Natural Products Hub', address: 'Texenna Forest Road, Jijel' }
    ],
    'Médéa': [
        { id: 'medea_1', name: 'Médéa Titteri Farms Center', address: 'Titteri Region, Médéa' },
        { id: 'medea_2', name: 'Médéa Green Valley Point', address: 'Agricultural Zone, Médéa' }
    ],
    'Mostaganem': [
        { id: 'mostaganem_1', name: 'Mostaganem Coastal Hub', address: 'Port Area, Mostaganem' },
        { id: 'mostaganem_2', name: 'Mostaganem Vineyards Point', address: 'Rural Route, Mostaganem' }
    ],
    'Oran': [
        { id: 'oran_1', name: 'Oran Western Farms Hub', address: 'Es Senia Area, Oran' },
        { id: 'oran_2', name: 'Oran Mediterranean Market', address: 'Santa Cruz, Oran' }
    ],
    'Sétif': [
        { id: 'setif_1', name: 'Sétif High Plateaus Center', address: 'Agricultural District, Sétif' },
        { id: 'setif_2', name: 'Sétif Cereals Valley Point', address: 'Ain Azel Road, Sétif' }
    ],
    'Tizi Ouzou': [
        { id: 'tizi_1', name: 'Tizi Ouzou Kabylie Farms Hub', address: 'Draa Ben Khedda, Tizi Ouzou' },
        { id: 'tizi_2', name: 'Tizi Ouzou Mountain Collection', address: 'Yakouren Road, Tizi Ouzou' }
    ],
    'Tlemcen': [
        { id: 'tlemcen_1', name: 'Tlemcen Western Highlands Point', address: 'Maghnia Road, Tlemcen' },
        { id: 'tlemcen_2', name: 'Tlemcen Olive Groves Hub', address: 'Ghazaouet Area, Tlemcen' }
    ],
    'Ouargla': [
        { id: 'ouargla_1', name: 'Ouargla Sahara Farms Point', address: 'Oasis Route, Ouargla' },
        { id: 'ouargla_2', name: 'Ouargla Desert Collection Hub', address: 'City Center, Ouargla' }
    ],
    'Skikda': [
        { id: 'skikda_1', name: 'Skikda Coastal Farms Center', address: 'Port Road, Skikda' },
        { id: 'skikda_2', name: 'Skikda Natural Products Point', address: 'Collo Area, Skikda' }
    ],
    'Tipaza': [
        { id: 'tipaza_1', name: 'Tipaza Seaside Farms Hub', address: 'Cherchell Road, Tipaza' },
        { id: 'tipaza_2', name: 'Tipaza Roman Coast Point', address: 'Archaeological Area, Tipaza' }
    ]
};

// All 48 wilayas
const ALL_WILAYAS = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
    'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou', 'Alger',
    'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma',
    'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla', 'Oran', 'El Bayadh',
    'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued',
    'Khenchela', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent',
    'Ghardaïa', 'Relizane'
];

const DeliveryMethodModal = ({ onConfirm, onCancel }) => {
    const [deliveryMethod, setDeliveryMethod] = useState('pickup_producer');
    const [selectedWilaya, setSelectedWilaya] = useState('');
    const [selectedPickupPoint, setSelectedPickupPoint] = useState(null);

    const handleConfirm = () => {
        if (deliveryMethod === 'pickup_point' && !selectedPickupPoint) {
            alert('Please select a pickup point');
            return;
        }

        onConfirm({
            delivery_method: deliveryMethod,
            delivery_address: deliveryMethod === 'pickup_point' 
                ? `${selectedPickupPoint.name}, ${selectedPickupPoint.address}`
                : '',
            pickup_point_id: selectedPickupPoint?.id || null
        });
    };

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onCancel();
        }
    };

    const availablePickupPoints = selectedWilaya && PICKUP_POINTS[selectedWilaya] 
        ? PICKUP_POINTS[selectedWilaya] 
        : [];

    return (
        <div 
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '20px'
            }}
            onClick={handleOverlayClick}
        >
            <div 
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '32px',
                    maxWidth: '500px',
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
                }}
            >
                <h2 style={{
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#1f2937',
                    marginBottom: '8px'
                }}>
                    Choose Delivery Method
                </h2>
                <p style={{
                    fontSize: '14px',
                    color: '#6b7280',
                    marginBottom: '24px'
                }}>
                    Select how you want to receive your order
                </p>

                {/* Delivery Method Options */}
                <div style={{ marginBottom: '24px' }}>
                    {/* Pickup at Producer */}
                    <label 
                        style={{
                            display: 'block',
                            padding: '16px',
                            border: `2px solid ${deliveryMethod === 'pickup_producer' ? '#285153' : '#e5e7eb'}`,
                            borderRadius: '8px',
                            marginBottom: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            backgroundColor: deliveryMethod === 'pickup_producer' ? '#f0f9ff' : 'white'
                        }}
                    >
                        <input
                            type="radio"
                            name="delivery_method"
                            value="pickup_producer"
                            checked={deliveryMethod === 'pickup_producer'}
                            onChange={(e) => setDeliveryMethod(e.target.value)}
                            style={{ marginRight: '12px' }}
                        />
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>
                            🏪 Pickup at Producer
                        </span>
                        <p style={{ 
                            fontSize: '13px', 
                            color: '#6b7280', 
                            marginLeft: '28px',
                            marginTop: '4px'
                        }}>
                            Collect your order directly from each producer's location
                        </p>
                    </label>

                    {/* Pickup Point */}
                    <label 
                        style={{
                            display: 'block',
                            padding: '16px',
                            border: `2px solid ${deliveryMethod === 'pickup_point' ? '#285153' : '#e5e7eb'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            backgroundColor: deliveryMethod === 'pickup_point' ? '#f0f9ff' : 'white'
                        }}
                    >
                        <input
                            type="radio"
                            name="delivery_method"
                            value="pickup_point"
                            checked={deliveryMethod === 'pickup_point'}
                            onChange={(e) => setDeliveryMethod(e.target.value)}
                            style={{ marginRight: '12px' }}
                        />
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>
                            📦 Pickup at Collection Point
                        </span>
                        <p style={{ 
                            fontSize: '13px', 
                            color: '#6b7280', 
                            marginLeft: '28px',
                            marginTop: '4px'
                        }}>
                            All products delivered to a convenient collection point
                        </p>
                    </label>
                </div>

                {/* Pickup Point Selection */}
                {deliveryMethod === 'pickup_point' && (
                    <div style={{
                        backgroundColor: '#f9fafb',
                        padding: '20px',
                        borderRadius: '8px',
                        marginBottom: '24px'
                    }}>
                        <h3 style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#1f2937',
                            marginBottom: '12px'
                        }}>
                            Select Pickup Location
                        </h3>

                        {/* Wilaya Selection */}
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '500',
                                color: '#374151',
                                marginBottom: '6px'
                            }}>
                                Wilaya
                            </label>
                            <select
                                value={selectedWilaya}
                                onChange={(e) => {
                                    setSelectedWilaya(e.target.value);
                                    setSelectedPickupPoint(null); // Reset pickup point
                                }}
                                style={{
                                    width: '100%',
                                    padding: '10px 12px',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    backgroundColor: 'white'
                                }}
                            >
                                <option value="">Choose your wilaya</option>
                                {ALL_WILAYAS.map(wilaya => (
                                    <option key={wilaya} value={wilaya}>
                                        {wilaya}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Pickup Points */}
                        {selectedWilaya && (
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '13px',
                                    fontWeight: '500',
                                    color: '#374151',
                                    marginBottom: '8px'
                                }}>
                                    Collection Point
                                </label>
                                
                                {availablePickupPoints.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {availablePickupPoints.map(point => (
                                            <label
                                                key={point.id}
                                                style={{
                                                    display: 'block',
                                                    padding: '12px',
                                                    border: `2px solid ${selectedPickupPoint?.id === point.id ? '#285153' : '#e5e7eb'}`,
                                                    borderRadius: '6px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s',
                                                    backgroundColor: selectedPickupPoint?.id === point.id ? '#f0fdf4' : 'white'
                                                }}
                                            >
                                                <input
                                                    type="radio"
                                                    name="pickup_point"
                                                    checked={selectedPickupPoint?.id === point.id}
                                                    onChange={() => setSelectedPickupPoint(point)}
                                                    style={{ marginRight: '8px' }}
                                                />
                                                <div style={{ display: 'inline-block' }}>
                                                    <div style={{ 
                                                        fontWeight: '500', 
                                                        color: '#1f2937',
                                                        fontSize: '14px'
                                                    }}>
                                                        {point.name}
                                                    </div>
                                                    <div style={{ 
                                                        fontSize: '12px', 
                                                        color: '#6b7280',
                                                        marginTop: '2px'
                                                    }}>
                                                        📍 {point.address}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{
                                        fontSize: '13px',
                                        color: '#9ca3af',
                                        padding: '12px',
                                        textAlign: 'center',
                                        backgroundColor: 'white',
                                        borderRadius: '6px',
                                        border: '1px dashed #d1d5db'
                                    }}>
                                        No pickup points available in this wilaya yet
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '12px',
                    paddingTop: '8px'
                }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '12px 20px',
                            backgroundColor: 'transparent',
                            color: '#6b7280',
                            border: '1px solid #d1d5db',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#f9fafb';
                            e.target.style.borderColor = '#9ca3af';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.borderColor = '#d1d5db';
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        style={{
                            flex: 1,
                            padding: '12px 20px',
                            backgroundColor: '#285153',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#1f3f40'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#285153'}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeliveryMethodModal;