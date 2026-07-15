import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader2, ShoppingCart, Trash, Pencil } from 'lucide-react';

const Pembelian = () => {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    description: '',
    nominal: ''
  });
  
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/cashbook');
      if (res.data && res.data.status === 'success') {
        // Filter account_id === 4 (Pembelian Bahan Baku)
        const filteredData = res.data.data.filter(item => item.account_id === 4);
        setHistory(filteredData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nominal || formData.nominal <= 0) {
      alert('Nominal harus lebih besar dari 0');
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        transaction_date: formData.tanggal,
        account_id: 4,
        description: formData.description,
        cash_in: 0,
        cash_out: parseFloat(formData.nominal)
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/cashbook/${editingId}`, payload);
        alert('Data pembelian berhasil diupdate!');
      } else {
        await axios.post('http://localhost:5000/api/cashbook', payload);
        alert('Data pembelian berhasil disimpan!');
      }
      
      setFormData(prev => ({
        ...prev,
        description: '',
        nominal: ''
      }));
      setEditingId(null);
      
      fetchHistory();
    } catch (error) {
      console.error('Error saving data:', error);
      alert('Gagal menyimpan data pembelian!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (row) => {
    const dateStr = new Date(row.transaction_date).toISOString().split('T')[0];
    setFormData({
      tanggal: dateStr,
      description: row.description,
      nominal: row.cash_out
    });
    setEditingId(row.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus transaksi pembelian ini?')) {
      try {
        await axios.delete(`http://localhost:5000/api/cashbook/${id}`);
        alert('Data berhasil dihapus!');
        fetchHistory();
      } catch (error) {
        console.error('Error deleting data:', error);
        alert('Gagal menghapus data.');
      }
    }
  };

  const formatIDR = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pembelian Bahan Baku</h1>
        <p className="text-gray-500 mt-1">Input transaksi pembelian bahan baku & kemasan.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5 border-b border-gray-50 pb-3">Form Input Pembelian</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Transaksi</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Nominal (Rp)</label>
              <input
                type="number"
                required
                min="0"
                placeholder="Misal: 500000"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={formData.nominal}
                onChange={(e) => setFormData({ ...formData, nominal: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi Pembelian</label>
            <input
              type="text"
              required
              placeholder="Misal: Beli daging ayam 10kg, saus, dll"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-50">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : (editingId ? <Pencil className="w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />)}
              {isLoading ? (editingId ? 'Mengupdate...' : 'Menyimpan...') : (editingId ? 'Update Transaksi' : 'Simpan Pembelian')}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">Riwayat Pembelian</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs w-48">Tanggal</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Deskripsi</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right w-48">Nominal</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {isFetching ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-red-500" />
                    Memuat riwayat...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <ShoppingCart className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    Belum ada riwayat pembelian.
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">
                      {new Date(row.transaction_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {row.description}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-red-600">
                      -{formatIDR(row.cash_out)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(row)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Pembelian;
