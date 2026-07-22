import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import Swal from 'sweetalert2';

const Laporan = () => {
  const [activeTab, setActiveTab] = useState('laba-rugi'); // 'laba-rugi' | 'arus-kas' | 'detail'
  
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const y = currentDate.getFullYear();
  const m = String(currentDate.getMonth() + 1).padStart(2, '0');
  
  const startStr = `${y}-${m}-01`;
  const lastDay = new Date(y, currentDate.getMonth() + 1, 0).getDate();
  const endStr = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;

  const [profitLossData, setProfitLossData] = useState(null);
  const [cashFlowData, setCashFlowData] = useState(null);
  const [cashDetailData, setCashDetailData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async (start, end, showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const [plRes, cfRes, cdRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/reports/profit-loss?startDate=${start}&endDate=${end}`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/reports/cash-flow?startDate=${start}&endDate=${end}`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/reports/cash-detail?startDate=${start}&endDate=${end}`)
      ]);
      
      if (plRes.data && plRes.data.status === 'success') {
        setProfitLossData(plRes.data.data);
      }
      if (cfRes.data && cfRes.data.status === 'success') {
        setCashFlowData(cfRes.data.data);
      }
      if (cdRes.data && cdRes.data.status === 'success') {
        setCashDetailData(cdRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal mengambil data laporan. Pastikan backend berjalan.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(startStr, endStr, true);
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
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 lg:p-8 shadow-xs space-y-6">
        <div className="text-center border-b border-slate-100 pb-5">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">
            Laporan Laba Rugi (Profit & Loss Statement)
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">Periode: {startStr} s/d {endStr}</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left border-collapse">
              <tbody className="text-xs divide-y divide-slate-100">
                
                <tr className="bg-slate-50">
                  <td colSpan="2" className="px-6 py-3.5 font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
                    1. PENDAPATAN & BEBAN POKOK PENJUALAN
                  </td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-6 py-3 pl-10 text-slate-700 font-medium">Pendapatan Usaha (Gross Sales)</td>
                  <td className="px-6 py-3 text-right font-bold text-slate-900 font-mono">{formatIDR(pendapatan)}</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-6 py-3 pl-10 text-slate-700 font-medium">Harga Pokok Penjualan (HPP)</td>
                  <td className="px-6 py-3 text-right font-bold text-rose-600 font-mono">({formatIDR(hpp)})</td>
                </tr>
                <tr className="bg-slate-100/80 border-t-2 border-slate-200">
                  <td className="px-6 py-4 font-extrabold text-slate-900 uppercase tracking-wider text-[11px]">LABA KOTOR (GROSS PROFIT)</td>
                  <td className="px-6 py-4 text-right font-black text-slate-900 font-mono text-sm">{formatIDR(labaKotor)}</td>
                </tr>

                <tr className="bg-slate-50 border-t-4 border-white">
                  <td colSpan="2" className="px-6 py-3.5 font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">
                    2. BEBAN OPERASIONAL (OPEX)
                  </td>
                </tr>
                {rincianBeban && rincianBeban.length > 0 ? (
                  rincianBeban.map((beban, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-6 py-2.5 pl-10 text-slate-700">{beban.account_name}</td>
                      <td className="px-6 py-2.5 text-right font-medium text-slate-800 font-mono">{formatIDR(beban.total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-6 py-2.5 pl-10 text-slate-400 italic">Tidak ada rincian beban operasional</td>
                    <td className="px-6 py-2.5 text-right text-slate-400">-</td>
                  </tr>
                )}
                <tr className="border-b-2 border-slate-200">
                  <td className="px-6 py-3 pl-10 font-bold text-slate-700 text-right">Total Beban Operasional</td>
                  <td className="px-6 py-3 text-right font-bold text-rose-600 font-mono">({formatIDR(opex)})</td>
                </tr>

                <tr className={`border-t-2 border-slate-300 ${labaBersih >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}`}>
                  <td className="px-6 py-5 font-black text-sm text-slate-900 uppercase tracking-wider">LABA BERSIH (NET INCOME)</td>
                  <td className={`px-6 py-5 text-right font-black text-xl font-mono ${labaBersih >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
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
        <tr className="bg-slate-50">
          <td colSpan="2" className="px-6 py-3.5 font-extrabold text-slate-800 uppercase tracking-wider text-[11px]">{title}</td>
        </tr>
        {data && data.length > 0 ? (
          data.map((item, idx) => (
            <tr key={idx} className="hover:bg-slate-50/50">
              <td className="px-6 py-2.5 pl-10 text-slate-700">{item.account_name}</td>
              <td className="px-6 py-2.5 text-right font-medium text-slate-800 font-mono">{formatIDR(item.net)}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td className="px-6 py-2.5 pl-10 text-slate-400 italic">Tidak ada transaksi</td>
            <td className="px-6 py-2.5 text-right text-slate-400">-</td>
          </tr>
        )}
        <tr className={!isLast ? "border-b border-slate-200" : ""}>
          <td className="px-6 py-3 font-bold text-slate-600 pl-10 text-right">Net Kas dari {title.substring(17)}</td>
          <td className="px-6 py-3 text-right font-bold text-slate-900 font-mono border-t border-slate-200">{formatIDR(subtotal)}</td>
        </tr>
      </>
    );

    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 lg:p-8 shadow-xs space-y-6">
        <div className="text-center border-b border-slate-100 pb-5">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">
            Laporan Arus Kas (Cash Flow Statement)
          </h2>
          <p className="text-xs font-medium text-slate-500 mt-1">Periode: {startStr} s/d {endStr}</p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-2xs">
            <table className="w-full text-left border-collapse">
              <tbody className="text-xs divide-y divide-slate-100">
                
                <tr className="bg-slate-100/80">
                  <td className="px-6 py-4 font-black text-sm text-slate-900">SALDO AWAL KAS PERIODE INI</td>
                  <td className="px-6 py-4 text-right font-black text-sm text-slate-900 font-mono">{formatIDR(saldoAwal)}</td>
                </tr>

                {renderTableGroup("A. Arus Kas Dari Kegiatan Operasional", operasional, totalOperasional)}
                {renderTableGroup("B. Arus Kas Dari Kegiatan Investasi", investasi, totalInvestasi)}
                {renderTableGroup("C. Arus Kas Dari Kegiatan Pendanaan", pendanaan, totalPendanaan, true)}

                <tr className="bg-slate-100 border-t-2 border-slate-300">
                  <td className="px-6 py-4 font-extrabold text-slate-800">NET CASH FLOW (A + B + C)</td>
                  <td className={`px-6 py-4 text-right font-black font-mono ${netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {formatIDR(netCashFlow)}
                  </td>
                </tr>

                <tr className="bg-slate-900 text-white border-t-2 border-slate-900">
                  <td className="px-6 py-5 font-black text-base uppercase tracking-wider">SALDO AKHIR KAS</td>
                  <td className="px-6 py-5 text-right font-black text-xl text-emerald-400 font-mono">{formatIDR(saldoAkhir)}</td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailBukuKas = () => {
    if (!cashDetailData) return null;
    const { saldoAwal, details } = cashDetailData;

    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-wrap gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-emerald-600" />
              Detail Mutasi Buku Kas & Saldo Berjalan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Periode: {startStr} s/d {endStr}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-emerald-700 text-white text-[11px] uppercase tracking-wider font-extrabold border-b border-emerald-800">
                <th className="px-4 py-3.5 text-center w-14 border-r border-emerald-600">No</th>
                <th className="px-4 py-3.5 w-28 border-r border-emerald-600">Tanggal</th>
                <th className="px-5 py-3.5 w-52 border-r border-emerald-600">Kategori Akun</th>
                <th className="px-5 py-3.5 border-r border-emerald-600">Keterangan</th>
                <th className="px-5 py-3.5 text-right w-40 border-r border-emerald-600">Kas Masuk (Rp)</th>
                <th className="px-5 py-3.5 text-right w-40 border-r border-emerald-600">Kas Keluar (Rp)</th>
                <th className="px-5 py-3.5 text-right w-44">Saldo Berjalan (Rp)</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-200">
              {/* Baris Saldo Awal */}
              <tr className="bg-emerald-50/80 font-bold text-slate-900 border-b border-emerald-100">
                <td className="px-4 py-3 text-center text-slate-400">-</td>
                <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                  {new Date(startStr).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </td>
                <td className="px-5 py-3 font-extrabold text-emerald-900">Saldo Awal Kas</td>
                <td className="px-5 py-3 text-slate-500 italic">Modal kas awal periode simulasi</td>
                <td className="px-5 py-3 text-right font-extrabold text-emerald-700 font-mono">{formatIDR(saldoAwal)}</td>
                <td className="px-5 py-3 text-right text-slate-400 font-mono">Rp0</td>
                <td className="px-5 py-3 text-right font-black text-slate-900 font-mono">{formatIDR(saldoAwal)}</td>
              </tr>

              {/* Baris Transaksi Kronologis */}
              {details && details.length > 0 ? (
                details.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                    <td className="px-4 py-3 text-center text-slate-400 font-mono">{item.no}</td>
                    <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                      {new Date(item.transaction_date).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 font-bold text-slate-800">
                      {item.account_name}
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {item.description}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-emerald-600 font-mono whitespace-nowrap">
                      {item.cash_in > 0 ? formatIDR(item.cash_in) : 'Rp0'}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-rose-600 font-mono whitespace-nowrap">
                      {item.cash_out > 0 ? formatIDR(item.cash_out) : 'Rp0'}
                    </td>
                    <td className="px-5 py-3 text-right font-black text-slate-900 font-mono whitespace-nowrap">
                      {formatIDR(item.saldo_berjalan)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    Belum ada riwayat mutasi transaksi pada periode ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in-scale">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Laporan Keuangan & Mutasi Kas</h1>
        <p className="text-xs text-slate-500 mt-1">Analisis laporan Laba Rugi (Profit & Loss), Arus Kas (Cash Flow), dan Buku Besar Mutasi Saldo.</p>
      </div>

      {/* Navigasi Bulan */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between shadow-xs">
        <button 
          onClick={prevMonth}
          className="p-2 flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Bulan Sebelumnya</span>
        </button>
        
        <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
          {monthYearString}
        </h2>
        
        <button 
          onClick={nextMonth}
          className="p-2 flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <span className="hidden sm:inline">Bulan Selanjutnya</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      {/* Sliding Pill Tabs Navigation */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl max-w-xl mx-auto border border-slate-200/80">
        <button
          onClick={() => setActiveTab('laba-rugi')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'laba-rugi' 
              ? 'bg-white text-rose-700 shadow-xs font-bold' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Laba Rugi (Profit/Loss)
        </button>
        <button
          onClick={() => setActiveTab('arus-kas')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'arus-kas' 
              ? 'bg-white text-rose-700 shadow-xs font-bold' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Arus Kas (Cash Flow)
        </button>
        <button
          onClick={() => setActiveTab('detail')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'detail' 
              ? 'bg-white text-emerald-700 shadow-xs font-bold' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Buku Kas (Mutasi)
        </button>
      </div>

      {/* Report Content View */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-2xl border border-slate-200 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-rose-600 mb-3" />
            <p className="text-xs font-semibold">Mengkalkulasi laporan keuangan...</p>
          </div>
        ) : (
          <div className="animate-fade-in-scale">
            {activeTab === 'laba-rugi' && renderLabaRugi()}
            {activeTab === 'arus-kas' && renderArusKas()}
            {activeTab === 'detail' && renderDetailBukuKas()}
          </div>
        )}
      </div>
    </div>
  );
};

export default Laporan;
