import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader2, Trash, Edit2, Radio } from 'lucide-react';
import Swal from 'sweetalert2';

const MasterChannel = () => {
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Direct',
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
    fetchChannels();
  }, []);

  const handleEdit = (channel) => {
    setEditingId(channel.id);
    setFormData({
      name: channel.name,
      type: channel.type || 'Direct',
      commission_rate: channel.commission_rate,
      settlement_lag_days: channel.settlement_lag_days
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', type: 'Direct', commission_rate: '', settlement_lag_days: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        commission_rate: parseFloat(formData.commission_rate),
        settlement_lag_days: parseInt(formData.settlement_lag_days, 10)
      };

      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/channels/${editingId}`, payload);
        Swal.fire({ 
          icon: 'success', 
          title: 'Berhasil', 
          text: 'Channel berhasil diupdate!',
          background: '#0f172a',
          color: '#f8fafc'
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/channels`, payload);
        Swal.fire({ 
          icon: 'success', 
          title: 'Berhasil', 
          text: 'Channel berhasil ditambahkan!',
          background: '#0f172a',
          color: '#f8fafc'
        });
      }
      
      handleCancel();
      fetchChannels();
    } catch (error) {
      console.error('Error saving channel:', error);
      Swal.fire({ 
        icon: 'error', 
        title: 'Gagal', 
        text: 'Gagal menyimpan channel.',
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
      text: "Channel ini akan dihapus!",
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
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/channels/${id}`);
        Swal.fire({ 
          title: 'Terhapus!', 
          text: 'Channel berhasil dihapus!', 
          icon: 'success',
          background: '#0f172a',
          color: '#f8fafc'
        });
        fetchChannels();
      } catch (error) {
        console.error('Error deleting channel:', error);
        Swal.fire({ 
          title: 'Gagal!', 
          text: 'Gagal menghapus channel. Mungkin channel ini sedang digunakan dalam transaksi.', 
          icon: 'error',
          background: '#0f172a',
          color: '#f8fafc'
        });
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-scale">
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 backdrop-blur-md">
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Master Data Channel Penjualan</h1>
        <p className="text-xs text-slate-400 mt-1">Kelola daftar channel penjualan (Shopee, GoFood, Offline, dsb), potongan komisi, dan lag settlement.</p>
      </div>

      {/* Form Input Channel */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 p-6 space-y-6 shadow-2xl backdrop-blur-md">
        <h2 className="text-base font-bold text-white border-b border-slate-800 pb-4 flex items-center">
          <Radio className="w-5 h-5 text-rose-500 mr-2" />
          {editingId ? 'Edit Channel' : 'Tambah Channel Baru'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Nama Channel</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-100 text-xs font-medium outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: GoFood"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Tipe Channel</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-100 text-xs font-medium outline-none transition-all cursor-pointer"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Direct">Direct (Kas Langsung)</option>
                <option value="Platform">Platform (Memiliki Piutang & Settlement)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Komisi (Rate Decimal)</label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                max="1"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-100 text-xs font-mono font-medium outline-none transition-all"
                value={formData.commission_rate}
                onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                placeholder="0.2 untuk 20%"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Settlement Lag (Hari)</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-100 text-xs font-mono font-medium outline-none transition-all"
                value={formData.settlement_lag_days}
                onChange={(e) => setFormData({ ...formData, settlement_lag_days: e.target.value })}
                placeholder="1"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800 space-x-3">
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
            )}
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
              {isLoading ? 'Menyimpan...' : (editingId ? 'Update Channel' : 'Simpan Channel Baru')}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Channel */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl backdrop-blur-md">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/40">
          <h2 className="text-base font-bold text-white">Daftar Channel</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-800">
                <th className="px-6 py-3.5 w-20">ID</th>
                <th className="px-6 py-3.5">Nama Channel</th>
                <th className="px-6 py-3.5">Tipe Channel</th>
                <th className="px-6 py-3.5 text-right">Komisi Rate</th>
                <th className="px-6 py-3.5 text-right">Settlement Lag</th>
                <th className="px-6 py-3.5 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-800/60">
              {isFetching ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-rose-500" />
                    Memuat data...
                  </td>
                </tr>
              ) : channels.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                    Belum ada data channel.
                  </td>
                </tr>
              ) : (
                channels.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 text-slate-500 font-mono">#{row.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-200">{row.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border ${
                        row.type === 'Platform' 
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' 
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {row.type || 'Direct'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-rose-400 font-mono">{(row.commission_rate * 100).toFixed(1)}%</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-300 font-mono">{row.settlement_lag_days} Hari</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(row)}
                          className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
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

export default MasterChannel;
