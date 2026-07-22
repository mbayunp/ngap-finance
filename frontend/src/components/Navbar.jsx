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
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 h-16 flex items-center justify-between px-4 lg:px-8 shrink-0 transition-all">
      {/* Left Section: Mobile Menu, Logo & Current Page Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 md:hidden transition-colors"
          aria-label="Open Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
          {currentTitle}
        </h2>
      </div>
    </header>
  );
};

export default Navbar;