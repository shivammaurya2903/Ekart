import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutDashboard, LogOut, Search, ShoppingCart, User } from 'lucide-react';
import { formatINR, getSuggestions } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }

      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleQueryChange = (value) => {
    setQuery(value);
    setSuggestions(getSuggestions(value));
    setShowSuggestions(Boolean(value.trim()));
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/?search=${encodeURIComponent(trimmed)}` : '/');
    setShowSuggestions(false);
  };

  const openSuggestion = (product) => {
    navigate(`/product/${product.id}`);
    setQuery('');
    setShowSuggestions(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const renderSearchBox = (mobile) => (
    <form
      ref={mobile ? null : searchRef}
      onSubmit={submitSearch}
      className={`relative ${mobile ? 'w-full' : 'flex-1 max-w-2xl mx-4'}`}
    >
      <div className="flex items-center bg-white rounded-sm shadow-sm overflow-hidden h-10">
        <input
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onFocus={() => setShowSuggestions(Boolean(query.trim()))}
          placeholder="Search for products, brands and more"
          aria-label="Search products"
          className="h-full flex-1 px-4 text-sm text-gray-800 outline-none placeholder:text-gray-400"
        />
        <button
          type="submit"
          aria-label="Search"
          className="h-full w-12 flex items-center justify-center text-flipkart-blue hover:bg-blue-50"
        >
          <Search size={20} />
        </button>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className={`absolute left-0 right-0 ${mobile ? 'top-11' : 'top-11'} z-50 bg-white text-gray-800 rounded-md shadow-cardHover border border-gray-100 overflow-hidden`}>
          {suggestions.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => openSuggestion(product)}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50"
            >
              <img src={product.images[0]} alt="" className="h-10 w-10 object-contain" />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium truncate">{product.name}</span>
                <span className="block text-xs text-gray-500">{product.category}</span>
              </span>
              <span className="text-sm font-semibold text-flipkart-blue">{formatINR(product.currentPrice)}</span>
            </button>
          ))}
        </div>
      )}
    </form>
  );

  return (
    <header className="sticky top-0 z-40 bg-flipkart-blue text-white shadow-nav">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center gap-3">
          <Link to="/" className="flex flex-col leading-none shrink-0">
            <span className="text-xl font-bold italic tracking-tight">EKart</span>
            <span className="text-[10px] font-semibold italic text-flipkart-plus">
              Explore <span className="text-white">Plus</span>
            </span>
          </Link>

          <div className="hidden md:flex flex-1">{renderSearchBox(false)}</div>

          <div className="ml-auto flex items-center gap-2">
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1 rounded-sm px-3 py-2 text-sm font-semibold hover:bg-blue-700"
              >
                <LayoutDashboard size={17} />
                Admin
              </Link>
            )}

            {isAuthenticated ? (
              <div ref={userRef} className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu((current) => !current)}
                  className="flex items-center gap-1 rounded-sm px-3 py-2 text-sm font-semibold hover:bg-blue-700"
                >
                  <User size={17} />
                  <span className="hidden sm:inline max-w-28 truncate">{user.name}</span>
                  <ChevronDown size={14} />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-11 z-50 w-56 rounded-md border border-gray-100 bg-white py-2 text-gray-800 shadow-cardHover">
                    <div className="px-4 pb-2 border-b border-gray-100">
                      <p className="text-sm font-semibold truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50"
                      >
                        <LayoutDashboard size={16} />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-50"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-sm bg-white px-6 py-1.5 text-sm font-semibold text-flipkart-blue hover:bg-blue-50"
              >
                Login
              </Link>
            )}

            <Link
              to="/cart"
              className="relative flex items-center gap-2 rounded-sm px-3 py-2 text-sm font-semibold hover:bg-blue-700"
            >
              <ShoppingCart size={18} />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-flipkart-orange px-1 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="pb-3 md:hidden">{renderSearchBox(true)}</div>
      </div>
    </header>
  );
};

export default Navbar;
