import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await login({ email, password });
      const destination = location.state && location.state.from ? location.state.from.pathname : '/';
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to log in.');
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 py-6 lg:grid-cols-[1fr_360px]">
      <form onSubmit={submit} className="rounded-sm bg-white p-6 shadow-card sm:p-8">
        <h1 className="text-xl font-bold text-gray-900">Login</h1>
        <p className="mt-1 text-sm text-gray-500">Access your cart, price alerts orders and admin tools.</p>

        {error && (
          <div className="mt-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="h-11 w-full rounded-sm border border-gray-300 px-3 text-sm outline-none focus:border-flipkart-blue"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="h-11 w-full rounded-sm border border-gray-300 px-3 text-sm outline-none focus:border-flipkart-blue"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-flipkart-orange py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-60"
        >
          <LockKeyhole size={17} />
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          New to EKart?{' '}
          <Link to="/register" className="font-bold text-flipkart-blue hover:underline">
            Register
          </Link>
        </p>
      </form>

      <aside className="h-fit rounded-sm bg-white p-5 shadow-card">
        <h2 className="text-sm font-bold text-gray-900">Demo accounts</h2>
        <p className="mt-1 text-xs text-gray-500">Works with the backend or in full offline mode.</p>

        <div className="mt-4 space-y-3">
          <button
            type="button"
            onClick={() => {
              setEmail('admin@ekart.com');
              setPassword('Admin@123');
            }}
            className="w-full rounded-sm border border-gray-200 p-3 text-left hover:border-flipkart-blue"
          >
            <p className="text-xs font-bold text-flipkart-blue">Admin</p>
            <p className="mt-1 text-xs text-gray-600">admin@ekart.com / Admin@123</p>
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail('user@ekart.com');
              setPassword('User@123');
            }}
            className="w-full rounded-sm border border-gray-200 p-3 text-left hover:border-flipkart-blue"
          >
            <p className="text-xs font-bold text-flipkart-blue">Customer</p>
            <p className="mt-1 text-xs text-gray-600">user@ekart.com / User@123</p>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default LoginPage;
