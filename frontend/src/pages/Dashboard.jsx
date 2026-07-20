import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, CreditCard, Loader2 } from 'lucide-react';

const Dashboard = () => {
  // State untuk menyimpan data dinamis
  const [summaryData, setSummaryData] = useState({
    total_kas: 0,
    piutang_aktif: 0,
    penjualan_bulan_ini: 0
  });
  const [channelData, setChannelData] = useState([]);
  const [recentActivities, setRecentActivities] = useState({ recentSales: [], recentPurchases: [], recentIncomes: [] });
  const [cashFlow, setCashFlow] = useState({ cashIn: 0, cashOut: 0, netCashFlow: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data dari API Backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Menembak 4 endpoint secara paralel untuk efisiensi
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];
        
        const [summaryResponse, channelResponse, recentResponse, cashFlowResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/summary`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/channel-analysis`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/recent-activities`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/reports/cash-flow?startDate=${startDate}&endDate=${endDate}`)
        ]);

        // Pastikan response status adalah 'success' (mengikuti format JSON standar backend kita)
        if (summaryResponse.data.status === 'success') {
          setSummaryData({
            total_kas: summaryResponse.data.data.total_kas || 0,
            piutang_aktif: summaryResponse.data.data.piutang_aktif || 0,
            penjualan_bulan_ini: summaryResponse.data.data.penjualan_bulan_ini || 0,
            totalKasMasuk: summaryResponse.data.data.totalKasMasuk || 0,
            totalKasKeluar: summaryResponse.data.data.totalKasKeluar || 0
          });
        }

        if (channelResponse.data.status === 'success') {
          setChannelData(channelResponse.data.data || []);
        }

        if (recentResponse.data.status === 'success') {
          setRecentActivities(recentResponse.data.data);
        }
        
        if (cashFlowResponse.data.status === 'success') {
          setCashFlow(cashFlowResponse.data.data);
        }

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Gagal memuat data dari server. Pastikan backend sedang berjalan.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fungsi utilitas untuk format Rupiah
  const formatIDR = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Tampilan saat Loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Memuat data dashboard...</p>
      </div>
    );
  }

  // Tampilan saat Error
  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg shadow-sm border border-red-100">
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Analisis</h1>
        <p className="text-gray-500 mt-1">Ringkasan performa dan profitabilitas bisnis Ngap Finance.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center transition-transform hover:-translate-y-1 duration-200">
          <div className="p-4 rounded-full bg-red-50 text-red-600 mr-5">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Kas Saat Ini</p>
            <p className="text-2xl font-bold text-gray-900">{formatIDR(summaryData.total_kas)}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center transition-transform hover:-translate-y-1 duration-200">
          <div className="p-4 rounded-full bg-orange-50 text-orange-600 mr-5">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Piutang Platform Aktif</p>
            <p className="text-2xl font-bold text-gray-900">{formatIDR(summaryData.piutang_aktif)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center transition-transform hover:-translate-y-1 duration-200">
          <div className="p-4 rounded-full bg-emerald-50 text-emerald-600 mr-5">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Penjualan Bulan Ini</p>
            <p className="text-2xl font-bold text-gray-900">{formatIDR(summaryData.penjualan_bulan_ini)}</p>
          </div>
        </div>
      </div>

      {/* Arus Kas Bulan Ini */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Arus Kas Bulan Ini</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-xl border border-green-100 bg-green-50 flex flex-col justify-center">
            <p className="text-sm font-medium text-green-600 mb-1">Total Kas Masuk</p>
            <p className="text-2xl font-bold text-green-700">{formatIDR(summaryData.totalKasMasuk || 0)}</p>
          </div>
          <div className="p-5 rounded-xl border border-red-100 bg-red-50 flex flex-col justify-center">
            <p className="text-sm font-medium text-red-600 mb-1">Total Kas Keluar</p>
            <p className="text-2xl font-bold text-red-700">{formatIDR(summaryData.totalKasKeluar || 0)}</p>
          </div>
          <div className="p-5 rounded-xl border border-blue-100 bg-blue-50 flex flex-col justify-center">
            <p className="text-sm font-medium text-blue-600 mb-1">Net Cash Flow</p>
            <p className="text-2xl font-bold text-blue-700">{formatIDR((summaryData.totalKasMasuk || 0) - (summaryData.totalKasKeluar || 0))}</p>
          </div>
        </div>
      </div>

      {/* Channel Analysis Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">Analisis Margin per Channel</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Channel</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Gross Revenue</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Total HPP</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Net Settlement</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Margin (%)</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {channelData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data analisis channel.
                  </td>
                </tr>
              ) : (
                channelData.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800">{row.channel_name}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{formatIDR(row.total_gross_revenue)}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{formatIDR(row.total_hpp)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-red-600">{formatIDR(row.net_settlement)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        parseFloat(row.margin_percentage) > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {row.margin_percentage}%
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* 5 Penjualan Terakhir */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-50 pb-2">5 Penjualan Terakhir</h3>
          <ul className="space-y-3">
            {recentActivities.recentSales.length === 0 ? (
              <li className="text-sm text-gray-500">Tidak ada aktivitas.</li>
            ) : (
              recentActivities.recentSales.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-gray-700">{item.channel_name}</p>
                    <p className="text-xs text-gray-400">{new Date(item.transaction_date).toLocaleDateString('id-ID')}</p>
                  </div>
                  <span className="font-semibold text-gray-800">{formatIDR(item.net_settlement)}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* 5 Pengeluaran/Pembelian Terakhir */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-50 pb-2">5 Pengeluaran Terakhir</h3>
          <ul className="space-y-3">
            {recentActivities.recentPurchases.length === 0 ? (
              <li className="text-sm text-gray-500">Tidak ada aktivitas.</li>
            ) : (
              recentActivities.recentPurchases.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-gray-700 truncate w-32" title={item.account_name}>{item.account_name}</p>
                    <p className="text-xs text-gray-400">{new Date(item.transaction_date).toLocaleDateString('id-ID')}</p>
                  </div>
                  <span className="font-semibold text-red-600">-{formatIDR(item.cash_out)}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* 5 Pemasukan Kas Terakhir */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-50 pb-2">5 Pemasukan Kas Terakhir</h3>
          <ul className="space-y-3">
            {recentActivities.recentIncomes.length === 0 ? (
              <li className="text-sm text-gray-500">Tidak ada aktivitas.</li>
            ) : (
              recentActivities.recentIncomes.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center text-sm">
                  <div>
                    <p className="font-medium text-gray-700 truncate w-32" title={item.account_name}>{item.account_name}</p>
                    <p className="text-xs text-gray-400">{new Date(item.transaction_date).toLocaleDateString('id-ID')}</p>
                  </div>
                  <span className="font-semibold text-green-600">+{formatIDR(item.cash_in)}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
