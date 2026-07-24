import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  UserCheck,
  LogOut
} from 'lucide-react';
import Swal from 'sweetalert2';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirm = await Swal.fire({
      title: 'Keluar dari Sesi?',
      text: 'Anda akan keluar dari aplikasi Ngap Finance.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Keluar'
    });

    if (confirm.isConfirmed) {
      logout();
      navigate('/login', { replace: true });
    }
  };

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
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-white text-slate-700 h-screen flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-slate-200/80 shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Logo & Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-3">
            <img 
              src={`${import.meta.env.BASE_URL}logo.png`} 
              alt="Ngap Finance Logo" 
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center leading-none">
                Ngap<span className="text-rose-600 font-extrabold ml-1">Finance</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-1">Management Suite</p>
            </div>
          </div>
          <button 
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Links */}
        <div className="flex flex-col flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
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
                        ? 'bg-rose-50 text-rose-700 font-bold shadow-2xs border-l-4 border-rose-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`mr-3 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-rose-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}>
                        {item.icon}
                      </span>
                      <span className="truncate">{item.name}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Footer Admin User Profile & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center space-x-2.5 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs border border-rose-100 shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-slate-400 font-medium truncate font-mono">@{user?.username || 'admin'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0 ml-1"
              title="Keluar / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
