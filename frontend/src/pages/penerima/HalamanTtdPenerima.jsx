import React, { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import { Eraser, CheckCircle2, Check, PenTool, AlertCircle } from 'lucide-react';

import { generateKwitansiPDF } from '../../utils/generatePDFinvoice'; 

const HalamanTtdPenerima = () => {
  const { id } = useParams();
  const sigCanvas = useRef({});
  
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const clearCanvas = () => {
    sigCanvas.current.clear();
    setErrorMsg("");
  };

  const handleSimpan = async () => {
    if (sigCanvas.current.isEmpty()) {
      setErrorMsg("Tanda tangan tidak boleh kosong. Silakan coret di dalam kotak.");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg("");

    const base64Ttd = sigCanvas.current.getCanvas().toDataURL('image/png');
    
    try {
      const res = await axios.put(`http://localhost:3000/public/keuangan/${id}/ttd`, {
        ttd_penerima: base64Ttd
      });
      
      const dataTransaksi = res.data.data;

      if (dataTransaksi.masjid_id) {
        localStorage.setItem("masjid_id", dataTransaksi.masjid_id);
      }

      await generateKwitansiPDF(
        {
          id: `TX-${dataTransaksi.keuangan_id}`,
          tanggal: dataTransaksi.tanggal,
          donatur: dataTransaksi.nama_donatur || 'Penerima',
          kategori: 'Pengeluaran Umum',
          nominal: parseFloat(dataTransaksi.jumlah),
          keterangan: dataTransaksi.deskripsi || '-',
          jenis: 'PENGELUARAN'
        },
        null,
        base64Ttd
      );

      localStorage.removeItem("masjid_id");
      setIsSaved(true);
    } catch (error) {
      console.error(error);
      setErrorMsg("Gagal memproses kuitansi. Pastikan koneksi internet stabil.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSaved) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl text-center w-full max-w-sm animate-scaleIn border border-gray-100">
          <div className="w-24 h-24 bg-green-50 text-mu-green rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Check size={48} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight">Terima Kasih!</h2>
          <p className="text-gray-500 font-semibold mt-3 text-sm leading-relaxed">
            Tanda tangan Anda telah berhasil direkam dan kuitansi digital Anda telah diunduh.
          </p>
          <p className="text-xs text-gray-400 mt-8 font-bold tracking-widest uppercase">
            Silakan tutup halaman ini
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn">
        
        <div className="p-8 bg-[#0f5c35] text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <PenTool size={100} />
          </div>
          <div className="relative z-10">
            <h1 className="text-xl font-black uppercase tracking-widest">Tanda Tangan</h1>
            <p className="text-sm font-semibold opacity-90 mt-2 bg-black/20 inline-block px-4 py-1.5 rounded-full">
              Kuitansi #{id}
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 font-bold">
              Gunakan jari Anda untuk tanda tangan di dalam kotak putih di bawah ini.
            </p>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-3xl overflow-hidden bg-gray-50 cursor-crosshair relative shadow-inner">
            <SignatureCanvas 
              ref={sigCanvas}
              penColor="black"
              canvasProps={{ 
                className: 'signature-canvas w-full h-64 md:h-72 touch-none'
              }}
            />
            <div className="absolute bottom-8 left-8 right-8 border-b-2 border-gray-200 pointer-events-none"></div>
          </div>

          {errorMsg && (
            <div className="mt-4 p-4 bg-red-50 rounded-2xl flex items-start gap-3 border border-red-100 animate-fadeIn">
              <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-red-600 leading-relaxed">{errorMsg}</p>
            </div>
          )}
        </div>

        <div className="p-6 md:p-8 pt-0 flex gap-4">
          <button 
            onClick={clearCanvas} 
            disabled={isLoading}
            className="flex-1 py-4 rounded-2xl bg-gray-100 text-gray-500 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-200 hover:text-red-500 transition-all active:scale-95 disabled:opacity-50"
          >
            <Eraser size={18} /> Ulang
          </button>
          
          <button 
            onClick={handleSimpan} 
            disabled={isLoading}
            className="flex-[2] py-4 rounded-2xl bg-[#0f5c35] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-green-100 flex items-center justify-center gap-2 hover:bg-green-800 transition-all active:scale-95 disabled:opacity-70"
          >
            {isLoading ? (
              <span className="animate-pulse">Menyimpan...</span>
            ) : (
              <>
                <CheckCircle2 size={18} /> Simpan TTD
              </>
            )}
          </button>
        </div>

      </div>
      
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-8 text-center">
        Sistem Administrasi Digital Masjid
      </p>
    </div>
  );
};

export default HalamanTtdPenerima;