import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Penjualan from './pages/Penjualan';
import Pembelian from './pages/Pembelian';
import Pengeluaran from './pages/Pengeluaran';
import Laporan from './pages/Laporan';
import MasterProduk from './pages/MasterProduk';
import MasterChannel from './pages/MasterChannel';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
        {/* Sidebar Layout */}
        <Sidebar />
        
        {/* Main Content Layout (Mendorong konten ke kanan agar tidak tertimpa sidebar fixed di desktop) */}
        <div className="flex-1 flex flex-col md:ml-64 overflow-hidden">
          <Navbar />
          
          {/* Area Konten Utama yang bisa di-scroll */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sales" element={<Penjualan />} />
              <Route path="/purchases" element={<Pembelian />} />
              <Route path="/expenses" element={<Pengeluaran />} />
              <Route path="/reports" element={<Laporan />} />
              <Route path="/products" element={<MasterProduk />} />
              <Route path="/channels" element={<MasterChannel />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
