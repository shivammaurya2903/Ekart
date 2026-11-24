import { useNavigate, useSearchParams } from 'react-router-dom';
import { Headphones, Laptop, LayoutGrid, Smartphone, Watch, Footprints } from 'lucide-react';
import { CATEGORIES } from '../data/mockProducts';

const CATEGORY_ITEMS = [
  { label: 'All', icon: LayoutGrid },
  { label: 'Mobiles', icon: Smartphone },
  { label: 'Laptops', icon: Laptop },
  { label: 'Footwear', icon: Footprints },
  { label: 'Audio', icon: Headphones },
  { label: 'Accessories', icon: Watch }
];

const CategoryStrip = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'All';

  const selectCategory = (category) => {
    const nextParams = new URLSearchParams(searchParams);

    if (category === 'All') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', category);
    }

    const search = nextParams.toString();
    navigate(search ? `/?${search}` : '/');
  };

  return (
    <nav className="no-scrollbar border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-2 sm:px-4">
        {CATEGORY_ITEMS.filter((item) => CATEGORIES.includes(item.label)).map(({ label, icon: Icon }) => {
          const isActive = activeCategory === label;

          return (
            <button
              key={label}
              type="button"
              onClick={() => selectCategory(label)}
              className={`flex min-w-24 flex-col items-center gap-1 border-b-2 px-3 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                isActive
                  ? 'border-flipkart-blue text-flipkart-blue'
                  : 'border-transparent text-gray-700 hover:text-flipkart-blue'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default CategoryStrip;
