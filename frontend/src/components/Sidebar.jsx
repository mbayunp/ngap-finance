import { NavLink } from 'react-router-dom';
import { 
  Home, 
  TrendingUp, 
  PlusCircle, 
  ShoppingCart, 
  CreditCard, 
  BarChart3, 
  Package, 
  Radio, 
  Tags, 
  X,
  UserCheck
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const menuGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { name: 'Dashboard', path: '/', icon: <Home className="w-4 h-4" /> },
      ]
    },
    {
      title: 'TRANSAKSI',
      items: [
        { name: 'Penjualan', path: '/sales', icon: <TrendingUp className="w-4 h-4" /> },
        { name: 'Pemasukan Lain', path: '/incomes', icon: <PlusCircle className="w-4 h-4" /> },
        { name: 'Pembelian', path: '/purchases', icon: <ShoppingCart className="w-4 h-4" /> },
        { name: 'Pengeluaran', path: '/expenses', icon: <CreditCard className="w-4 h-4" /> },
      ]
    },
    {
      title: 'ANALISIS',
      items: [
        { name: 'Laporan Keuangan', path: '/reports', icon: <BarChart3 className="w-4 h-4" /> },
      ]
    },
    {
      title: 'DATA MASTER',
      items: [
        { name: 'Master Produk', path: '/products', icon: <Package className="w-4 h-4" /> },
        { name: 'Master Channel', path: '/channels', icon: <Radio className="w-4 h-4" /> },
        { name: 'Master Kategori', path: '/categories', icon: <Tags className="w-4 h-4" /> },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-300 h-screen flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-slate-800 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo & Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center space-x-3">
            <img 
              src={`${import.meta.env.BASE_URL}logo.png`} 
              alt="Ngap Finance Logo" 
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center leading-none">
                Ngap<span className="text-rose-500 font-extrabold ml-1">Finance</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase mt-1">Management Suite</p>
            </div>
          </div>
          <button 
            className="md:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Links */}
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                {group.title}
              </p>
              {group.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-all duration-200 relative ${
                      isActive
                        ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-md shadow-rose-900/30 font-bold'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`mr-3 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.name}</span>
                      {isActive && (
                        <span className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Footer Admin User Profile Card */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 shrink-0">
          <div className="flex items-center space-x-3 p-2 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs border border-rose-500/30">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">Administrator</p>
              <p className="text-[10px] text-slate-400 truncate">admin@ngapfinance.id</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
