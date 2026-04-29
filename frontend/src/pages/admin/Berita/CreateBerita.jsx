import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { X, Save, FileText, ImagePlus } from "lucide-react";

const CreateBerita = () => {
  const [judul, setJudul] = useState("");
  const [isi, setIsi] = useState("");

  const [images, setImages] = useState([null, null, null, null, null]);
  const [preview, setPreview] = useState([null, null, null, null, null]);

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleChange = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const newImages = [...images];
    const newPreview = [...preview];

    newImages[index] = file;
    newPreview[index] = URL.createObjectURL(file);

    setImages(newImages);
    setPreview(newPreview);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreview = [...preview];

    newImages[index] = null;
    newPreview[index] = null;

    setImages(newImages);
    setPreview(newPreview);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!judul || !isi) {
      alert("Judul & isi wajib diisi");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("judul", judul);
      formData.append("isi", isi);

      images.forEach((img) => {
        if (img) formData.append("gambar", img);
      });

      await axios.post("http://localhost:3000/takmir/berita", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      alert("Berhasil tambah berita");
      navigate("/admin/berita");

    } catch {
      alert("Gagal tambah berita");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-10 bg-[#fdfdfd] animate-fadeIn">

      {/* HEADER */}
      <div className="flex items-center gap-4 border-b pb-6">
        <div className="p-3 bg-gradient-to-tr from-mu-green to-green-500 text-white rounded-2xl shadow-xl -rotate-3">
          <FileText size={26} />
        </div>

        <h1 className="text-4xl font-black text-gray-800 uppercase tracking-tighter">
          Tambah Berita
        </h1>
      </div>

      {/* CARD */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-[3rem] shadow-2xl border p-10 space-y-10"
      >

        {/* JUDUL */}
        <div>
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
            Judul
          </label>
          <input
            type="text"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full mt-2 px-4 py-4 bg-gray-50 rounded-2xl shadow-inner outline-none font-bold"
          />
        </div>

        {/* ISI */}
        <div>
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
            Isi
          </label>
          <textarea
            value={isi}
            onChange={(e) => setIsi(e.target.value)}
            rows={6}
            className="w-full mt-2 px-4 py-4 bg-gray-50 rounded-2xl shadow-inner outline-none font-bold"
          />
        </div>

        {/* FOTO */}
        <div className="space-y-4">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
            Gambar (Max 5)
          </label>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {preview.map((item, i) => (
              <div key={i} className="space-y-2">

                <p className="text-[10px] font-black text-gray-400 uppercase">
                  Foto {i + 1}
                </p>

                <label className="block rounded-2xl border-2 border-dashed p-4 cursor-pointer hover:bg-gray-50 transition">

                  {item ? (
                    <div className="relative group">
                      <img
                        src={item}
                        className="w-full h-28 object-cover rounded-xl shadow"
                      />

                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-28 text-gray-300">
                      <ImagePlus size={22} />
                      <span className="text-[10px] mt-1 font-bold">
                        Upload
                      </span>
                    </div>
                  )}

                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleChange(e, i)}
                  />
                </label>

              </div>
            ))}
          </div>
        </div>

        {/* BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-8 py-4 bg-mu-green text-white rounded-2xl shadow-xl hover:-translate-y-1 transition font-black"
          >
            <Save size={18} />
            {loading ? "Menyimpan..." : "Simpan"}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateBerita;