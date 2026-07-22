import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Loader2, 
  RefreshCw, 
  BarChart2, 
  PieChart, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

const Dashboard = () => {
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
  const [activeChartTab, setActiveChartTab] = useState('sales');
  const [hoveredBarIndex, setHoveredBarIndex] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const formatIDR = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const currentTrendList = activeChartTab === 'sales' ? trendData.salesTrend : trendData.cashTrend;
  
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
      <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin mb-4" />
        <p className="font-semibold text-sm text-slate-300">Memuat data real-time dashboard...</p>
        <p className="text-xs text-slate-500 mt-1">Mengambil analisis finansial & aktivitas terbaru</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-rose-950/40 text-rose-300 p-6 rounded-2xl border border-rose-800/60 max-w-md text-center shadow-2xl backdrop-blur-md">
          <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center mx-auto mb-3 text-rose-400">
            <Activity className="w-6 h-6" />
          </div>
          <p className="font-bold text-base text-rose-200 mb-1">Koneksi Server Terputus</p>
          <p className="text-xs text-rose-400/90 mb-5">{error}</p>
          <button
            onClick={() => fetchDashboardData()}
            className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-rose-900/40 transition-all cursor-pointer"
          >
            Coba Sinkronisasi Ulang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-scale">
      {/* Header & Status Real-time Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Executive Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Active Session
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Ringkasan performa finansial, arus kas, dan margin penjualan Ngap Finance.</p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
          <span className="flex items-center text-emerald-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping" />
            Live Sync
          </span>
          {lastUpdated && (
            <span className="text-slate-500 font-mono text-[11px]">
              {lastUpdated.toLocaleTimeString('id-ID')}
            </span>
          )}
          <div className="h-4 w-px bg-slate-800" />
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh Data Sekarang"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-rose-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Kas */}
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950 rounded-2xl border border-slate-800/80 p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Kas Saat Ini</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatIDR(summaryData.total_kas)}
            </p>
            <p className="text-[11px] text-slate-400 flex items-center">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 mr-1" /> Terverifikasi dari Buku Kas
            </p>
          </div>
        </div>

        {/* Card 2: Piutang Platform */}
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950 rounded-2xl border border-slate-800/80 p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Piutang Platform Aktif</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatIDR(summaryData.piutang_aktif)}
            </p>
            <p className="text-[11px] text-amber-400/90 font-medium">
              Menunggu pencairan dari platform
            </p>
          </div>
        </div>

        {/* Card 3: Penjualan Bulan Ini */}
        <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-slate-950 rounded-2xl border border-slate-800/80 p-6 relative overflow-hidden group hover:border-slate-700/80 transition-all duration-300 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Penjualan Bulan Ini</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {formatIDR(summaryData.penjualan_bulan_ini)}
            </p>
            <p className="text-[11px] text-emerald-400 font-medium flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5 text-emerald-400" /> Gross Revenue Bulan Berjalan
            </p>
          </div>
        </div>
      </div>

      {/* GRAFIK UTAMA TREN REALTIME DATA */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 p-6 space-y-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Tren Fluktuasi (30 Hari Terakhir)</h2>
              <p className="text-xs text-slate-400">Analisis visual perbandingan pergerakan nilai harian</p>
            </div>
          </div>

          {/* Toggle Tab Grafik */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveChartTab('sales')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeChartTab === 'sales'
                  ? 'bg-rose-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Penjualan (Gross vs Net)
            </button>
            <button
              onClick={() => setActiveChartTab('cash')}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                activeChartTab === 'cash'
                  ? 'bg-emerald-600 text-white shadow-md font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Arus Kas (Masuk vs Keluar)
            </button>
          </div>
        </div>

        {/* Indikator Legenda */}
        <div className="flex items-center space-x-6 text-xs font-medium text-slate-300">
          {activeChartTab === 'sales' ? (
            <>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-md bg-gradient-to-r from-rose-500 to-rose-600 shadow-sm"></span>
                <span>Pendapatan Kotor (Gross)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-md bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm"></span>
                <span>Pendapatan Bersih (Net)</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-md bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-sm"></span>
                <span>Kas Masuk</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-md bg-gradient-to-r from-rose-500 to-rose-600 shadow-sm"></span>
                <span>Kas Keluar</span>
              </div>
            </>
          )}
        </div>

        {/* Visualisasi Grafik Bar Real Data */}
        <div className="relative pt-6 pb-2">
          {currentTrendList.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              <Activity className="w-10 h-10 mb-2 text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">Belum ada data transaksi 30 hari terakhir.</p>
              <p className="text-xs text-slate-600">Catat transaksi baru di menu Penjualan atau Kas.</p>
            </div>
          ) : (
            <div className="h-72 flex items-end justify-start sm:justify-center space-x-3 overflow-x-auto overflow-y-visible pb-6 pt-10 px-2">
              {currentTrendList.map((item, idx) => {
                const val1 = activeChartTab === 'sales' ? item.gross_revenue : item.cash_in;
                const val2 = activeChartTab === 'sales' ? item.net_settlement : item.cash_out;

                const heightPct1 = Math.max(Math.round((val1 / maxChartVal) * 100), 6);
                const heightPct2 = Math.max(Math.round((val2 / maxChartVal) * 100), 6);

                const isHovered = hoveredBarIndex === idx;

                return (
                  <div
                    key={idx}
                    className="flex-1 min-w-[44px] max-w-[64px] flex flex-col items-center relative group"
                    onMouseEnter={() => setHoveredBarIndex(idx)}
                    onMouseLeave={() => setHoveredBarIndex(null)}
                  >
                    {/* Tooltip Floating */}
                    {isHovered && (
                      <div className="absolute bottom-full mb-3 z-40 bg-slate-950 text-white text-xs p-3 rounded-xl shadow-2xl pointer-events-none transition-all duration-200 border border-slate-700 left-1/2 -translate-x-1/2 min-w-[160px]">
                        <p className="font-bold text-slate-300 mb-1 border-b border-slate-800 pb-1 text-center font-mono">
                          {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        {activeChartTab === 'sales' ? (
                          <div className="space-y-1 font-semibold text-[11px]">
                            <p className="text-rose-400 flex justify-between">
                              <span>Gross:</span> <span>{formatIDR(val1)}</span>
                            </p>
                            <p className="text-emerald-400 flex justify-between">
                              <span>Net:</span> <span>{formatIDR(val2)}</span>
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-1 font-semibold text-[11px]">
                            <p className="text-emerald-400 flex justify-between">
                              <span>Kas Masuk:</span> <span>{formatIDR(val1)}</span>
                            </p>
                            <p className="text-rose-400 flex justify-between">
                              <span>Kas Keluar:</span> <span>{formatIDR(val2)}</span>
                            </p>
                          </div>
                        )}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950"></div>
                      </div>
                    )}

                    {/* Bar Container */}
                    <div className="w-full flex items-end justify-center space-x-1.5 h-48 bg-slate-950/60 rounded-t-xl p-1.5 border border-slate-800/60 group-hover:border-slate-700 transition-colors">
                      <div
                        style={{ height: `${heightPct1}%` }}
                        className={`w-1/2 rounded-t-md transition-all duration-300 ${
                          activeChartTab === 'sales' 
                            ? 'bg-gradient-to-t from-rose-700 to-rose-500 group-hover:from-rose-600 group-hover:to-rose-400' 
                            : 'bg-gradient-to-t from-emerald-700 to-emerald-500 group-hover:from-emerald-600 group-hover:to-emerald-400'
                        }`}
                      />
                      <div
                        style={{ height: `${heightPct2}%` }}
                        className={`w-1/2 rounded-t-md transition-all duration-300 ${
                          activeChartTab === 'sales' 
                            ? 'bg-gradient-to-t from-emerald-700 to-emerald-500 group-hover:from-emerald-600 group-hover:to-emerald-400' 
                            : 'bg-gradient-to-t from-rose-700 to-rose-500 group-hover:from-rose-600 group-hover:to-rose-400'
                        }`}
                      />
                    </div>

                    {/* Date Label */}
                    <span className="text-[10px] font-bold text-slate-400 mt-2 truncate w-full text-center group-hover:text-white transition-colors">
                      {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* CHANNEL SHARE & MARGIN ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget Left: Porsi Channel Penjualan */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 p-6 space-y-5 lg:col-span-1 shadow-xl">
          <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <PieChart className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white">Distribusi Channel</h2>
          </div>

          <div className="space-y-4">
            {channelData.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">Belum ada data analisis channel.</p>
            ) : (
              channelData.map((c, idx) => {
                const sharePct = totalRevenueAllChannels > 0
                  ? ((c.total_gross_revenue / totalRevenueAllChannels) * 100).toFixed(1)
                  : 0;

                const bgGradients = [
                  'from-rose-500 to-rose-600',
                  'from-indigo-500 to-indigo-600',
                  'from-emerald-500 to-emerald-600',
                  'from-amber-500 to-amber-600'
                ];
                const bgGradient = bgGradients[idx % bgGradients.length];

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{c.channel_name}</span>
                      <span className="text-slate-400">{sharePct}% <span className="text-slate-500">({formatIDR(c.total_gross_revenue)})</span></span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800/60">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${bgGradient} transition-all duration-700`}
                        style={{ width: `${sharePct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Widget Right: Tabel Analisis Margin Channel */}
        <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 overflow-hidden lg:col-span-2 shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
            <h2 className="text-base font-bold text-white">Analisis Margin per Channel</h2>
            <span className="text-xs text-slate-400">Rincian Revenue vs HPP</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="bg-slate-950/60 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
                  <th className="px-6 py-3.5">Channel</th>
                  <th className="px-6 py-3.5 text-right">Gross Revenue</th>
                  <th className="px-6 py-3.5 text-right">Total HPP</th>
                  <th className="px-6 py-3.5 text-right">Net Settlement</th>
                  <th className="px-6 py-3.5 text-right">Margin (%)</th>
                </tr>
              </thead>
              <tbody className="text-xs divide-y divide-slate-800/60">
                {channelData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                      Tidak ada data analisis channel.
                    </td>
                  </tr>
                ) : (
                  channelData.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-200">{row.channel_name}</td>
                      <td className="px-6 py-4 text-right text-slate-300 font-mono">{formatIDR(row.total_gross_revenue)}</td>
                      <td className="px-6 py-4 text-right text-rose-400 font-mono">{formatIDR(row.total_hpp)}</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-400 font-mono">{formatIDR(row.net_settlement)}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold border ${
                          parseFloat(row.margin_percentage) > 0 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
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

      {/* SUMMARY ARUS KAS BULAN INI */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 p-6 shadow-xl">
        <h2 className="text-base font-bold text-white mb-4">Ringkasan Arus Kas Bulan Ini</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex flex-col justify-center">
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">Total Kas Masuk</p>
            <p className="text-2xl font-black text-emerald-400 tracking-tight font-mono">{formatIDR(summaryData.totalKasMasuk || 0)}</p>
          </div>
          <div className="p-5 rounded-xl border border-rose-500/20 bg-rose-500/5 flex flex-col justify-center">
            <p className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">Total Kas Keluar</p>
            <p className="text-2xl font-black text-rose-400 tracking-tight font-mono">{formatIDR(summaryData.totalKasKeluar || 0)}</p>
          </div>
          <div className="p-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex flex-col justify-center">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Net Cash Flow</p>
            <p className="text-2xl font-black text-indigo-400 tracking-tight font-mono">
              {formatIDR((summaryData.totalKasMasuk || 0) - (summaryData.totalKasKeluar || 0))}
            </p>
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITIES FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 5 Penjualan Terakhir */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex justify-between items-center">
            <span>5 Penjualan Terakhir</span>
            <span className="text-[10px] text-slate-500 uppercase">Realtime</span>
          </h3>
          <ul className="space-y-3">
            {!recentActivities.recentSales || recentActivities.recentSales.length === 0 ? (
              <li className="text-xs text-slate-500 py-4 text-center">Belum ada transaksi.</li>
            ) : (
              recentActivities.recentSales.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div>
                    <p className="font-bold text-slate-200">{item.channel_name}</p>
                    <p className="text-[10px] text-slate-500">{new Date(item.transaction_date).toLocaleDateString('id-ID')}</p>
                  </div>
                  <span className="font-extrabold text-emerald-400 font-mono">+{formatIDR(item.net_settlement)}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* 5 Pengeluaran Terakhir */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex justify-between items-center">
            <span>5 Pengeluaran Terakhir</span>
            <span className="text-[10px] text-slate-500 uppercase">Realtime</span>
          </h3>
          <ul className="space-y-3">
            {!recentActivities.recentPurchases || recentActivities.recentPurchases.length === 0 ? (
              <li className="text-xs text-slate-500 py-4 text-center">Belum ada pengeluaran.</li>
            ) : (
              recentActivities.recentPurchases.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div>
                    <p className="font-bold text-slate-200 truncate w-32" title={item.account_name}>{item.account_name}</p>
                    <p className="text-[10px] text-slate-500">{new Date(item.transaction_date).toLocaleDateString('id-ID')}</p>
                  </div>
                  <span className="font-extrabold text-rose-400 font-mono">-{formatIDR(item.cash_out)}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* 5 Pemasukan Terakhir */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800/80 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex justify-between items-center">
            <span>5 Pemasukan Kas Terakhir</span>
            <span className="text-[10px] text-slate-500 uppercase">Realtime</span>
          </h3>
          <ul className="space-y-3">
            {!recentActivities.recentIncomes || recentActivities.recentIncomes.length === 0 ? (
              <li className="text-xs text-slate-500 py-4 text-center">Belum ada pemasukan.</li>
            ) : (
              recentActivities.recentIncomes.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <div>
                    <p className="font-bold text-slate-200 truncate w-32" title={item.account_name}>{item.account_name}</p>
                    <p className="text-[10px] text-slate-500">{new Date(item.transaction_date).toLocaleDateString('id-ID')}</p>
                  </div>
                  <span className="font-extrabold text-emerald-400 font-mono">+{formatIDR(item.cash_in)}</span>
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
