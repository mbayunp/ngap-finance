import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader2, Trash, Plus, Minus, CheckCircle, Clock, ShoppingBag } from 'lucide-react';
import Swal from 'sweetalert2';

const Penjualan = () => {
  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    channel_id: '',
  });
  const [qty, setQty] = useState({});
  const [salesHistory, setSalesHistory] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const [channels, setChannels] = useState([]);
  const [products, setProducts] = useState([]);

  const fetchData = async () => {
    try {
      const [salesRes, channelsRes, productsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/sales`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/channels`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/products`)
      ]);
      
      if (salesRes.data && salesRes.data.status === 'success') {
        setSalesHistory(salesRes.data.data);
      }
      if (channelsRes.data && channelsRes.data.status === 'success') {
        setChannels(channelsRes.data.data);
        if (channelsRes.data.data.length > 0) {
          setFormData(prev => ({ ...prev, channel_id: channelsRes.data.data[0].id }));
        }
      }
      if (productsRes.data && productsRes.data.status === 'success') {
        setProducts(productsRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/sales`);
      if (res.data && res.data.status === 'success') {
        setSalesHistory(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching sales history:', error);
    }
  };

  const handleSelectAll = () => {
    if (salesHistory.length === 0) return;
    if (selectedIds.length === salesHistory.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(salesHistory.map(item => item.id));
    }
  };

  const handleSelectRow = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSettlement = async (id) => {
    try {
      const confirm = await Swal.fire({
        title: 'Cairkan Dana?',
        text: 'Tindakan ini akan mengubah status piutang menjadi Kas Masuk secara permanen.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#ef4444',
        confirmButtonText: 'Ya, Cairkan!',
        background: '#0f172a',
        color: '#f8fafc'
      });

      if (confirm.isConfirmed) {
        const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/sales/${id}/settle`);
        if (res.data.status === 'success') {
          Swal.fire({
            title: 'Berhasil', 
            text: 'Dana berhasil dicairkan dan masuk ke Buku Kas!', 
            icon: 'success',
            background: '#0f172a',
            color: '#f8fafc'
          });
          setSelectedIds(prev => prev.filter(item => item !== id));
          fetchHistory();
        }
      }
    } catch (error) {
      console.error('Error settling sale:', error);
      Swal.fire({
        title: 'Gagal', 
        text: 'Terjadi kesalahan saat memproses pencairan dana.', 
        icon: 'error',
        background: '#0f172a',
        color: '#f8fafc'
      });
    }
  };

  const handleBulkSettlement = async () => {
    if (selectedIds.length === 0) return;

    const pendingItems = salesHistory.filter(
      item => selectedIds.includes(item.id) && (item.status_pencairan === 'PENDING' || !item.status_pencairan)
    );

    if (pendingItems.length === 0) {
      Swal.fire({
        title: 'Perhatian', 
        text: 'Tidak ada transaksi berstatus PENDING dari item yang dipilih.', 
        icon: 'warning',
        background: '#0f172a',
        color: '#f8fafc'
      });
      return;
    }

    try {
      const confirm = await Swal.fire({
        title: `Cairkan ${pendingItems.length} Transaksi?`,
        text: `Tindakan ini akan memproses pencairan untuk ${pendingItems.length} transaksi berstatus PENDING ke Buku Kas.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#ef4444',
        confirmButtonText: 'Ya, Cairkan Semua!',
        background: '#0f172a',
        color: '#f8fafc'
      });

      if (confirm.isConfirmed) {
        const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/sales/bulk-settle`, {
          ids: selectedIds
        });
        if (res.data.status === 'success') {
          Swal.fire({
            title: 'Berhasil', 
            text: `${res.data.settledCount || pendingItems.length} transaksi berhasil dicairkan!`, 
            icon: 'success',
            background: '#0f172a',
            color: '#f8fafc'
          });
          setSelectedIds([]);
          fetchHistory();
        }
      }
    } catch (error) {
      console.error('Error bulk settling sales:', error);
      Swal.fire({
        title: 'Gagal', 
        text: 'Terjadi kesalahan saat memproses pencairan masal.', 
        icon: 'error',
        background: '#0f172a',
        color: '#f8fafc'
      });
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    const result = await Swal.fire({
      title: `Hapus ${selectedIds.length} Transaksi?`,
      text: `${selectedIds.length} transaksi penjualan yang dipilih akan dihapus secara permanen!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Ya, Hapus Semua!',
      background: '#0f172a',
      color: '#f8fafc'
    });

    if (result.isConfirmed) {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/sales/bulk-delete`, {
          ids: selectedIds
        });
        if (res.data.status === 'success') {
          Swal.fire({
            title: 'Terhapus!', 
            text: `${res.data.deletedCount || selectedIds.length} transaksi berhasil dihapus!`, 
            icon: 'success',
            background: '#0f172a',
            color: '#f8fafc'
          });
          setSelectedIds([]);
          fetchHistory();
        }
      } catch (error) {
        console.error('Error bulk deleting sales:', error);
        Swal.fire({
          title: 'Gagal!', 
          text: 'Gagal menghapus transaksi penjualan terpilih.', 
          icon: 'error',
          background: '#0f172a',
          color: '#f8fafc'
        });
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleQtyChange = (id, value) => {
    const parsed = parseInt(value, 10);
    setQty(prev => ({
      ...prev,
      [id]: isNaN(parsed) || parsed < 0 ? 0 : parsed
    }));
  };

  const handleIncrement = (id) => {
    setQty(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const handleDecrement = (id) => {
    setQty(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const items = products.map(p => ({
        product_id: p.id,
        productId: p.id,
        qty: qty[p.id] || 0,
        price: p.price,
        subtotal: (qty[p.id] || 0) * p.price
      })).filter(item => item.qty > 0);

      if (items.length === 0) {
        Swal.fire({ 
          icon: 'warning', 
          title: 'Perhatian', 
          text: 'Minimal masukkan jumlah untuk satu produk!',
          background: '#0f172a',
          color: '#f8fafc'
        });
        setIsLoading(false);
        return;
      }

      const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

      const payload = {
        transaction_date: formData.transaction_date,
        date: formData.transaction_date, 
        channel_id: parseInt(formData.channel_id, 10),
        totalAmount: totalAmount,
        items: items
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/api/sales`, payload);
      
      Swal.fire({ 
        icon: 'success', 
        title: 'Berhasil', 
        text: 'Transaksi berhasil disimpan!',
        background: '#0f172a',
        color: '#f8fafc'
      });
      
      setQty({});
      fetchHistory();
    } catch (error) {
      console.error('Error saving transaction:', error);
      Swal.fire({ 
        icon: 'error', 
        title: 'Gagal', 
        text: 'Gagal menyimpan transaksi. Pastikan backend berjalan dengan baik.',
        background: '#0f172a',
        color: '#f8fafc'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Transaksi penjualan ini akan dihapus!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Ya, hapus!',
      background: '#0f172a',
      color: '#f8fafc'
    });
    
    if (result.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/sales/${id}`);
        Swal.fire({
          title: 'Terhapus!', 
          text: 'Transaksi penjualan berhasil dihapus!', 
          icon: 'success',
          background: '#0f172a',
          color: '#f8fafc'
        });
        fetchHistory();
      } catch (error) {
        console.error('Error deleting sale:', error);
        Swal.fire({
          title: 'Gagal!', 
          text: 'Gagal menghapus transaksi penjualan.', 
          icon: 'error',
          background: '#0f172a',
          color: '#f8fafc'
        });
      }
    }
  };

  const formatIDR = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  const getChannelName = (id) => {
    const channel = channels.find(c => c.id === parseInt(id, 10));
    return channel ? channel.name : 'Unknown';
  };

  const totalCalculatedRevenue = products.reduce((sum, p) => sum + ((qty[p.id] || 0) * p.price), 0);

  return (
    <div className="space-y-8 animate-fade-in-scale">
      {/* Header */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Penjualan Harian</h1>
        <p className="text-xs text-slate-400 mt-1">Input transaksi penjualan baru dan kelola riwayat pencairan dana platform.</p>
      </div>

      {/* Form Input Penjualan */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 p-6 space-y-6 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-base font-bold text-white flex items-center">
            <ShoppingBag className="w-5 h-5 text-rose-500 mr-2" />
            Form Input Penjualan Baru
          </h2>
          {totalCalculatedRevenue > 0 && (
            <span className="text-xs font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
              Total: {formatIDR(totalCalculatedRevenue)}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Tanggal Transaksi</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-100 text-xs font-medium outline-none transition-all"
                value={formData.transaction_date}
                onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Channel Penjualan</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-100 text-xs font-medium outline-none transition-all cursor-pointer"
                value={formData.channel_id}
                onChange={(e) => setFormData({ ...formData, channel_id: e.target.value })}
              >
                {channels.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.type || 'Direct'})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Interactive Product Quantity Selection Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-3">Pilih Kuantitas Produk Terjual (Qty)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(p => {
                const currentQty = qty[p.id] || 0;
                const isSelected = currentQty > 0;

                return (
                  <div 
                    key={p.id} 
                    className={`p-4 rounded-xl border transition-all duration-200 ${
                      isSelected 
                        ? 'bg-slate-900 border-rose-500/60 shadow-lg shadow-rose-950/30' 
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-sm text-slate-100">{p.name}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{formatIDR(p.price)} / pcs</p>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                          {formatIDR(currentQty * p.price)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleDecrement(p.id)}
                        className="w-8 h-8 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        min="0"
                        className="w-16 bg-transparent text-center font-bold text-sm text-white focus:outline-none font-mono"
                        value={qty[p.id] || ''}
                        onChange={(e) => handleQtyChange(p.id, e.target.value)}
                        placeholder="0"
                      />
                      <button
                        type="button"
                        onClick={() => handleIncrement(p.id)}
                        className="w-8 h-8 rounded-md bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-6 py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/30 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Menyimpan Transaksi...' : 'Simpan Transaksi Penjualan'}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Riwayat Penjualan */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl backdrop-blur-md relative">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <h2 className="text-base font-bold text-white">Riwayat Transaksi Penjualan</h2>
            {salesHistory.length > 0 && (
              <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                Total {salesHistory.length}
              </span>
            )}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="px-4 py-3.5 text-center w-12">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-rose-500 rounded border-slate-700 bg-slate-950 cursor-pointer"
                    checked={salesHistory.length > 0 && selectedIds.length === salesHistory.length}
                    onChange={handleSelectAll}
                    title="Pilih Semua"
                  />
                </th>
                <th className="px-6 py-3.5">Tanggal</th>
                <th className="px-6 py-3.5">Channel</th>
                <th className="px-6 py-3.5 text-right">Pendapatan Kotor</th>
                <th className="px-6 py-3.5 text-right">Pendapatan Bersih</th>
                <th className="px-6 py-3.5 text-center">Status</th>
                <th className="px-6 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-800/60">
              {isFetching ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-rose-500" />
                    Memuat riwayat transaksi...
                  </td>
                </tr>
              ) : salesHistory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    Belum ada riwayat transaksi penjualan.
                  </td>
                </tr>
              ) : (
                salesHistory.map((row, index) => {
                  const date = row.transaction_date || row.sale_date || row.date;
                  const gross = row.gross_revenue || row.total_amount || 0;
                  const net = row.net_settlement || row.total_amount || 0;
                  const status = row.status_pencairan || 'PENDING';
                  const channel = row.channel_id ? getChannelName(row.channel_id) : '-';
                  const isSelected = selectedIds.includes(row.id);

                  return (
                    <tr
                      key={row.id || index}
                      className={`transition-colors ${isSelected ? 'bg-rose-500/10' : 'hover:bg-slate-800/40'}`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-rose-500 rounded border-slate-700 bg-slate-950 cursor-pointer"
                          checked={isSelected}
                          onChange={() => handleSelectRow(row.id)}
                        />
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-200 whitespace-nowrap">
                        {date ? new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-300">
                        {channel}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-400 font-mono">
                        {formatIDR(gross)}
                      </td>
                      <td className="px-6 py-4 text-right font-extrabold text-emerald-400 font-mono">
                        {formatIDR(net)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {status === 'PAID' || status === 'SETTLED' ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle className="w-3 h-3 mr-1 text-emerald-400" /> LUNAS
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3 mr-1 text-amber-400" /> PENDING
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center space-x-2">
                          {status === 'PENDING' && (
                            <button
                              onClick={() => handleSettlement(row.id)}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                              title="Cairkan Dana"
                            >
                              Cairkan
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(row.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Transaksi"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bulk-Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl border border-slate-700 shadow-2xl flex items-center space-x-4 animate-fade-in-scale">
          <span className="text-xs font-bold text-slate-300">
            {selectedIds.length} Transaksi Dipilih
          </span>
          <div className="h-4 w-px bg-slate-800" />
          <button
            type="button"
            onClick={handleBulkSettlement}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            Cairkan Dana Selected
          </button>
          <button
            type="button"
            onClick={handleBulkDelete}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center cursor-pointer"
          >
            <Trash className="w-3.5 h-3.5 mr-1" /> Hapus
          </button>
        </div>
      )}
    </div>
  );
};

export default Penjualan;
