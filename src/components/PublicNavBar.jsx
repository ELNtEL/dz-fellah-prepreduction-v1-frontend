import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import api from '../services/api';
import logoImage from '../assets/logo-dzfellah1.png';

const PublicNavBar = ({ currentPage }) => {
  const navigate = useNavigate();
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();
  const [cartCount, setCartCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      if (user?.user_type === 'client') {
        fetchCartCount();
        const interval = setInterval(fetchCartCount, 30000);
        return () => clearInterval(interval);
      } else if (user?.user_type === 'producer') {
        fetchOrderCount();
        const interval = setInterval(fetchOrderCount, 30000);
        return () => clearInterval(interval);
      }
    }
  }, [isAuthenticated, user]);

  const fetchCartCount = async () => {
    try {
      const response = await api.get('/cart/my_cart/');
      const items = response.cart?.items || [];
      setCartCount(items.length);
    } catch (error) {
      console.error('Failed to fetch cart count:', error);
    }
  };

  const fetchOrderCount = async () => {
    try {
      const response = await api.get('/producer-orders/my_orders/');
      const orders = response.sub_orders || [];
      // Count only active orders (pending, confirmed, preparing, ready)
      const activeOrders = orders.filter(o => 
        o.status === 'pending' || 
        o.status === 'confirmed' || 
        o.status === 'preparing' || 
        o.status === 'ready'
      );
      setOrderCount(activeOrders.length);
    } catch (error) {
      console.error('Failed to fetch order count:', error);
    }
  };

  const handleIconClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.user_type === 'producer') {
      navigate('/producer/orders');
    } else {
      navigate('/client/cart');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  return (
    <nav className="bg-[#285153] px-6 lg:px-16 py-4 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => navigate('/')}
        >
          <img src={logoImage} alt="FELLAH" className="h-8 w-auto brightness-0 invert" />
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => navigate('/')} 
            className={`text-white hover:text-gray-200 font-semibold ${currentPage === 'home' ? 'underline' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => navigate('/products')} 
            className={`text-white hover:text-gray-200 font-semibold ${currentPage === 'products' ? 'underline' : ''}`}
          >
            Products
          </button>
          <button 
            onClick={() => navigate('/stores')} 
            className={`text-white hover:text-gray-200 font-semibold ${currentPage === 'stores' ? 'underline' : ''}`}
          >
            Stores
          </button>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* Cart Icon for Clients */}
              {user?.user_type === 'client' && (
                <button
                  onClick={handleIconClick}
                  className="relative text-white hover:text-gray-200 p-2 transition-transform hover:scale-110"
                  title="My Cart"
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className="w-7 h-7"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </button>
              )}

              {/* Orders Icon for Producers */}
              {user?.user_type === 'producer' && (
                <button
                  onClick={handleIconClick}
                  className="relative text-white hover:text-gray-200 p-2 transition-transform hover:scale-110"
                  title="Incoming Orders"
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className="w-7 h-7"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10,9 9,9 8,9" />
                  </svg>
                  {orderCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse">
                      {orderCount > 99 ? '99+' : orderCount}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={handleLogout}
                className="text-white hover:text-gray-200 font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/login')}
                className="text-white hover:text-gray-200 font-semibold"
              >
                Log in
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-white text-[#285153] px-6 py-2 rounded-full font-semibold hover:bg-gray-100"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PublicNavBar;