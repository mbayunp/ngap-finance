import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, User, Eye, EyeOff, Loader2, UserPlus, ArrowLeft, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // PIN passed from PIN verification modal/state or prompt
  const [pin, setPin] = useState(location.state?.pin || '');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim() || !username.trim() || !password || !confirmPassword) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'Semua kolom formulir pendaftaran wajib diisi.',
        confirmButtonColor: '#e11d48'
      });
      return;
    }

    if (username.trim().length < 3) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'Username minimal terdiri dari 3 karakter.',
        confirmButtonColor: '#e11d48'
      });
      return;
    }

    if (password.length < 6) {
      Swal.fire({
        icon: 'warning',
        title: 'Perhatian',
        text: 'Password minimal terdiri dari 6 karakter.',
        confirmButtonColor: '#e11d48'
      });
      return;
    }

    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Tidak Cocok',
        text: 'Konfirmasi password tidak sesuai dengan password yang Anda masukkan.',
        confirmButtonColor: '#e11d48'
      });
      return;
    }

    if (!pin) {
      // Prompt for Security PIN if missing
      const { value: inputPin } = await Swal.fire({
        title: 'PIN Keamanan Pendaftaran',
        text: 'Masukkan PIN Keamanan untuk memproses registrasi akun baru:',
        input: 'password',
        inputPlaceholder: 'Masukkan 6 Digit PIN',
        showCancelButton: true,
        confirmButtonColor: '#e11d48',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Verifikasi PIN'
      });

      if (!inputPin) return;
      setPin(inputPin);
      processSubmit(inputPin);
    } else {
      processSubmit(pin);
    }
  };

  const processSubmit = async (activePin) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        pin: activePin,
        name: name.trim(),
        username: username.trim(),
        password
      });

      if (response.data && response.data.status === 'success') {
        await Swal.fire({
          icon: 'success',
          title: 'Registrasi Berhasil',
          text: response.data.message || 'Akun Anda berhasil dibuat. Silakan login.',
          confirmButtonColor: '#e11d48'
        });
        navigate('/login', { replace: true });
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Gagal mendaftarkan akun baru.';
      Swal.fire({
        icon: 'error',
        title: 'Gagal Registrasi',
        text: message,
        confirmButtonColor: '#e11d48'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 selection:bg-rose-500 selection:text-white font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden animate-fade-in-scale">
        {/* Header Banner */}
        <div className="p-8 text-center bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 relative">
          <Link
            to="/login"
            className="absolute top-6 left-6 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center text-xs font-semibold"
            title="Kembali ke Login"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="flex justify-center mb-3">
            <img 
              src={`${import.meta.env.BASE_URL}logo.png`} 
              alt="Ngap Finance Logo" 
              className="h-10 w-auto drop-shadow-sm"
            />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Registrasi Akun Baru
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Buat akun pengguna baru untuk mengelola aplikasi Ngap Finance
          </p>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleRegister} className="p-8 space-y-4">
          {/* Full Name Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserPlus className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Username Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                placeholder="Masukkan username unik"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
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
                placeholder="Minimal 6 karakter"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
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

          {/* Confirm Password Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Konfirmasi Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi password"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Security PIN Badge indicator */}
          <div className="pt-1">
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" />
              PIN Keamanan Terverifikasi
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mendaftarkan Akun...
              </>
            ) : (
              'Daftarkan Akun Baru'
            )}
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="text-xs text-slate-500 hover:text-rose-600 font-semibold transition-colors"
            >
              Sudah punya akun? <span className="text-rose-600 underline">Login di sini</span>
            </Link>
          </div>
        </form>

        {/* Footer Credit */}
        <div className="py-3 text-center border-t border-slate-100 bg-slate-50/50 text-[10px] text-slate-400 font-semibold">
          © 2026 Ngap Finance • Security PIN Protected
        </div>
      </div>
    </div>
  );
};

export default Register;
