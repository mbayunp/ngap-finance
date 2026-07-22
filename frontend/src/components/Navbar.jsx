import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

const routeTitleMap = {
  '/': 'Dashboard Overview',
  '/sales': 'Penjualan Harian',
  '/incomes': 'Pemasukan Lain-lain',
  '/purchases': 'Pembelian Bahan Baku',
  '/expenses': 'Pengeluaran Operasional',
  '/reports': 'Laporan Keuangan & Mutasi',
  '/products': 'Master Data Produk',
  '/channels': 'Master Data Channel',
  '/categories': 'Master Data Kategori (CoA)'
};

const Navbar = ({ onMenuClick }) => {
  const location = useLocation();
  const currentTitle = routeTitleMap[location.pathname] || 'Overview';

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center justify-between px-4 lg:px-8 shrink-0 transition-all">
      {/* Left Section: Mobile Menu, Logo & Current Page Title */}
      <div className="flex items-center space-x-3">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 md:hidden transition-colors cursor-pointer"
          aria-label="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <img 
          src={`${import.meta.env.BASE_URL}logo.png`} 
          alt="Logo" 
          className="h-8 w-auto mr-1"
        />

        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          {currentTitle}
        </h2>
      </div>
    </header>
  );
};

export default Navbar;