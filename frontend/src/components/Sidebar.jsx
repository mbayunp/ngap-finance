import { NavLink } from 'react-router-dom';
import { Home, DollarSign, ShoppingCart, CreditCard, BarChart2 } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'Penjualan', path: '/sales', icon: <DollarSign className="w-5 h-5" /> },
    { name: 'Pembelian', path: '/purchases', icon: <ShoppingCart className="w-5 h-5" /> },
    { name: 'Pengeluaran', path: '/expenses', icon: <CreditCard className="w-5 h-5" /> },
    { name: 'Laporan', path: '/reports', icon: <BarChart2 className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen hidden md:flex md:flex-col fixed shadow-sm">
      <div className="flex items-center justify-center h-16 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-red-600 tracking-tight">Ngap Finance</h1>
      </div>
      <div className="flex flex-col flex-1 overflow-y-auto">
        <nav className="flex-1 px-3 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
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
  );
};

export default Sidebar;
