import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Lock, User, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import Swal from 'sweetalert2';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'Silakan isi username dan password Anda.',
        confirmButtonColor: '#e11d48'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(username, password);

      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil',
          text: 'Selamat datang kembali di Ngap Finance!',
          timer: 1500,
          showConfirmButton: false
        });
        navigate('/', { replace: true });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal Login',
          text: result.message,
          confirmButtonColor: '#e11d48'
        });
      }
    } catch (err) {
      console.error('Login Error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Kesalahan Sistem',
        text: 'Terjadi masalah saat menghubungkan ke server.',
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterClick = async (e) => {
    e.preventDefault();
    const { value: inputPin } = await Swal.fire({
      title: 'PIN Keamanan Pendaftaran',
      text: 'Masukkan PIN Keamanan untuk membuka halaman registrasi akun:',
      input: 'password',
      inputPlaceholder: 'Masukkan 6 Digit PIN',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Buka Registrasi',
      cancelButtonText: 'Batal'
    });

    if (inputPin) {
      try {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-pin`, {
          pin: inputPin
        });

        if (response.data && response.data.status === 'success') {
          navigate('/register', { state: { pin: inputPin } });
        }
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'PIN Tidak Valid',
          text: err.response?.data?.message || 'PIN Keamanan yang Anda masukkan salah.',
          confirmButtonColor: '#e11d48'
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-rose-500 selection:text-white font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden animate-fade-in-scale">
        {/* Header Banner */}
        <div className="p-8 text-center bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
          <div className="flex justify-center mb-4">
            <img 
              src={`${import.meta.env.BASE_URL}logo.png`} 
              alt="Ngap Finance Logo" 
              className="h-12 w-auto drop-shadow-sm"
            />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Ngap<span className="text-rose-600 font-extrabold ml-1">Finance</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Masuk ke akun Anda untuk mengelola keuangan bisnis
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title={showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memproses Login...
              </>
            ) : (
              'Masuk ke Dashboard'
            )}
          </button>

          {/* Register Link Action */}
          <div className="text-center pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleRegisterClick}
              className="inline-flex items-center text-xs text-slate-600 hover:text-rose-600 font-semibold transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5 text-rose-500" />
              Belum punya akun? <span className="text-rose-600 underline ml-1 font-bold">Daftar Akun Baru</span>
            </button>
          </div>
        </form>

        {/* Footer Credit */}
        <div className="py-4 text-center border-t border-slate-100 bg-slate-50/50 text-[10px] text-slate-400 font-semibold">
          © 2026 Ngap Finance • Management Suite
        </div>
      </div>
    </div>
  );
};

export default Login;
