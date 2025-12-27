import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import LoginForm from "./components/login-form";
import SignupForm from "./components/signup-form";
import SignupSecondaryForm from "./components/signup-secondary-form";
import ProductsPage from "./components/products-page";
import StoresPage from "./components/stores-page";
import LandingPage from "./components/landing-page";
import BrowseSubscriptionBasketsPage from "./components/BrowseSubscriptionBasketsPage";
import NotFoundPage from "./components/not-found-page";

// Client Dashboard Pages
import ClientCartPage from "./pages/client/CartPage";
import ClientOrdersPage from "./pages/client/OrdersPage";
import ClientProfilePage from "./pages/client/ClientProfilePage";
import ClientNotificationsPage from "./pages/client/ClientNotificationsPage";
import ClientWeeklyBasketPage from "./pages/client/ClientWeeklyBasketPage";

// Producer Dashboard Pages
import ProducerProductsPage from "./pages/producer/ProducerProductsPage";
import ProducerOrdersPage from "./pages/producer/ProducerOrdersPage";
import ProducerProfilePage from "./pages/producer/ProducerProfilePage";
import ProducerNotificationsPage from "./pages/producer/ProducerNotificationsPage";
import WeeklyBasketPage from "./pages/producer/WeeklyBasketPage";

// Client Dashboard Components
import ClientSidebar from "./components/dashboard/ClientSidebar";
import ClientHeader from "./components/dashboard/ClientHeader";

// Producer Dashboard Components
import Sidebar from "./components/dashboard/Sidebar";
import Header from "./components/dashboard/Header";

// Assets
import logoImage from "./assets/logo-dzfellah1.png";

// Auth Layout Component
function AuthLayout({ children, mode }) {
  const navigate = useNavigate();
  const isLogin = mode === "login";

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar */}
      <div className="hidden md:flex md:w-1/2 bg-[#285153] flex-col p-12 lg:p-16 items-center text-center">
        <div className="w-full flex justify-center">
          <div className="flex items-center gap-2">
            <img src={logoImage} alt="FELLAH Logo" className="h-10 w-auto" />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-16 w-full max-w-lg">
          <div>
            <h2 className="text-white text-7xl lg:text-5xl font-bold leading-snug font-sans">
              {isLogin ? (
                <>
                  Welcome back! We're
                  <br />
                  glad to see you again
                </>
              ) : (
                <>
                  Join dz fellah
                  <br />
                  today
                </>
              )}
            </h2>
          </div>

          <div className="flex flex-col items-center gap-6">
            <p className="text-white text-xl font-bold">
              {isLogin ? "I don't have an acount" : "i have already an account"}
            </p>
            <button
              onClick={() => navigate(isLogin ? "/signup" : "/login")}
              className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-[#285153] transition-colors flex items-center gap-2 text-lg"
            >
              <span>→</span>
              <span>{isLogin ? "Sign up" : "Log in"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col justify-center p-6 sm:p-8 lg:p-12">
        <div className="md:hidden mb-8">
          <div className="flex items-center gap-2 mb-4">
            <img
              src={logoImage}
              alt="FELLAH Logo"
              className="h-16 w-auto mb-4"
            />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

// Client Dashboard Layout
function ClientDashboardLayout({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <ClientSidebar />
      <div style={{ marginLeft: '200px' }}>
        <ClientHeader user={user} />
        {children}
      </div>
    </>
  );
}

// Producer Dashboard Layout
function ProducerDashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('products');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handlePageChange = (page) => {
    setActivePage(page);
    navigate(`/producer/${page}`);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Sidebar activePage={activePage} onPageChange={handlePageChange} />
      <div style={{ marginLeft: '200px' }}>
        <Header user={user} />
        {children}
      </div>
    </>
  );
}

export default function App() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState("consumer");

  const handleSignupComplete = (data) => {
    navigate("/signup-secondary");
  };

  const handleSecondaryComplete = () => {
    navigate("/login");
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          <LandingPage
            onNavigateToLogin={() => navigate("/login")}
            onNavigateToSignup={() => navigate("/signup")}
            onNavigateToProducts={() => navigate("/products")}
            onNavigateToStores={() => navigate("/stores")}
          />
        } 
      />
      <Route 
        path="/products" 
        element={
          <ProductsPage
            onNavigateToHome={() => navigate("/")}
            onNavigateToLogin={() => navigate("/login")}
            onNavigateToSignup={() => navigate("/signup")}
            onNavigateToStores={() => navigate("/stores")}
          />
        } 
      />
      <Route 
        path="/stores" 
        element={
          <StoresPage
            onNavigateToHome={() => navigate("/")}
            onNavigateToLogin={() => navigate("/login")}
            onNavigateToSignup={() => navigate("/signup")}
            onNavigateToProducts={() => navigate("/products")}
          />
        } 
      />
      <Route 
        path="/subscriptions" 
        element={<BrowseSubscriptionBasketsPage />} 
      />
      
      {/* Auth Routes */}
      <Route 
        path="/login" 
        element={
          <AuthLayout mode="login">
            <LoginForm onSignupClick={() => navigate("/signup")} />
          </AuthLayout>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <AuthLayout mode="signup">
            <SignupForm
              onBackToLogin={() => navigate("/login")}
              onSignupComplete={handleSignupComplete}
              onUserTypeChange={setUserType}
            />
          </AuthLayout>
        } 
      />
      <Route 
        path="/signup-secondary" 
        element={
          <div className="flex min-h-screen bg-background">
             <div className="w-full">
               <SignupSecondaryForm
                  userType={userType}
                  onComplete={handleSecondaryComplete}
                />
             </div>
          </div>
        } 
      />

      {/* Client Dashboard Routes */}
      <Route 
        path="/client/cart" 
        element={
          <ClientDashboardLayout>
            <ClientCartPage />
          </ClientDashboardLayout>
        } 
      />
      <Route 
        path="/client/orders" 
        element={
          <ClientDashboardLayout>
            <ClientOrdersPage />
          </ClientDashboardLayout>
        } 
      />
      <Route 
        path="/client/profile" 
        element={
          <ClientDashboardLayout>
            <ClientProfilePage />
          </ClientDashboardLayout>
        } 
      />
      <Route 
        path="/client/notifications" 
        element={
          <ClientDashboardLayout>
            <ClientNotificationsPage />
          </ClientDashboardLayout>
        } 
      />
      <Route 
        path="/client/subscriptions" 
        element={
          <ClientDashboardLayout>
            <ClientWeeklyBasketPage />
          </ClientDashboardLayout>
        } 
      />

      {/* Producer Dashboard Routes */}
      <Route 
        path="/producer/products" 
        element={
          <ProducerDashboardLayout>
            <ProducerProductsPage />
          </ProducerDashboardLayout>
        } 
      />
      <Route 
        path="/producer/orders" 
        element={
          <ProducerDashboardLayout>
            <ProducerOrdersPage />
          </ProducerDashboardLayout>
        } 
      />
      <Route 
        path="/producer/profile" 
        element={
          <ProducerDashboardLayout>
            <ProducerProfilePage />
          </ProducerDashboardLayout>
        } 
      />
      <Route 
        path="/producer/notifications" 
        element={
          <ProducerDashboardLayout>
            <ProducerNotificationsPage />
          </ProducerDashboardLayout>
        } 
      />
      <Route 
        path="/producer/baskets" 
        element={
          <ProducerDashboardLayout>
            <WeeklyBasketPage />
          </ProducerDashboardLayout>
        } 
      />

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}