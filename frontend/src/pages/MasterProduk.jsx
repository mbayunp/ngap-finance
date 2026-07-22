import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader2, Trash, Edit2, Package } from 'lucide-react';
import { formatInputRupiah, parseRupiahToNumber } from '../utils/formatRupiah';
import Swal from 'sweetalert2';

const MasterProduk = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    default_hpp: ''
  });

  const fetchProducts = async () => {
    setIsFetching(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products`);
      if (res.data && res.data.status === 'success') {
        setProducts(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      price: formatInputRupiah(Math.round(Number(product.price))),
      default_hpp: formatInputRupiah(Math.round(Number(product.default_hpp)))
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: '', price: '', default_hpp: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        price: parseRupiahToNumber(formData.price),
        default_hpp: parseRupiahToNumber(formData.default_hpp)
      };

      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${editingId}`, payload);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Produk berhasil diupdate!' });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, payload);
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Produk berhasil ditambahkan!' });
      }
      
      handleCancel();
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menyimpan produk.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Produk ini akan dihapus!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Ya, hapus!'
    });
    
    if (result.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        Swal.fire({ title: 'Terhapus!', text: 'Produk berhasil dihapus!', icon: 'success' });
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        Swal.fire({ title: 'Gagal!', text: 'Gagal menghapus produk.', icon: 'error' });
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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Master Data Produk</h1>
        <p className="text-xs text-slate-500 mt-1">Kelola katalog produk usaha, penetapan harga jual, dan HPP standar per item.</p>
      </div>

      {/* Form Input Produk */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center">
          <Package className="w-5 h-5 text-rose-600 mr-2" />
          {editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Nama Produk</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-900 text-xs font-medium outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Original"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Harga Jual (Rp)</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-900 text-xs font-mono font-medium outline-none transition-all"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: formatInputRupiah(e.target.value) })}
                placeholder="Rp. 0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">HPP Default (Rp)</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-slate-900 text-xs font-mono font-medium outline-none transition-all"
                value={formData.default_hpp}
                onChange={(e) => setFormData({ ...formData, default_hpp: formatInputRupiah(e.target.value) })}
                placeholder="Rp. 0"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 space-x-3">
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Menyimpan...' : (editingId ? 'Update Produk' : 'Simpan Produk Baru')}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel Produk */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900">Daftar Produk</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-3.5 w-20">ID</th>
                <th className="px-6 py-3.5">Nama Produk</th>
                <th className="px-6 py-3.5 text-right">Harga Jual</th>
                <th className="px-6 py-3.5 text-right">HPP Default</th>
                <th className="px-6 py-3.5 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              {isFetching ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-rose-600" />
                    Memuat data produk...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    Belum ada data produk.
                  </td>
                </tr>
              ) : (
                products.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-mono">#{row.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{row.name}</td>
                    <td className="px-6 py-4 text-right font-extrabold text-emerald-600 font-mono">{formatIDR(row.price)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-700 font-mono">{formatIDR(row.default_hpp)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(row)}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
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

export default MasterProduk;
