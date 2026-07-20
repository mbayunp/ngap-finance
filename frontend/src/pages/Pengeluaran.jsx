import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader2, CreditCard, Trash, Pencil } from 'lucide-react';
import { formatInputRupiah, parseRupiahToNumber } from '../utils/formatRupiah';
import Swal from 'sweetalert2';

const Pengeluaran = () => {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    accountId: 5, // Default ID 5: Sewa
    description: '',
    nominal: ''
  });
  
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const categories = [
    { id: 5, name: 'Sewa' },
    { id: 6, name: 'Gaji & Upah' },
    { id: 7, name: 'Listrik & Air' },
    { id: 8, name: 'Pemasaran / Gas / Lainnya' }
  ];

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/cashbook`);
      if (res.data && res.data.status === 'success') {
        // Filter account_id antara 5 sampai 8
        const filteredData = res.data.data.filter(item => item.account_id >= 5 && item.account_id <= 8);
        setHistory(filteredData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      await fetchHistory();
    };
    initFetch();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nominalValue = parseRupiahToNumber(formData.nominal);
    if (!formData.nominal || nominalValue <= 0) {
      Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Nominal harus lebih besar dari 0' });
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        transaction_date: formData.tanggal,
        account_id: parseInt(formData.accountId),
        description: formData.description,
        cash_in: 0,
        cash_out: nominalValue
      };

      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/cashbook/${editingId}`, payload);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data pengeluaran berhasil diupdate!' });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/cashbook`, payload);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data pengeluaran berhasil disimpan!' });
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
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menyimpan data pengeluaran!' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (row) => {
    const dateStr = new Date(row.transaction_date).toISOString().split('T')[0];
    setFormData({
      tanggal: dateStr,
      accountId: row.account_id,
      description: row.description,
      nominal: formatInputRupiah(Math.round(Number(row.cash_out)))
    });
    setEditingId(row.id);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data pengeluaran ini akan dihapus!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!'
    });
    
    if (result.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/cashbook/${id}`);
        Swal.fire('Terhapus!', 'Data berhasil dihapus!', 'success');
        fetchHistory();
      } catch (error) {
        console.error('Error deleting data:', error);
        Swal.fire('Gagal!', 'Gagal menghapus data.', 'error');
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
        <h1 className="text-2xl font-bold text-gray-900">Pengeluaran Operasional</h1>
        <p className="text-gray-500 mt-1">Input transaksi pengeluaran operasional (OPEX) bulanan atau harian.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5 border-b border-gray-50 pb-3">Form Input Pengeluaran</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori Pengeluaran</label>
              <select
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Nominal (Rp)</label>
              <input
                type="text"
                required
                placeholder="Misal: Rp. 1.500.000"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={formData.nominal}
                onChange={(e) => setFormData({ ...formData, nominal: formatInputRupiah(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi Lengkap</label>
              <input
                type="text"
                required
                placeholder="Misal: Bayar sewa ruko bulan ini"
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-50">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : (editingId ? <Pencil className="w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />)}
              {isLoading ? (editingId ? 'Mengupdate...' : 'Menyimpan...') : (editingId ? 'Update Transaksi' : 'Simpan Pengeluaran')}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">Riwayat Pengeluaran Operasional</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs w-48">Tanggal</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Kategori</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Deskripsi</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right w-48">Nominal</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {isFetching ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-red-500" />
                    Memuat riwayat...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <CreditCard className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    Belum ada riwayat pengeluaran.
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap">
                      {new Date(row.transaction_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {row.account_name || 'OPEX'}
                      </span>
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

export default Pengeluaran;
