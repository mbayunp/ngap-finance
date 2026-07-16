import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader2, Trash } from 'lucide-react';

const Penjualan = () => {
  // 1. State Management
  const [formData, setFormData] = useState({
    transaction_date: new Date().toISOString().split('T')[0],
    channel_id: '',
  });
  const [qty, setQty] = useState({});
  const [salesHistory, setSalesHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // 2. Data Master (Dinamis)
  const [channels, setChannels] = useState([]);
  const [products, setProducts] = useState([]);

  // Fetch Data Master & Riwayat
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

  useEffect(() => {
    const initFetch = async () => {
      await fetchData();
    };
    initFetch();
  }, []);

  const handleQtyChange = (id, value) => {
    setQty(prev => ({
      ...prev,
      [id]: parseInt(value) || 0
    }));
  };

  // 3. Handle Submit Transaksi Baru
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Menyusun items sesuai request
      const items = products.map(p => ({
        product_id: p.id,
        productId: p.id, // Fallback property jika API salesController membutuhkannya
        qty: qty[p.id] || 0,
        price: p.price,
        subtotal: (qty[p.id] || 0) * p.price
      })).filter(item => item.qty > 0);

      if (items.length === 0) {
        alert('Minimal masukkan jumlah untuk satu produk!');
        setIsLoading(false);
        return;
      }

      const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

      // Payload yang dikirim ke Backend
      // Kita campur formatnya agar kompatibel dengan salesController.js saat ini dan instruksi baru
      const payload = {
        transaction_date: formData.transaction_date,
        date: formData.transaction_date, 
        channel_id: parseInt(formData.channel_id),
        totalAmount: totalAmount,
        items: items
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/api/sales`, payload);
      
      alert('Transaksi berhasil disimpan!');
      
      // Reset form qty
      setQty({});
      
      // Refresh tabel riwayat
      fetchHistory();
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Gagal menyimpan transaksi. Pastikan backend berjalan dengan baik.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus transaksi penjualan ini?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/sales/${id}`);
        alert('Transaksi penjualan berhasil dihapus!');
        fetchHistory();
      } catch (error) {
        console.error('Error deleting sale:', error);
        alert('Gagal menghapus transaksi penjualan.');
      }
    }
  };

  // Format Rupiah
  const formatIDR = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getChannelName = (id) => {
    const channel = channels.find(c => c.id === parseInt(id));
    return channel ? channel.name : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Penjualan Harian</h1>
        <p className="text-gray-500 mt-1">Input transaksi penjualan baru dan pantau riwayat penjualan Anda.</p>
      </div>

      {/* Bagian Atas: Form Input Penjualan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5 border-b border-gray-50 pb-3">Form Input Penjualan</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Transaksi</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={formData.transaction_date}
                onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Channel Penjualan</label>
              <select
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={formData.channel_id}
                onChange={(e) => setFormData({ ...formData, channel_id: e.target.value })}
              >
                {channels.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Jumlah Terjual (Qty)</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {products.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm hover:border-red-300 transition-colors">
                  <div>
                    <p className="font-bold text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-500">{formatIDR(p.price)} / pcs</p>
                  </div>
                  <input
                    type="number"
                    min="0"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-center font-semibold text-gray-700"
                    value={qty[p.id] || ''}
                    onChange={(e) => handleQtyChange(p.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-50">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              {isLoading ? 'Menyimpan...' : 'Simpan Transaksi'}
            </button>
          </div>
        </form>
      </div>

      {/* Bagian Bawah: Tabel Riwayat Penjualan */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Riwayat Penjualan</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Tanggal</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Channel</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Pendapatan Kotor</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Pendapatan Bersih</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-center">Status</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {isFetching ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-red-500" />
                    Memuat riwayat transaksi...
                  </td>
                </tr>
              ) : salesHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <div className="text-gray-400 mb-2 text-4xl">📝</div>
                    Belum ada riwayat transaksi penjualan.
                  </td>
                </tr>
              ) : (
                salesHistory.map((row, index) => {
                  // Fallback menyesuaikan skema backend jika berbeda antara tabel sales atau daily_sales
                  const date = row.transaction_date || row.sale_date || row.date;
                  const gross = row.gross_revenue || row.total_amount || 0;
                  const net = row.net_settlement || row.total_amount || 0;
                  const status = row.status_pencairan || 'PENDING';
                  const channel = row.channel_id ? getChannelName(row.channel_id) : '-';

                  return (
                    <tr key={index} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">
                        {date ? new Date(date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">
                        {channel}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-600">
                        {formatIDR(gross)}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-red-600">
                        {formatIDR(net)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          status === 'PAID' || status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Transaksi"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Penjualan;
