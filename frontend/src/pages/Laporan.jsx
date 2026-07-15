import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Filter, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const Laporan = () => {
  const [activeTab, setActiveTab] = useState('laba-rugi'); // 'laba-rugi' | 'arus-kas'
  
  // Default filter: awal bulan sampai hari ini
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const currentDay = today.toISOString().split('T')[0];
  
  const [filters, setFilters] = useState({
    startDate: firstDay,
    endDate: currentDay
  });
  
  const [profitLossData, setProfitLossData] = useState(null);
  const [cashFlowData, setCashFlowData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const { startDate, endDate } = filters;
      const [plRes, cfRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/reports/profit-loss?startDate=${startDate}&endDate=${endDate}`),
        axios.get(`http://localhost:5000/api/reports/cash-flow?startDate=${startDate}&endDate=${endDate}`)
      ]);
      
      if (plRes.data.status === 'success') {
        setProfitLossData(plRes.data.data);
      }
      if (cfRes.data.status === 'success') {
        setCashFlowData(cfRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      alert('Gagal mengambil data laporan. Pastikan backend berjalan.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports(false);
    }, 0);
    return () => clearTimeout(timer);
  });

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
          <p className="text-sm font-normal text-gray-500 mt-1">Periode: {filters.startDate} s/d {filters.endDate}</p>
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
    const { cashIn, cashOut, netCashFlow } = cashFlowData;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center border-b border-gray-100 pb-4">
          Laporan Arus Kas
          <p className="text-sm font-normal text-gray-500 mt-1">Periode: {filters.startDate} s/d {filters.endDate}</p>
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

        <div className="max-w-4xl mx-auto">
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
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan</h1>
        <p className="text-gray-500 mt-1">Analisis performa keuangan bisnis Anda dengan detail laporan.</p>
      </div>

      {/* Filter Card */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-end md:items-center gap-4">
        <div className="w-full md:w-auto">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Dari Tanggal</label>
          <input
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 text-gray-700"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
          />
        </div>
        <div className="w-full md:w-auto">
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Sampai Tanggal</label>
          <input
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 bg-gray-50 text-gray-700"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          />
        </div>
        <button
          onClick={fetchReports}
          disabled={isLoading}
          className="w-full md:w-auto px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-medium rounded-lg transition-colors flex items-center justify-center disabled:opacity-70 shadow-sm"
        >
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Filter className="w-4 h-4 mr-2" />}
          Terapkan Filter
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
