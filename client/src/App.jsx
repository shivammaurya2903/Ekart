import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import CategoryStrip from './components/CategoryStrip';
import CompareBar from './components/CompareBar';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CompareProvider } from './context/CompareContext';
import AdminDashboardPage from './pages/AdminDashboardPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import ProductDetailPage from './pages/ProductDetailPage';
import RegisterPage from './pages/RegisterPage';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const Footer = () => (
  <footer className="mt-8 bg-flipkart-darkBlue text-white">
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-xs sm:grid-cols-4">
      <div>
        <p className="text-base font-bold italic">EKart</p>
        <p className="mt-2 text-gray-400">Price intelligence built into every purchase.</p>
      </div>
      <div>
        <p className="font-bold">ABOUT</p>
        <p className="mt-2 text-gray-400">Contact Us</p>
        <p className="mt-1 text-gray-400">About Us</p>
        <p className="mt-1 text-gray-400">Careers</p>
      </div>
      <div>
        <p className="font-bold">HELP</p>
        <p className="mt-2 text-gray-400">Payments</p>
        <p className="mt-1 text-gray-400">Shipping</p>
        <p className="mt-1 text-gray-400">Returns &amp; Refunds</p>
      </div>
      <div>
        <p className="font-bold">SHOP</p>
        <Link to="/" className="mt-2 block text-gray-400 hover:text-white">All Products</Link>
        <Link to="/cart" className="mt-1 block text-gray-400 hover:text-white">My Cart</Link>
        <Link to="/admin" className="mt-1 block text-gray-400 hover:text-white">Admin</Link>
      </div>
    </div>
    <div className="border-t border-white/10 py-4 text-center text-[11px] text-gray-400">
      © 2026 EKart. Demo storefront with Razorpay Test Mode and full offline fallback.
    </div>
  </footer>
);

const AppShell = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <CategoryStrip />
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/product/:productId" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </main>
    <Footer />
    <CompareBar />
  </div>
);

const App = () => (
  <AuthProvider>
    <CartProvider>
      <CompareProvider>
        <AppShell />
      </CompareProvider>
    </CartProvider>
  </AuthProvider>
);

export default App;
