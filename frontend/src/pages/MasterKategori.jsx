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
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!'
    });
    
    if (result.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/coa/${id}`);
        Swal.fire('Terhapus!', 'Kategori berhasil dihapus!', 'success');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting COA:', error);
        const errMsg = error.response?.data?.message || 'Gagal menghapus kategori.';
        Swal.fire('Gagal!', errMsg, 'error');
      }
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Operasional': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Investasi': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Pendanaan': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Kategori (CoA)</h1>
          <p className="text-gray-500 mt-1">Kelola daftar akun kategori untuk Pemasukan dan Pengeluaran.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tambah Kategori
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs w-32">Kode Akun</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Nama Akun</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs w-48">Tipe Arus Kas</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-red-500" />
                    Memuat kategori...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <Tags className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    Belum ada data kategori.
                  </td>
                </tr>
              ) : (
                categories.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-500 font-mono">
                      {row.account_code}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {row.account_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(row.account_type)}`}>
                        {row.account_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => openModal(row)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {formData.id ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Akun Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Biaya Internet"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipe Arus Kas</label>
                <select
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                  value={formData.account_type}
                  onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                >
                  <option value="Operasional">Operasional (Biaya Pokok, Pendapatan, OPEX)</option>
                  <option value="Investasi">Investasi (Jual/Beli Aset)</option>
                  <option value="Pendanaan">Pendanaan (Modal, Hutang, Pinjaman)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSaving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
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
