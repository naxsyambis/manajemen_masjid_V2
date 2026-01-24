import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, MapPin, ShieldCheck, PenTool, Trash2, Mail, Building, MessageCircle, HelpCircle } from 'lucide-react';

const Settings = () => {
  const [profile, setProfile] = useState({ nama: '', email: '' });
  const [masjid, setMasjid] = useState({ nama_masjid: '', alamat: '' });
  const [previewTtd, setPreviewTtd] = useState(null);
  const token = localStorage.getItem('token');

  const adminWA = "6281234567890"; 
  const pesanWA = encodeURIComponent(`Halo Admin SIM Masjid, saya Takmir ${masjid.nama_masjid || ""} ingin bertanya...`);

  const fetchSemuaData = async () => {
    if (!token) return;
    try {
      const resUser = await axios.get('http://localhost:3000/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfile({
        nama: resUser.data.nama,
        email: resUser.data.email
      });

      if (resUser.data.foto_tanda_tangan) {
        setPreviewTtd(resUser.data.foto_tanda_tangan);
        localStorage.setItem('ttdImage', resUser.data.foto_tanda_tangan);
      } else {
        setPreviewTtd(null);
        localStorage.removeItem('ttdImage');
      }

      const masjidId = resUser.data.masjid_id;
      if (masjidId) {
        const resMasjid = await axios.get(`http://localhost:3000/public/masjid/${masjidId}`);
        const dataDb = resMasjid.data.masjid;
        setMasjid({
          nama_masjid: dataDb.nama_masjid,
          alamat: dataDb.alamat
        });
        localStorage.setItem('namaMasjid', dataDb.nama_masjid);
      }
    } catch (err) {
      console.error("Gagal sinkron data database:", err);
    }
  };

  useEffect(() => {
    fetchSemuaData();
  }, []);

// friska habis ngerubah ini 
  const handleSaveTtd = async (base64Img) => {
    try {
      await axios.put(
        "http://localhost:3000/auth/profile/ttd",
        {
          foto_tanda_tangan: base64Img
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      fetchSemuaData();
    } catch (err) {
      alert("Gagal menyimpan tanda tangan.");
    }
  };

// friska habis ngerubah ini 
  const handleDeleteTtd = async () => {
    if (window.confirm("Hapus berkas tanda tangan?")) {
      try {
        setPreviewTtd(null);
        await axios.put(
          "http://localhost:3000/auth/profile/ttd",
          {
            foto_tanda_tangan: null
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        localStorage.removeItem("ttdImage");
      } catch (err) {
        alert("Gagal menghapus.");
      }
    }
  };


  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn p-4 pb-20">
      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 transition-all hover:shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex items-center gap-6 p-4 bg-gray-50/50 rounded-3xl border border-gray-100 group">
            <div className="w-16 h-16 bg-mu-green text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-green-100 transition-transform group-hover:scale-105">
              {profile.nama ? profile.nama.charAt(0) : '?'}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">Takmir Aktif</span>
              <h3 className="font-black text-gray-800 uppercase tracking-tight text-xl truncate">{profile.nama || "..." }</h3>
            </div>
          </div>

          <div className="flex items-center gap-6 p-4 bg-gray-50/50 rounded-3xl border border-gray-100 group">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-mu-green shadow-sm border border-gray-100 transition-transform group-hover:scale-105">
              <Mail size={28} />
            </div>
            <div className="overflow-hidden">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-1">Kontak Login</span>
              <p className="text-sm text-gray-500 font-mono italic truncate">{profile.email || "..."}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex-1 group transition-all hover:shadow-md">
            <div className="p-10 space-y-8 h-full flex flex-col justify-center">
              <div className="flex items-center gap-3 text-mu-green/40">
                <Building size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Informasi Lokasi</span>
              </div>
              
              <div className="relative">
                <div className="absolute -left-4 top-0 w-1 h-full bg-mu-green rounded-full opacity-20"></div>
                <div className="bg-mu-green/[0.03] p-8 rounded-[2rem] border border-mu-green/5 space-y-2">
                  <label className="text-[10px] font-black text-mu-green/40 uppercase tracking-widest block">Nama Masjid Resmi</label>
                  <p className="text-4xl font-black text-mu-green uppercase leading-none tracking-tighter">
                    {masjid.nama_masjid || "Syncing..."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 px-4">
                <div className="w-14 h-14 bg-mu-yellow/10 rounded-2xl flex items-center justify-center text-mu-green shadow-inner shrink-0 ring-4 ring-mu-yellow/5">
                  <MapPin size={28} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-300 uppercase tracking-widest block">Alamat Operasional</label>
                  <p className="text-base text-gray-500 font-semibold italic leading-relaxed">{masjid.alamat || "Data tidak ditemukan."}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-mu-green to-green-900 p-8 rounded-[2.5rem] shadow-xl text-white space-y-6 relative overflow-hidden group transition-all hover:scale-[1.01]">
             <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md"><HelpCircle size={22} className="text-mu-yellow" /></div>
                   <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Pusat Bantuan</span>
                </div>
                <div className="space-y-1">
                   <h4 className="text-lg font-black leading-tight">Butuh Bantuan Teknis?</h4>
                   <p className="text-[9px] opacity-70 font-medium italic">Hubungi Pengurus Ranting melalui WhatsApp resmi.</p>
                </div>
                <button 
                  onClick={() => window.open(`https://wa.me/${adminWA}?text=${pesanWA}`, '_blank')}
                  className="w-full bg-white text-mu-green py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-mu-yellow hover:text-mu-green transition-all shadow-lg active:scale-95"
                >
                   <MessageCircle size={18} /> Chat Admin WA
                </button>
             </div>
             <div className="absolute -right-6 -bottom-6 text-white/10 rotate-12 group-hover:rotate-0 transition-transform duration-500">
                <ShieldCheck size={180} />
             </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm h-full flex flex-col justify-between transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3 text-mu-green">
                <PenTool size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Upload Tanda Tangan</span>
              </div>
              {previewTtd && (
                <button 
                  onClick={handleDeleteTtd}
                  className="text-red-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
            
            <div className="flex-1 flex flex-col justify-center">
              <div className="relative group aspect-square max-w-full mx-auto w-full border-2 border-dashed border-gray-100 rounded-[2rem] flex flex-col items-center justify-center bg-gray-50/30 overflow-hidden mb-8 transition-colors hover:bg-gray-50/50">
                {previewTtd ? (
                  <img src={previewTtd} alt="TTD" className="max-h-[85%] object-contain animate-fadeIn drop-shadow-xl" />
                ) : (
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-sm mx-auto text-gray-200 ring-8 ring-gray-50">
                      <PenTool size={40} />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Belum ada TTD</p>
                      <p className="text-[8px] text-gray-400 italic">Klik tombol di bawah untuk unggah</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <label className="block w-full bg-mu-yellow text-mu-green py-5 rounded-2xl text-xs font-black hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-50 cursor-pointer text-center uppercase tracking-widest active:scale-[0.98]">
              {previewTtd ? "Ganti Berkas TTD" : "Unggah Berkas TTD"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    handleSaveTtd(reader.result);
                  };
                  reader.readAsDataURL(file);
                }
              }} />
            </label>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;