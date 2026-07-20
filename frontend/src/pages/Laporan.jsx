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
    const { pendapatan, hpp, labaKotor, opex, labaBersih, rincianBeban } = profitLossData;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center border-b border-gray-100 pb-4">
          Laporan Laba Rugi
          <p className="text-sm font-normal text-gray-500 mt-1">Periode: {startStr} s/d {endStr}</p>
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <tbody className="text-sm divide-y divide-gray-100">
                
                <tr className="bg-gray-50/80">
                  <td colSpan="2" className="px-6 py-3 font-bold text-gray-800">PENDAPATAN & BEBAN POKOK</td>
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 pl-10 text-gray-700 font-medium">Pendapatan Usaha</td>
                  <td className="px-6 py-3 text-right font-medium text-gray-900">{formatIDR(pendapatan)}</td>
                </tr>
                <tr className="hover:bg-gray-50/50">
                  <td className="px-6 py-3 pl-10 text-gray-700 font-medium">Harga Pokok Penjualan (HPP)</td>
                  <td className="px-6 py-3 text-right font-medium text-red-600">({formatIDR(hpp)})</td>
                </tr>
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="px-6 py-4 font-bold text-gray-800 uppercase">Laba Kotor</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">{formatIDR(labaKotor)}</td>
                </tr>

                <tr className="bg-gray-50/80 mt-4 border-t-4 border-white">
                  <td colSpan="2" className="px-6 py-3 font-bold text-gray-800">BEBAN OPERASIONAL</td>
                </tr>
                {rincianBeban && rincianBeban.length > 0 ? (
                  rincianBeban.map((beban, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="px-6 py-2 pl-10 text-gray-700">{beban.account_name}</td>
                      <td className="px-6 py-2 text-right font-medium text-gray-800">{formatIDR(beban.total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-2 pl-10 text-gray-400 italic">Tidak ada rincian beban</td>
                    <td className="px-6 py-2 text-right text-gray-400">-</td>
                  </tr>
                )}
                <tr className="border-b-2 border-gray-200">
                  <td className="px-6 py-3 pl-10 font-semibold text-gray-700 text-right">Total Beban Operasional</td>
                  <td className="px-6 py-3 text-right font-bold text-red-600">({formatIDR(opex)})</td>
                </tr>

                <tr className={`border-t border-gray-300 ${labaBersih >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                  <td className="px-6 py-5 font-bold text-xl text-gray-900 uppercase">LABA BERSIH</td>
                  <td className={`px-6 py-5 text-right font-bold text-2xl ${labaBersih >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatIDR(labaBersih)}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderArusKas = () => {
    if (!cashFlowData) return null;
    const { 
      saldoAwal, 
      operasional, 
      investasi, 
      pendanaan, 
      totalOperasional, 
      totalInvestasi, 
      totalPendanaan, 
      netCashFlow, 
      saldoAkhir 
    } = cashFlowData;

    const renderTableGroup = (title, data, subtotal, isLast = false) => (
      <>
        <tr className="bg-gray-50/80">
          <td colSpan="2" className="px-6 py-3 font-bold text-gray-800">{title}</td>
        </tr>
        {data && data.length > 0 ? (
          data.map((item, idx) => (
            <tr key={idx} className="hover:bg-gray-50/50">
              <td className="px-6 py-2 pl-10 text-gray-700">{item.account_name}</td>
              <td className="px-6 py-2 text-right font-medium text-gray-800">{formatIDR(item.net)}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td className="px-6 py-2 pl-10 text-gray-400 italic">Tidak ada transaksi</td>
            <td className="px-6 py-2 text-right text-gray-400">-</td>
          </tr>
        )}
        <tr className={!isLast ? "border-b border-gray-200" : ""}>
          <td className="px-6 py-3 font-semibold text-gray-700 pl-10 text-right">Jumlah Kas Tersedia Dari {title.substring(17)}</td>
          <td className="px-6 py-3 text-right font-bold text-gray-900 border-t border-gray-200">{formatIDR(subtotal)}</td>
        </tr>
      </>
    );

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center border-b border-gray-100 pb-4">
          Laporan Arus Kas
          <p className="text-sm font-normal text-gray-500 mt-1">Periode: {startStr} s/d {endStr}</p>
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
            <table className="w-full text-left border-collapse">
              <tbody className="text-sm divide-y divide-gray-100">
                
                {/* Saldo Awal */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 font-bold text-lg text-gray-800">SALDO AWAL KAS</td>
                  <td className="px-6 py-4 text-right font-bold text-lg text-gray-900">{formatIDR(saldoAwal)}</td>
                </tr>

                {/* Group Operasional */}
                {renderTableGroup("A. Arus Kas Dari Kegiatan Operasional", operasional, totalOperasional)}

                {/* Group Investasi */}
                {renderTableGroup("B. Arus Kas Dari Kegiatan Investasi", investasi, totalInvestasi)}

                {/* Group Pendanaan */}
                {renderTableGroup("C. Arus Kas Dari Kegiatan Pendanaan", pendanaan, totalPendanaan, true)}

                {/* Net Cash Flow */}
                <tr className="bg-gray-50 border-t-2 border-gray-300">
                  <td className="px-6 py-4 font-bold text-gray-800">PERGERAKAN BERSIH ATAS KAS (A+B+C)</td>
                  <td className={`px-6 py-4 text-right font-bold ${netCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatIDR(netCashFlow)}
                  </td>
                </tr>

                {/* Saldo Akhir */}
                <tr className="bg-gray-100 border-t border-gray-300">
                  <td className="px-6 py-5 font-bold text-xl text-gray-900 uppercase">SALDO AKHIR KAS</td>
                  <td className="px-6 py-5 text-right font-bold text-2xl text-blue-800">{formatIDR(saldoAkhir)}</td>
                </tr>

              </tbody>
            </table>
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
