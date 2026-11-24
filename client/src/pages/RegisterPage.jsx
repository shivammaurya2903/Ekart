import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, loading } = useAuth();
  const [details, setDetails] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const updateField = (field) => (event) => {
    setDetails((current) => ({ ...current, [field]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await register(details);
      const destination = location.state && location.state.from ? location.state.from.pathname : '/';
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.message || 'Unable to register.');
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-sm bg-white p-6 shadow-card sm:p-8">
      <h1 className="text-xl font-bold text-gray-900">Create an account</h1>
      <p className="mt-1 text-sm text-gray-500">Register to track prices and place orders.</p>

      {error && (
        <div className="mt-4 rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Full name</span>
          <input
            type="text"
            required
            minLength="2"
            value={details.name}
            onChange={updateField('name')}
            className="h-11 w-full rounded-sm border border-gray-300 px-3 text-sm outline-none focus:border-flipkart-blue"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Email</span>
          <input
            type="email"
            required
            value={details.email}
            onChange={updateField('email')}
            className="h-11 w-full rounded-sm border border-gray-300 px-3 text-sm outline-none focus:border-flipkart-blue"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Password</span>
          <input
            type="password"
            required
            minLength="8"
            value={details.password}
            onChange={updateField('password')}
            className="h-11 w-full rounded-sm border border-gray-300 px-3 text-sm outline-none focus:border-flipkart-blue"
          />
          <span className="mt-1 block text-[11px] text-gray-500">Minimum 8 characters with at least one letter and one number.</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-sm bg-flipkart-orange py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-60"
        >
          <UserPlus size={17} />
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already registered?{' '}
        <Link to="/login" className="font-bold text-flipkart-blue hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;
