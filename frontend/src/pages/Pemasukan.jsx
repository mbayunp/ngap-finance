import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader2, CreditCard, Trash, Pencil, PlusCircle } from 'lucide-react';
import { formatInputRupiah, parseRupiahToNumber } from '../utils/formatRupiah';
import Swal from 'sweetalert2';

const Pemasukan = () => {
  const [formData, setFormData] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    accountId: '', 
    description: '',
    nominal: ''
  });
  
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/coa`);
      if (res.data && res.data.status === 'success') {
        const nonSalesCoa = res.data.data.filter(item => 
          !['4-1000', '4-1001', '4-1002', '4-2000'].includes(item.account_code)
        );
        const finalCategories = nonSalesCoa.length > 0 ? nonSalesCoa : res.data.data;
        setCategories(finalCategories);
        
        if (finalCategories.length > 0 && !formData.accountId) {
          setFormData(prev => ({ ...prev, accountId: finalCategories[0].id }));
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/incomes`);
      if (res.data && res.data.status === 'success') {
        setHistory(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    const initFetch = async () => {
      await fetchCategories();
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
        account_id: parseInt(formData.accountId, 10),
        description: formData.description,
        cash_in: nominalValue
      };

      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/incomes/${editingId}`, payload);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data pemasukan berhasil diupdate!' });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/incomes`, payload);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data pemasukan berhasil disimpan!' });
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
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menyimpan data pemasukan!' });
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
      nominal: formatInputRupiah(Math.round(Number(row.cash_in)))
    });
    setEditingId(row.id);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data pemasukan ini akan dihapus!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Ya, hapus!'
    });
    
    if (result.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/incomes/${id}`);
        Swal.fire({ title: 'Terhapus!', text: 'Data berhasil dihapus!', icon: 'success' });
        fetchHistory();
      } catch (error) {
        console.error('Error deleting data:', error);
        Swal.fire({ title: 'Gagal!', text: 'Gagal menghapus data.', icon: 'error' });
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

  return (
    <div className="space-y-8 animate-fade-in-scale">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Pemasukan Lain-lain</h1>
        <p className="text-xs text-slate-500 mt-1">Input transaksi pemasukan kas di luar penjualan (contoh: Setoran Modal, Pinjaman Bank, Investasi).</p>
      </div>

      {/* Form Input Pemasukan */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center">
          <PlusCircle className="w-5 h-5 text-emerald-600 mr-2" />
          {editingId ? 'Edit Transaksi Pemasukan' : 'Form Input Pemasukan Kas'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Tanggal Transaksi</label>
              <input
                type="date"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 text-xs font-medium outline-none transition-all"
                value={formData.tanggal}
                onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Kategori Pemasukan</label>
              <select
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 text-xs font-medium outline-none transition-all cursor-pointer"
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.account_code ? `${c.account_code} - ${c.account_name}` : c.account_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Total Nominal (Rp)</label>
              <input
                type="text"
                required
                placeholder="Misal: Rp. 10.000.000"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 text-xs font-mono font-medium outline-none transition-all"
                value={formData.nominal}
                onChange={(e) => setFormData({ ...formData, nominal: formatInputRupiah(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Deskripsi Lengkap</label>
              <input
                type="text"
                required
                placeholder="Misal: Setoran modal awal usaha"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 text-xs font-medium outline-none transition-all"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 space-x-3">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData(prev => ({ ...prev, description: '', nominal: '' }));
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : (editingId ? <Pencil className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />)}
              {isLoading ? (editingId ? 'Mengupdate...' : 'Menyimpan...') : (editingId ? 'Update Transaksi' : 'Simpan Pemasukan')}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Riwayat Pemasukan */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900">Riwayat Pemasukan Kas Lain-lain</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-3.5 w-48">Tanggal</th>
                <th className="px-6 py-3.5">Kategori</th>
                <th className="px-6 py-3.5">Deskripsi</th>
                <th className="px-6 py-3.5 text-right w-48">Nominal</th>
                <th className="px-6 py-3.5 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              {isFetching ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-emerald-600" />
                    Memuat riwayat...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    Belum ada riwayat pemasukan.
                  </td>
                </tr>
              ) : (
                history.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                      {new Date(row.transaction_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {row.account_name || 'INCOME'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {row.description}
                    </td>
                    <td className="px-6 py-4 text-right font-extrabold text-emerald-600 font-mono">
                      +{formatIDR(row.cash_in)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(row)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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

export default Pemasukan;
