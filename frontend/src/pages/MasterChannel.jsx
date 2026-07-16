import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader2, Trash, Edit2 } from 'lucide-react';

const MasterChannel = () => {
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    commission_rate: '',
    settlement_lag_days: ''
  });

  const fetchChannels = async () => {
    setIsFetching(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/channels`);
      if (res.data && res.data.status === 'success') {
        setChannels(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      await fetchChannels();
    };
    initFetch();
  }, []);

  const handleEdit = (channel) => {
    setEditingId(channel.id);
    setFormData({
      name: channel.name,
      commission_rate: channel.commission_rate,
      settlement_lag_days: channel.settlement_lag_days
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', commission_rate: '', settlement_lag_days: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        commission_rate: parseFloat(formData.commission_rate),
        settlement_lag_days: parseInt(formData.settlement_lag_days, 10)
      };

      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/channels/${editingId}`, payload);
        alert('Channel berhasil diupdate!');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/channels`, payload);
        alert('Channel berhasil ditambahkan!');
      }
      
      handleCancel();
      fetchChannels();
    } catch (error) {
      console.error('Error saving channel:', error);
      alert('Gagal menyimpan channel.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Yakin ingin menghapus channel ini?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/channels/${id}`);
        alert('Channel berhasil dihapus!');
        fetchChannels();
      } catch (error) {
        console.error('Error deleting channel:', error);
        alert('Gagal menghapus channel. Mungkin channel ini sedang digunakan dalam transaksi.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Master Data Channel</h1>
        <p className="text-gray-500 mt-1">Kelola daftar channel penjualan, komisi, dan lag settlement.</p>
      </div>

      {/* Form Input */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5 border-b border-gray-50 pb-3">
          {editingId ? 'Edit Channel' : 'Tambah Channel Baru'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Channel</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: GoFood"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Komisi (Rate)</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                max="1"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={formData.commission_rate}
                onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                placeholder="0.2 untuk 20%"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Settlement Lag (Hari)</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={formData.settlement_lag_days}
                onChange={(e) => setFormData({ ...formData, settlement_lag_days: e.target.value })}
                placeholder="1"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-50 space-x-3">
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Batal
              </button>
            )}
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
              {isLoading ? 'Menyimpan...' : (editingId ? 'Update Channel' : 'Simpan Channel')}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Daftar Channel</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">ID</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Nama Channel</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Komisi Rate</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Settlement Lag</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {isFetching ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-red-500" />
                    Memuat data...
                  </td>
                </tr>
              ) : channels.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="text-gray-400 mb-2 text-4xl">🏢</div>
                    Belum ada data channel.
                  </td>
                </tr>
              ) : (
                channels.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 text-gray-600">{row.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{row.name}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{(row.commission_rate * 100).toFixed(1)}%</td>
                    <td className="px-6 py-4 text-right text-gray-600">{row.settlement_lag_days} Hari</td>
                    <td className="px-6 py-4 flex justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(row)}
                        className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
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

export default MasterChannel;
