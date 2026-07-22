import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, Plus, Pencil, Trash, X, Save, Tags } from 'lucide-react';
import Swal from 'sweetalert2';

const MasterKategori = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    account_name: '',
    account_type: 'Operasional'
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/coa`);
      if (res.data && res.data.status === 'success') {
        setCategories(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching COA:', error);
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal mengambil data kategori.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openModal = (category = null) => {
    if (category) {
      setFormData({
        id: category.id,
        account_name: category.account_name,
        account_type: category.account_type
      });
    } else {
      setFormData({
        id: null,
        account_name: '',
        account_type: 'Operasional'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ id: null, account_name: '', account_type: 'Operasional' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.account_name.trim()) {
      Swal.fire({ icon: 'warning', title: 'Perhatian', text: 'Nama Akun wajib diisi' });
      return;
    }

    setIsSaving(true);
    try {
      if (formData.id) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/coa/${formData.id}`, formData);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Kategori berhasil diupdate!' });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/coa`, formData);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Kategori baru berhasil ditambahkan!' });
      }
      closeModal();
      fetchCategories();
    } catch (error) {
      console.error('Error saving COA:', error);
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menyimpan kategori!' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Kategori ini akan dihapus. Jika kategori ini sudah memiliki transaksi, penghapusan mungkin akan gagal.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Ya, hapus!'
    });
    
    if (result.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/coa/${id}`);
        Swal.fire({ title: 'Terhapus!', text: 'Kategori berhasil dihapus!', icon: 'success' });
        fetchCategories();
      } catch (error) {
        console.error('Error deleting COA:', error);
        const errMsg = error.response?.data?.message || 'Gagal menghapus kategori.';
        Swal.fire({ title: 'Gagal!', text: errMsg, icon: 'error' });
      }
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Operasional': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Investasi': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Pendanaan': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-scale">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Master Kategori (Chart of Accounts)</h1>
          <p className="text-xs text-slate-500 mt-1">Kelola struktur akun kategori kas untuk klasifikasi Pemasukan & Pengeluaran.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kategori Baru
        </button>
      </div>

      {/* Tabel Kategori */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-3.5 w-36">Kode Akun</th>
                <th className="px-6 py-3.5">Nama Akun</th>
                <th className="px-6 py-3.5 w-48">Tipe Arus Kas</th>
                <th className="px-6 py-3.5 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-rose-600" />
                    Memuat kategori...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                    <Tags className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    Belum ada data kategori.
                  </td>
                </tr>
              ) : (
                categories.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">
                      {row.account_code}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {row.account_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold border ${getTypeColor(row.account_type)}`}>
                        {row.account_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => openModal(row)}
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

      {/* Modal Form Kategori */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in-scale">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">
                {formData.id ? 'Edit Kategori Akun' : 'Tambah Kategori Baru'}
              </h3>
              <button 
                onClick={closeModal} 
                className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Nama Akun Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Biaya Internet & Utility"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-900 text-xs font-medium outline-none transition-all"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Tipe Arus Kas</label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-900 text-xs font-medium outline-none transition-all cursor-pointer"
                  value={formData.account_type}
                  onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                >
                  <option value="Operasional">Operasional (Beban Pokok, Pendapatan, OPEX)</option>
                  <option value="Investasi">Investasi (Pembelian/Penjualan Aset)</option>
                  <option value="Pendanaan">Pendanaan (Modal, Hutang, Pinjaman)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  {isSaving ? 'Menyimpan...' : 'Simpan Kategori'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterKategori;
