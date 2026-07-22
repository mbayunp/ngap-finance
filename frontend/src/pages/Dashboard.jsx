import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DollarSign, TrendingUp, CreditCard, Loader2, RefreshCw, BarChart2, PieChart, Activity } from 'lucide-react';

const Dashboard = () => {
  // State data dinamis
  const [summaryData, setSummaryData] = useState({
    total_kas: 0,
    piutang_aktif: 0,
    penjualan_bulan_ini: 0,
    totalKasMasuk: 0,
    totalKasKeluar: 0
  });
  const [channelData, setChannelData] = useState([]);
  const [recentActivities, setRecentActivities] = useState({ recentSales: [], recentPurchases: [], recentIncomes: [] });
  const [trendData, setTrendData] = useState({ salesTrend: [], cashTrend: [] });
  const [activeChartTab, setActiveChartTab] = useState('sales'); // 'sales' | 'cash'
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

  // Fetch Dashboard Data
  const fetchDashboardData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      else setIsRefreshing(true);

      const [summaryResponse, channelResponse, recentResponse, trendResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/summary`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/channel-analysis`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/recent-activities`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/sales-trend`)
      ]);

      if (summaryResponse.data && summaryResponse.data.status === 'success') {
        setSummaryData({
          total_kas: summaryResponse.data.data.total_kas || 0,
          piutang_aktif: summaryResponse.data.data.piutang_aktif || 0,
          penjualan_bulan_ini: summaryResponse.data.data.penjualan_bulan_ini || 0,
          totalKasMasuk: summaryResponse.data.data.totalKasMasuk || 0,
          totalKasKeluar: summaryResponse.data.data.totalKasKeluar || 0
        });
      }

      if (channelResponse.data && channelResponse.data.status === 'success') {
        setChannelData(channelResponse.data.data || []);
      }

      if (recentResponse.data && recentResponse.data.status === 'success') {
        setRecentActivities(recentResponse.data.data || { recentSales: [], recentPurchases: [], recentIncomes: [] });
      }

      if (trendResponse.data && trendResponse.data.status === 'success') {
        setTrendData(trendResponse.data.data || { salesTrend: [], cashTrend: [] });
      }

      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Gagal memuat data dari server. Pastikan backend sedang berjalan.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial Fetch & Real-time Auto-Polling (Setiap 10 Detik)
  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Util format IDR
  const formatIDR = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Kalkulasi data grafik
  const currentTrendList = activeChartTab === 'sales' ? trendData.salesTrend : trendData.cashTrend;
  
  // Nilai maksimum untuk skala grafik bar
  const maxChartVal = Math.max(
    ...currentTrendList.map(item => {
      if (activeChartTab === 'sales') {
        return Math.max(item.gross_revenue || 0, item.net_settlement || 0);
      } else {
        return Math.max(item.cash_in || 0, item.cash_out || 0);
      }
    }),
    100000
  );

  const totalRevenueAllChannels = channelData.reduce((sum, c) => sum + (c.total_gross_revenue || 0), 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[450px]">
        <Loader2 className="w-9 h-9 text-red-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium text-sm">Memuat data real-time dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="bg-red-50 text-red-600 p-5 rounded-xl shadow-sm border border-red-100 max-w-md text-center">
          <p className="font-semibold mb-2">Terjadi Kesalahan</p>
          <p className="text-sm text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-4 py-2 bg-red-600 text-white font-medium text-xs rounded-lg hover:bg-red-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Status Real-time */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Analisis</h1>
          <p className="text-gray-500 mt-1">Ringkasan performa dan profitabilitas bisnis Ngap Finance.</p>
        </div>

        <div className="flex items-center space-x-3 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm text-xs">
          <span className="flex items-center text-emerald-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping"></span>
            Realtime Live Sync
          </span>
          {lastUpdated && (
            <span className="text-gray-400">
              ({lastUpdated.toLocaleTimeString('id-ID')})
            </span>
          )}
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
            title="Refresh Data Sekarang"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center transition-all hover:shadow-md hover:-translate-y-0.5 duration-200">
          <div className="p-4 rounded-full bg-red-50 text-red-600 mr-5">
            <DollarSign className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Kas Saat Ini</p>
            <p className="text-2xl font-bold text-gray-900">{formatIDR(summaryData.total_kas)}</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center transition-all hover:shadow-md hover:-translate-y-0.5 duration-200">
          <div className="p-4 rounded-full bg-orange-50 text-orange-600 mr-5">
            <CreditCard className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Piutang Platform Aktif</p>
            <p className="text-2xl font-bold text-gray-900">{formatIDR(summaryData.piutang_aktif)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center transition-all hover:shadow-md hover:-translate-y-0.5 duration-200">
          <div className="p-4 rounded-full bg-emerald-50 text-emerald-600 mr-5">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Penjualan Bulan Ini</p>
            <p className="text-2xl font-bold text-gray-900">{formatIDR(summaryData.penjualan_bulan_ini)}</p>
          </div>
        </div>
      </div>

      {/* GRAFIK UTAMA REALTIME DATA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-gray-800">Grafik Tren Real-Time (30 Hari Terakhir)</h2>
          </div>

          {/* Toggle Tab Grafik */}
          <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveChartTab('sales')}
              className={`px-4 py-1.5 rounded-md transition-all ${
                activeChartTab === 'sales'
                  ? 'bg-white text-red-600 shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Penjualan (Gross vs Net)
            </button>
            <button
              onClick={() => setActiveChartTab('cash')}
              className={`px-4 py-1.5 rounded-md transition-all ${
                activeChartTab === 'cash'
                  ? 'bg-white text-blue-600 shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Arus Kas (Masuk vs Keluar)
            </button>
          </div>
        </div>

        {/* Indikator Legenda */}
        <div className="flex items-center space-x-6 text-xs font-medium text-gray-600">
          {activeChartTab === 'sales' ? (
            <>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-red-500"></span>
                <span>Pendapatan Kotor (Gross Revenue)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-emerald-500"></span>
                <span>Pendapatan Bersih (Net Settlement)</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-green-500"></span>
                <span>Kas Masuk</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded bg-red-400"></span>
                <span>Kas Keluar</span>
              </div>
            </>
          )}
        </div>

        {/* Visualisasi Grafik Bar Real Data */}
        <div className="relative pt-12 pb-2 overflow-visible">
          {currentTrendList.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 border border-dashed border-gray-200 rounded-xl">
              <Activity className="w-10 h-10 mb-2 text-gray-300" />
              <p className="text-sm font-medium">Belum ada riwayat transaksi dalam 30 hari terakhir.</p>
            </div>
          ) : (
            <div className="h-80 flex items-end justify-start sm:justify-center space-x-3 overflow-x-auto overflow-y-visible pb-6 pt-12 px-2">
              {currentTrendList.map((item, idx) => {
                const val1 = activeChartTab === 'sales' ? item.gross_revenue : item.cash_in;
                const val2 = activeChartTab === 'sales' ? item.net_settlement : item.cash_out;

                const heightPct1 = Math.max(Math.round((val1 / maxChartVal) * 100), 4);
                const heightPct2 = Math.max(Math.round((val2 / maxChartVal) * 100), 4);

                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={idx}
                    className="flex-1 min-w-[48px] max-w-[72px] flex flex-col items-center relative group"
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Tooltip Floating yang Jelas & Tidak Terpotong */}
                    {isHovered && (
                      <div className="absolute bottom-full mb-3 z-30 bg-gray-900 text-white text-xs p-3 rounded-xl shadow-2xl whitespace-nowrap pointer-events-none transition-all duration-200 animate-fadeIn border border-gray-700 left-1/2 -translate-x-1/2">
                        <p className="font-bold text-gray-300 mb-1 border-b border-gray-700 pb-1 text-center">
                          {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        {activeChartTab === 'sales' ? (
                          <div className="space-y-0.5 font-medium">
                            <p className="text-red-400">Gross: {formatIDR(val1)}</p>
                            <p className="text-emerald-400">Net: {formatIDR(val2)}</p>
                          </div>
                        ) : (
                          <div className="space-y-0.5 font-medium">
                            <p className="text-green-400">Kas Masuk: {formatIDR(val1)}</p>
                            <p className="text-red-400">Kas Keluar: {formatIDR(val2)}</p>
                          </div>
                        )}
                        {/* Panah Indikator Tooltip */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}

                    {/* Bar Group */}
                    <div className="w-full flex items-end justify-center space-x-1 h-52 bg-gray-50/70 rounded-t-xl p-1.5 border border-gray-100 group-hover:border-gray-200 transition-colors">
                      <div
                        style={{ height: `${heightPct1}%` }}
                        className={`w-1/2 rounded-t-md transition-all duration-300 ${
                          activeChartTab === 'sales' ? 'bg-red-500 group-hover:bg-red-600' : 'bg-green-500 group-hover:bg-green-600'
                        }`}
                      ></div>
                      <div
                        style={{ height: `${heightPct2}%` }}
                        className={`w-1/2 rounded-t-md transition-all duration-300 ${
                          activeChartTab === 'sales' ? 'bg-emerald-500 group-hover:bg-emerald-600' : 'bg-red-400 group-hover:bg-red-500'
                        }`}
                      ></div>
                    </div>

                    {/* Label Tanggal */}
                    <span className="text-xs font-semibold text-gray-500 mt-2 truncate w-full text-center group-hover:text-gray-900 transition-colors">
                      {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* DISTRIBUSI CHANNEL & MARGIN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visualisasi Porsi Channel Penjualan */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4 lg:col-span-1">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <PieChart className="w-5 h-5 text-red-600" />
            <h2 className="text-lg font-bold text-gray-800">Porsi Channel Penjualan</h2>
          </div>

          <div className="space-y-4 pt-2">
            {channelData.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Belum ada data channel.</p>
            ) : (
              channelData.map((c, idx) => {
                const sharePct = totalRevenueAllChannels > 0
                  ? ((c.total_gross_revenue / totalRevenueAllChannels) * 100).toFixed(1)
                  : 0;

                const colors = ['bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500'];
                const colorClass = colors[idx % colors.length];

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                      <span>{c.channel_name}</span>
                      <span>{sharePct}% ({formatIDR(c.total_gross_revenue)})</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
                        style={{ width: `${sharePct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Tabel Analisis Margin Channel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:col-span-2">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-800">Analisis Margin per Channel</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[550px]">
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

      {/* Recent Activities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* 5 Penjualan Terakhir */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 border-b border-gray-50 pb-2">5 Penjualan Terakhir</h3>
          <ul className="space-y-3">
            {!recentActivities.recentSales || recentActivities.recentSales.length === 0 ? (
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
            {!recentActivities.recentPurchases || recentActivities.recentPurchases.length === 0 ? (
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
            {!recentActivities.recentIncomes || recentActivities.recentIncomes.length === 0 ? (
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
