import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import subscriptionService from '../services/subscriptionService';
import DeliveryMethodModal from './dashboard/DeliveryMethodModal';
import Toast from './Toast';

function SubscriptionFormModal({ basket, onClose }) {
  const [showDeliveryModal, setShowDeliveryModal] = useState(true);
  const [deliveryData, setDeliveryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleDeliveryConfirm = async (data) => {
  console.log('📥 Delivery data received:', data); // 
  setDeliveryData(data);
  setShowDeliveryModal(false);
  
  await handleSubscribe(data);
};

const handleSubscribe = async (data) => {
  setLoading(true);

  try {
    const subscriptionData = {
      basket_id: basket.id,
      delivery_method: data.delivery_method,
      delivery_address: data.delivery_address,
      pickup_point_id: data.pickup_point_id,
    };

    console.log('📤 Sending subscription data:', subscriptionData); // 

    await subscriptionService.subscribe(subscriptionData);
    showToast('Successfully subscribed to basket!', 'success');
    
    setTimeout(() => {
      onClose();
      window.location.href = '/client/subscriptions';
    }, 2000);
  } catch (err) {
    console.error('❌ Subscription error:', err);
    console.error('❌ Error response:', err.response?.data); // 
    console.error('❌ Status code:', err.response?.status); // 
    showToast(err.response?.data?.error || 'Failed to subscribe. Please try again.', 'error');
    setShowDeliveryModal(true);
  } finally {
    setLoading(false);
  }
};

  if (!basket) return null;

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Delivery Method Selection */}
      {showDeliveryModal && (
        <DeliveryMethodModal
          onConfirm={handleDeliveryConfirm}
          onCancel={onClose}
        />
      )}

      {/* Loading State */}
      {loading && !showDeliveryModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 text-center"
          >
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#285153] mb-4"></div>
            <p className="text-gray-700 font-semibold">Processing your subscription...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait</p>
          </motion.div>
        </div>
      )}
    </>
  );
}

export default SubscriptionFormModal;