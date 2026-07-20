import { NavLink } from 'react-router-dom';
import { Home, DollarSign, ShoppingCart, CreditCard, BarChart2, Package, LayoutGrid, X } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'Penjualan', path: '/sales', icon: <DollarSign className="w-5 h-5" /> },
    { name: 'Pemasukan Lain', path: '/incomes', icon: <DollarSign className="w-5 h-5" /> },
    { name: 'Pembelian', path: '/purchases', icon: <ShoppingCart className="w-5 h-5" /> },
    { name: 'Pengeluaran', path: '/expenses', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Laporan', path: '/reports', icon: <BarChart2 className="w-5 h-5" /> },
    { name: 'Master Produk', path: '/products', icon: <Package className="w-5 h-5" /> },
    { name: 'Master Channel', path: '/channels', icon: <LayoutGrid className="w-5 h-5" /> },
    { name: 'Master Kategori', path: '/categories', icon: <LayoutGrid className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 h-screen flex flex-col z-50 transform transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-red-600 tracking-tight flex-1 text-center md:text-left">Ngap Finance</h1>
          <button 
            className="md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded-md"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-3 py-6 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)} // Close sidebar on click (mobile)
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-red-50 text-red-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`mr-3 ${isActive ? 'text-red-600' : 'text-gray-400'}`}>
                      {item.icon}
                    </span>
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="p-4 border-t border-gray-100 text-xs text-gray-400 text-center">
          © 2026 Ngap Finance v1.0
        </div>
      </div>
    </>
  );
};

export default Sidebar;
