import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, TrendingUp, TrendingDown, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import Swal from 'sweetalert2';

const Laporan = () => {
  const [activeTab, setActiveTab] = useState('laba-rugi'); // 'laba-rugi' | 'arus-kas'
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const y = currentDate.getFullYear();
  const m = String(currentDate.getMonth() + 1).padStart(2, '0');
  
  const startStr = `${y}-${m}-01`;
  const lastDay = new Date(y, currentDate.getMonth() + 1, 0).getDate();
  const endStr = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;

  const [profitLossData, setProfitLossData] = useState(null);
  const [cashFlowData, setCashFlowData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async (start, end, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const [plRes, cfRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/reports/profit-loss?startDate=${start}&endDate=${end}`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/reports/cash-flow?startDate=${start}&endDate=${end}`)
      ]);
      
      if (plRes.data.status === 'success') {
        setProfitLossData(plRes.data.data);
      }
      if (cfRes.data.status === 'success') {
        setCashFlowData(cfRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal mengambil data laporan. Pastikan backend berjalan.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports(startStr, endStr, true);
    }, 0);
    return () => clearTimeout(timer);
  }, [startStr, endStr]);

  const monthYearString = currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const formatIDR = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const renderLabaRugi = () => {
    if (!profitLossData) return null;
    const { pendapatan, hpp, labaKotor, opex, labaBersih } = profitLossData;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center border-b border-gray-100 pb-4">
          Laporan Laba Rugi (Accrual Basis)
          <p className="text-sm font-normal text-gray-500 mt-1">Periode: {startStr} s/d {endStr}</p>
        </h2>
        
        <div className="space-y-4 max-w-3xl mx-auto">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700 font-medium">Pendapatan Kotor (Penjualan)</span>
            <span className="text-gray-900 font-semibold">{formatIDR(pendapatan)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100 pb-4">
            <span className="text-gray-700 font-medium">Harga Pokok Penjualan (HPP)</span>
            <span className="text-red-600 font-semibold">({formatIDR(hpp)})</span>
          </div>
          <div className="flex justify-between items-center py-3 bg-gray-50 px-4 rounded-lg">
            <span className="text-gray-800 font-bold">Laba Kotor</span>
            <span className="text-gray-900 font-bold">{formatIDR(labaKotor)}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 pt-4 border-b border-gray-100 pb-4">
            <span className="text-gray-700 font-medium">Total Beban Operasional (OPEX) & Komisi</span>
            <span className="text-red-600 font-semibold">({formatIDR(opex)})</span>
          </div>
          
          <div className={`flex justify-between items-center py-4 px-4 rounded-lg mt-6 shadow-sm ${labaBersih >= 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <span className={`font-bold text-lg ${labaBersih >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              Laba Bersih
            </span>
            <span className={`font-bold text-xl ${labaBersih >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatIDR(labaBersih)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const renderArusKas = () => {
    if (!cashFlowData) return null;
    const { cashIn, cashOut, netCashFlow, details } = cashFlowData;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center border-b border-gray-100 pb-4">
          Laporan Arus Kas
          <p className="text-sm font-normal text-gray-500 mt-1">Periode: {startStr} s/d {endStr}</p>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-8">
          <div className="bg-green-50 border border-green-100 p-5 rounded-xl flex items-center shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg mr-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium mb-1">Total Kas Masuk</p>
              <h3 className="text-xl font-bold text-green-800">{formatIDR(cashIn)}</h3>
            </div>
          </div>
          <div className="bg-red-50 border border-red-100 p-5 rounded-xl flex items-center shadow-sm hover:shadow-md transition-shadow">
            <div className="p-3 bg-red-100 text-red-600 rounded-lg mr-4">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium mb-1">Total Kas Keluar</p>
              <h3 className="text-xl font-bold text-red-800">{formatIDR(cashOut)}</h3>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <div className={`flex justify-between items-center p-6 rounded-xl border shadow-sm ${netCashFlow >= 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
            <div className="flex items-center">
              <DollarSign className={`w-8 h-8 mr-3 ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <span className={`font-bold text-lg ${netCashFlow >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                Net Cash Flow
              </span>
            </div>
            <span className={`font-bold text-2xl ${netCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatIDR(netCashFlow)}
            </span>
          </div>
        </div>

        {/* Tabel Rincian Arus Kas */}
        {details && details.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-100 pb-2">Rincian per Kategori Akun</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-sm">
                    <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">Nama Akun</th>
                    <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs">Tipe</th>
                    <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs text-right">Pemasukan</th>
                    <th className="px-6 py-3 font-medium uppercase tracking-wider text-xs text-right">Pengeluaran</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-100">
                  {details.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-gray-800 font-medium">{item.account_name}</td>
                      <td className="px-6 py-4 text-gray-500">
                        <span className={`px-2 py-1 rounded text-xs ${item.account_type === 'REVENUE' ? 'bg-blue-100 text-blue-700' : item.account_type === 'EXPENSE' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'}`}>
                          {item.account_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-green-600 font-medium">{formatIDR(item.total_in)}</td>
                      <td className="px-6 py-4 text-right text-red-600 font-medium">{formatIDR(item.total_out)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
        <p className="text-gray-500 mt-1">Analisis performa keuangan bisnis Anda dengan detail laporan.</p>
      </div>

      {/* Filter Card / Navigasi Bulan */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <button 
          onClick={prevMonth}
          className="p-2 flex items-center text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          <span className="hidden sm:inline font-medium">Bulan Sebelumnya</span>
        </button>
        
        <h2 className="text-xl font-bold text-gray-800">
          {monthYearString}
        </h2>
        
        <button 
          onClick={nextMonth}
          className="p-2 flex items-center text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span className="hidden sm:inline font-medium">Bulan Selanjutnya</span>
          <ChevronRight className="w-5 h-5 ml-1" />
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('laba-rugi')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'laba-rugi' 
              ? 'text-red-600' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Laba Rugi (Profit/Loss)
          {activeTab === 'laba-rugi' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('arus-kas')}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === 'arus-kas' 
              ? 'text-red-600' 
              : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          Arus Kas (Cash Flow)
          {activeTab === 'arus-kas' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></div>
          )}
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
            <Loader2 className="w-8 h-8 animate-spin text-red-500 mb-4" />
            <p className="text-gray-500">Mengkalkulasi laporan keuangan...</p>
          </div>
        ) : (
          <div className="mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === 'laba-rugi' ? renderLabaRugi() : renderArusKas()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Laporan;
