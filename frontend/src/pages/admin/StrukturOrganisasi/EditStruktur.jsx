import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import SignaturePad from 'react-signature-canvas';
import {
  Upload, Save, User, Calendar, RefreshCcw, AlertCircle, X, AlertTriangle, 
  CheckCircle2, XCircle, Info, PenTool, Eraser, Edit3, PencilLine
} from 'lucide-react';
import DateSelect from '../../../components/DateSelect';

const AlertPopup = ({ alertData, onClose }) => {
  if (!alertData.show) return null;
  const isSuccess = alertData.type === 'success';
  const isError = alertData.type === 'error';
  const isWarning = alertData.type === 'warning';
  const Icon = isSuccess ? CheckCircle2 : isError ? XCircle : isWarning ? AlertTriangle : Info;
  const iconClass = isSuccess ? 'bg-green-100 text-green-600' : isError ? 'bg-red-100 text-red-600' : isWarning ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600';
  const buttonClass = isSuccess ? 'bg-green-600 hover:bg-green-700 text-white' : isError ? 'bg-red-600 hover:bg-red-700 text-white' : isWarning ? 'bg-mu-yellow hover:bg-yellow-400 text-mu-green' : 'bg-mu-green hover:bg-green-700 text-white';

  return createPortal(
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden animate-scaleIn">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 p-2 rounded-xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"><X size={20} /></button>
        <div className="p-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-5 ${iconClass}`}><Icon size={42} strokeWidth={2.5} /></div>
          <h3 className="text-2xl font-black text-gray-800 leading-tight">{alertData.title}</h3>
          <p className="mt-3 text-sm font-semibold text-gray-500 leading-relaxed whitespace-pre-line">{alertData.message}</p>
          <button type="button" onClick={onClose} className={`mt-8 w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 ${buttonClass}`}>{alertData.confirmText || 'Mengerti'}</button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const EditStruktur = () => {
  const [formData, setFormData] = useState({ nama: '', jabatan: '', periode_mulai: '', periode_selesai: '', foto: null, ttd: null });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const [ttdMode, setTtdMode] = useState('upload'); 
  const [fileTtd, setFileTtd] = useState(null);
  const [previewTtdUrl, setPreviewTtdUrl] = useState(null);
  const [isEditingTtd, setIsEditingTtd] = useState(false); 
  const sigPad = useRef(null);

  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [time, setTime] = useState(new Date());
  const [alertData, setAlertData] = useState({ show: false, type: 'info', title: '', message: '', confirmText: '', onConfirm: null });

  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem('token');
  const masjidId = localStorage.getItem('masjid_id');

  const showPopup = (config) => setAlertData({ ...config, show: true });
  const closePopup = () => { const callback = alertData.onConfirm; setAlertData({ show: false, type: 'info', title: '', message: '', confirmText: '', onConfirm: null }); if (callback) setTimeout(callback, 100); };
  const handleAuthError = (err) => { if (err.response && err.response.status === 401) { showPopup({ type: 'error', title: 'Sesi Berakhir', message: err.response.data.message || 'Sesi Anda telah berakhir.', confirmText: 'Login Ulang', onConfirm: () => { localStorage.removeItem('token'); window.location.href = '/login'; } }); return true; } return false; };

  const getFotoUrl = (foto) => { if (!foto) return null; if (foto.startsWith('http')) return foto; return `http://localhost:3000/uploads/kepengurusan/${foto}`; };
  const getTtdUrl = (ttd) => { if (!ttd) return null; if (ttd.startsWith('http')) return ttd; return `http://localhost:3000/uploads/ttd/${ttd}`; };

  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { fetchStruktur(); }, [id]);

  const fetchStruktur = async () => {
    try {
      setRefreshing(true); setError(null);
      const res = await axios.get('http://localhost:3000/takmir/struktur-organisasi', { params: { masjid_id: masjidId }, headers: { Authorization: `Bearer ${token}` } });
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      const selected = data.find((item) => String(item.struktur_id) === String(id));
      if (selected) {
        setFormData({ nama: selected.nama ?? '', jabatan: selected.jabatan ?? '', periode_mulai: selected.periode_mulai ?? '', periode_selesai: selected.periode_selesai ?? '', foto: selected.foto ?? null, ttd: selected.ttd ?? null });
        setIsEditingTtd(false);
      }
    } catch (err) {
      if (handleAuthError(err)) return;
    } finally { setPageLoading(false); setRefreshing(false); }
  };

  const handleFileChange = (e, type) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    
    if (type === 'foto') {
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    } else if (type === 'ttd') {
        setFileTtd(selectedFile);
        setPreviewTtdUrl(URL.createObjectURL(selectedFile));
        setIsEditingTtd(true); // Baru benar-benar pindah ke mode preview baru
    }
  };

  const clearCanvas = () => {
    sigPad.current?.clear();
    setFileTtd(null);
    setPreviewTtdUrl(null);
  };

  const handleCanvasEnd = () => {
    if (sigPad.current.isEmpty()) return;
    const canvas = sigPad.current.getCanvas();
    canvas.toBlob((blob) => {
      const file = new File([blob], `ttd_edit_${Date.now()}.png`, { type: "image/png" });
      setFileTtd(file);
      setPreviewTtdUrl(canvas.toDataURL("image/png"));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('nama', formData.nama);
    data.append('jabatan', formData.jabatan);
    data.append('periode_mulai', formData.periode_mulai);
    data.append('periode_selesai', formData.periode_selesai);
    if (file) data.append('foto', file);
    if (fileTtd) data.append('ttd', fileTtd);

    try {
      await axios.put(`http://localhost:3000/takmir/struktur-organisasi/${id}`, data, { headers: { Authorization: `Bearer ${token}` } });
      showPopup({ type: 'success', title: 'Berhasil', message: 'Data diperbarui', onConfirm: () => navigate('/admin/struktur-organisasi') });
    } catch (err) {
      handleAuthError(err);
    } finally { setLoading(false); }
  };

  return (
    <div className="edit-struktur min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 animate-fadeIn">
      <AlertPopup alertData={alertData} onClose={closePopup} />
      <div className="main-content p-8 h-full overflow-y-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter leading-none">Edit <span className="text-mu-green">Struktur</span></h1>
          </div>
          <button onClick={fetchStruktur} className="flex items-center gap-2 bg-white border border-gray-100 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 shadow-sm active:scale-95"><RefreshCcw size={14} /> Refresh</button>
        </div>

        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="p-10 lg:p-16">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                

                <div className="space-y-10">

                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Foto Pengurus</h3>
                    <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'foto')} className="hidden" id="foto-upload" />
                    <label htmlFor="foto-upload" className="block cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:bg-mu-green/5 transition-all">
                            {previewUrl ? <img src={previewUrl} className="w-24 h-24 object-cover rounded-xl mx-auto" /> : formData.foto ? <img src={getFotoUrl(formData.foto)} className="w-24 h-24 object-cover rounded-xl mx-auto" /> : <Upload size={32} className="mx-auto text-gray-400" />}
                        </div>
                    </label>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b-2 border-mu-green pb-3">
                        <h3 className="text-2xl font-bold text-gray-800">Tanda Tangan</h3>
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button type="button" onClick={() => setTtdMode('upload')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${ttdMode === 'upload' ? 'bg-white text-mu-green shadow-sm' : 'text-gray-400'}`}>Upload</button>
                            <button type="button" onClick={() => setTtdMode('canvas')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${ttdMode === 'canvas' ? 'bg-white text-mu-green shadow-sm' : 'text-gray-400'}`}>Canvas</button>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-[2rem] p-8 border border-gray-100">
                        {ttdMode === 'upload' ? (
                            <div className="space-y-4">
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'ttd')} className="hidden" id="ttd-upload" />
                                
                                {(formData.ttd || previewTtdUrl) && !isEditingTtd ? (
                                    <div 
                                        className="bg-white border-2 border-dashed border-gray-200 rounded-2xl h-[220px] flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer"
                                        onClick={() => document.getElementById('ttd-upload').click()}
                                    >
                                        <img src={previewTtdUrl || getTtdUrl(formData.ttd)} className="max-h-[160px] object-contain blur-[2px] opacity-40 group-hover:blur-[4px] transition-all" />
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/5">
                                            <div className="bg-white p-4 rounded-full shadow-lg text-mu-green transform group-hover:scale-110 transition-all">
                                                <Edit3 size={32} />
                                            </div>
                                            <p className="mt-4 text-[10px] font-black text-mu-green uppercase bg-white/90 px-4 py-2 rounded-full shadow-sm">Klik untuk Ganti File</p>
                                        </div>
                                    </div>
                                ) : (

                                    <label htmlFor="ttd-upload" className="block cursor-pointer">
                                        <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl h-[220px] flex flex-col items-center justify-center gap-4 hover:border-mu-green transition-all">
                                            {previewTtdUrl ? (
                                                <div className="relative group">
                                                    <img src={previewTtdUrl} className="max-h-[180px] object-contain p-4" />
                                                    <div className="absolute inset-0 bg-white/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                        <RefreshCcw size={24} className="text-mu-green" />
                                                    </div>
                                                </div>
                                            ) : (
                                                <><PenTool size={48} className="text-gray-300" /><p className="text-[10px] font-black text-gray-400 uppercase">Pilih File Baru</p></>
                                            )}
                                        </div>
                                    </label>
                                )}
                            </div>
                        ) : (

                            <div className="space-y-4">
                                <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl h-[220px] relative group overflow-hidden">
                                    
                                    {formData.ttd && !isEditingTtd ? (
                                        <div 
                                            className="absolute inset-0 z-10 flex flex-col items-center justify-center cursor-pointer"
                                            onClick={() => setIsEditingTtd(true)}
                                        >
                                            <img src={getTtdUrl(formData.ttd)} className="max-h-[160px] object-contain blur-[4px] opacity-30" />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40">
                                                <div className="bg-mu-green text-white p-4 rounded-full shadow-xl transform group-hover:scale-110 transition-all">
                                                    <PencilLine size={32} />
                                                </div>
                                                <p className="mt-4 text-[10px] font-black text-mu-green uppercase bg-white px-4 py-2 rounded-full shadow-md">Klik untuk Gambar Ulang</p>
                                            </div>
                                        </div>
                                    ) : null}

                                    <SignaturePad 
                                        ref={sigPad}
                                        onEnd={handleCanvasEnd}
                                        canvasProps={{ className: "w-full h-full cursor-crosshair" }}
                                    />
                                    
                                    <button type="button" onClick={clearCanvas} className="absolute top-4 right-4 z-20 p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                        <Eraser size={18} />
                                    </button>
                                </div>
                                <p className="text-[9px] text-gray-400 text-center font-bold uppercase italic">Coretan akan otomatis tersimpan sebagai file baru</p>
                            </div>
                        )}
                    </div>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-mu-green pb-3">Informasi Struktur</h3>
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 uppercase">Nama</label>
                        <input type="text" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 uppercase">Jabatan</label>
                        <input type="text" value={formData.jabatan} onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })} className="w-full p-4 border border-gray-300 rounded-xl bg-gray-50" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-700 uppercase">Periode Mulai</label>
                            <DateSelect value={formData.periode_mulai} onChange={(v) => setFormData({ ...formData, periode_mulai: v })} />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-bold text-gray-700 uppercase">Periode Selesai</label>
                            <DateSelect value={formData.periode_selesai} onChange={(v) => setFormData({ ...formData, periode_selesai: v })} />
                        </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-6 pt-12 mt-12 border-t">
                <button type="button" onClick={() => navigate('/admin/struktur-organisasi')} className="px-8 py-4 bg-gray-200 rounded-2xl font-semibold">Batal</button>
                <button type="submit" disabled={loading} className="px-8 py-4 bg-mu-green text-white rounded-2xl font-semibold shadow-xl hover:bg-green-700 disabled:opacity-50">
                    <Save size={20} className="inline mr-2" /> {loading ? 'Menyimpan...' : 'Update Struktur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditStruktur;