import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center rounded-sm bg-white py-20 shadow-card">
    <Compass size={48} className="text-gray-300" />
    <h1 className="mt-4 text-2xl font-bold text-gray-900">404 — Page not found</h1>
    <p className="mt-1 text-sm text-gray-500">The page you are looking for does not exist.</p>
    <Link to="/" className="mt-6 rounded-sm bg-flipkart-blue px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
      Back to Home
    </Link>
  </div>
);

export default NotFoundPage;
