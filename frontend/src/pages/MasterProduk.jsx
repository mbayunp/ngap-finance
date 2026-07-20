import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Loader2, Trash, Edit2 } from 'lucide-react';
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
    const initFetch = async () => {
      await fetchProducts();
    };
    initFetch();
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
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, hapus!'
    });
    
    if (result.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        Swal.fire('Terhapus!', 'Produk berhasil dihapus!', 'success');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        Swal.fire('Gagal!', 'Gagal menghapus produk. Mungkin produk ini sedang digunakan dalam transaksi.', 'error');
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Master Data Produk</h1>
        <p className="text-gray-500 mt-1">Kelola daftar produk, harga, dan HPP default.</p>
      </div>

      {/* Form Input */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-5 border-b border-gray-50 pb-3">
          {editingId ? 'Edit Produk' : 'Tambah Produk Baru'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Produk</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Original"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga Jual</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: formatInputRupiah(e.target.value) })}
                placeholder="Rp. 0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">HPP Default</label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
                value={formData.default_hpp}
                onChange={(e) => setFormData({ ...formData, default_hpp: formatInputRupiah(e.target.value) })}
                placeholder="Rp. 0"
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
              {isLoading ? 'Menyimpan...' : (editingId ? 'Update Produk' : 'Simpan Produk')}
            </button>
          </div>
        </form>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Daftar Produk</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-500 text-sm border-b border-gray-100">
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">ID</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Nama Produk</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Harga Jual</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">HPP Default</th>
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
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="text-gray-400 mb-2 text-4xl">📦</div>
                    Belum ada data produk.
                  </td>
                </tr>
              ) : (
                products.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 text-gray-600">{row.id}</td>
                    <td className="px-6 py-4 font-medium text-gray-800">{row.name}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{formatIDR(row.price)}</td>
                    <td className="px-6 py-4 text-right text-gray-600">{formatIDR(row.default_hpp)}</td>
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

export default MasterProduk;
