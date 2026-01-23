import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  FileDown, 
  Printer, 
  Pencil, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Database,
  Clock,
  Calendar as CalendarIcon,
  Hash,
  User,
  FileText,
  ArrowRightLeft
} from 'lucide-react';
import Button from '../../components/Button';
import { formatRupiah } from '../../utils/formatCurrency';
import { formatTanggal } from '../../utils/formatDate';
import { generateKwitansiPDF } from '../../utils/generatePDF';
import ModalRiwayat from './ModalRiwayat';

const Riwayat = () => {
  const [transaksi, setTransaksi] = useState([]);
  const [filteredTransaksi, setFilteredTransaksi] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('semua');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTransaksi, setSelectedTransaksi] = useState(null);

  const token = localStorage.getItem('token');

  const fetchData = async () => {
    try {
      setLoading(true);
      const resCat = await axios.get('http://localhost:3000/takmir/kategori-keuangan', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(resCat.data);

      const resTrans = await axios.get('http://localhost:3000/takmir/keuangan', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = resTrans.data.reverse();
      setTransaksi(data);
      setFilteredTransaksi(data);
    } catch (err) {
      console.error("Gagal ambil data riwayat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  useEffect(() => {
    let results = transaksi.filter(item =>
      item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.keuangan_id.toString().includes(searchTerm)
    );

    if (filterType === 'masuk') {
      results = results.filter(item => item.jumlah > 0);
    } else if (filterType === 'keluar') {
      results = results.filter(item => item.jumlah < 0);
    }
    setFilteredTransaksi(results);
  }, [searchTerm, filterType, transaksi]);

  const handleEditClick = (item) => {
    setSelectedTransaksi(item);
    setShowEditModal(true);
  };

  const handleCetak = (item) => {
    const catName = categories.find(c => c.kategori_id === item.kategori_id)?.nama_kategori || 'Umum';
    const savedTtd = localStorage.getItem('ttdImage');
    
    let donaturName = "Hamba Allah";
    let cleanDeskripsi = item.deskripsi;

    if (item.deskripsi.includes(' - Donatur: ')) {
      const parts = item.deskripsi.split(' - Donatur: ');
      cleanDeskripsi = parts[0];
      donaturName = parts[1];
    }

    generateKwitansiPDF({
      id: `TX-${item.keuangan_id}`,
      tanggal: formatTanggal(item.tanggal),
      donatur: donaturName,
      kategori: catName,
      nominal: parseFloat(item.jumlah),
      keterangan: cleanDeskripsi
    }, savedTtd);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-mu-green">
            <Database size={28} className="animate-pulse" />
            <h2 className="text-3xl font-black uppercase tracking-tighter text-gray-800">Riwayat Transaksi</h2>
          </div>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest ml-1 flex items-center gap-2">
            <Clock size={14} /> Kelola, edit, dan cetak riwayat transaksi keuangan masjid Anda.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => window.print()} className="flex items-center gap-2 bg-white border-2 border-gray-500 !text-gray-900 rounded-2xl shadow-sm hover:bg-gray-50 transition-all">
            <FileDown size={18} /> Export Laporan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-mu-green transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Cari ID atau Deskripsi..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-[2rem] outline-none shadow-sm font-medium text-sm focus:ring-2 focus:ring-mu-green/10 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-gray-100 p-1.5 rounded-[2rem] gap-2 border border-gray-200/50">
          {['semua', 'masuk', 'keluar'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`flex-1 py-2.5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${
                filterType === type ? 'bg-white text-mu-green shadow-md' : 'text-gray-400'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed min-w-[1200px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] uppercase tracking-[0.2em] text-gray-900 font-black">
                <th className="p-6 w-[70px] text-center"><Hash size={14} className="inline"/></th>
                <th className="p-6 w-[170px]"><CalendarIcon size={14} className="inline mr-1"/> Tanggal</th>
                <th className="p-6 w-[130px] text-center"><ArrowRightLeft size={14} className="inline mr-1"/> Jenis</th>
                <th className="p-6 w-[140px] text-center">Kategori</th>
                <th className="p-6 w-[150px]"><User size={14} className="inline mr-1"/> Nama</th>
                <th className="p-6 w-[180px]">Arus Kas</th>
                <th className="p-6 w-[200px]"><FileText size={14} className="inline mr-1"/> Deskripsi</th>
                <th className="p-6 w-[130px] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700 font-bold">
              {loading ? (
                <tr><td colSpan="8" className="p-20 text-center uppercase tracking-widest text-[10px] font-bold text-gray-400 animate-pulse">Memproses Data...</td></tr>
              ) : filteredTransaksi.length === 0 ? (
                <tr><td colSpan="8" className="p-20 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest italic">Data Tidak Ditemukan</td></tr>
              ) : filteredTransaksi.map((item) => {
                const isMasuk = item.jumlah > 0;
                const cat = categories.find(c => c.kategori_id === item.kategori_id);
                
                let donaturDisplay = "Hamba Allah";
                let descDisplay = item.deskripsi;
                if (item.deskripsi.includes(' - Donatur: ')) {
                    const parts = item.deskripsi.split(' - Donatur: ');
                    descDisplay = parts[0];
                    donaturDisplay = parts[1];
                }

                return (
                  <tr key={item.keuangan_id} className="group hover:bg-mu-green/[0.02] transition-colors">
                    <td className="p-6 text-center">
                       <span className="text-[10px] font-mono font-bold text-gray-400">#{item.keuangan_id}</span>
                    </td>
                    <td className="p-6 whitespace-nowrap text-gray-900 text-sm tracking-tight italic">
                       {formatTanggal(item.tanggal)}
                    </td>
                    <td className="p-6 text-center">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isMasuk ? 'text-green-600' : 'text-red-600'}`}>
                        {isMasuk ? 'Pemasukan' : 'Pengeluaran'}
                      </span>
                    </td>
                    <td className="p-6 text-center text-gray-900 uppercase text-[10px]">
                      <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider border bg-gray-50 border-gray-100`}>
                        {cat?.nama_kategori || 'Umum'}
                      </span>
                    </td>
                    <td className="p-6">
                       <span className="text-xs font-black text-gray-900 capitalize truncate block">{donaturDisplay}</span>
                    </td>
                    <td className="p-6 whitespace-nowrap font-black text-base">
                      <div className={`flex items-center gap-2 ${isMasuk ? 'text-mu-green' : 'text-red-600'}`}>
                        {isMasuk ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
                        {formatRupiah(Math.abs(item.jumlah))}
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-xs text-gray-500 font-medium italic truncate" title={descDisplay}>{descDisplay}</p>
                    </td>
                    <td className="p-6 text-center">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleCetak(item)} 
                          title="Cetak Kwitansi PDF"
                          className="p-2.5 bg-mu-green/10 hover:bg-mu-green hover:text-white rounded-xl text-mu-green transition-all shadow-sm transform active:scale-90"
                        >
                          <Printer size={16} />
                        </button>
                        <button 
                          onClick={() => handleEditClick(item)} 
                          title="Edit Transaksi"
                          className="p-2.5 bg-yellow-100 hover:bg-yellow-500 hover:text-white rounded-xl text-yellow-600 transition-all shadow-sm transform active:scale-90"
                        >
                          <Pencil size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      <ModalRiwayat 
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={fetchData}
        data={selectedTransaksi}
        categories={categories}
      />

      <div className="flex justify-center items-center gap-4 text-gray-300 py-4">
        <div className="h-[1px] w-12 bg-gray-100"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">Integrated Management System v3.0</p>
        <div className="h-[1px] w-12 bg-gray-100"></div>
      </div>
    </div>
  );
};

export default Riwayat;