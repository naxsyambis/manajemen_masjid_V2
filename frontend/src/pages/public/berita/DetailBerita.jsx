import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavbarPublic from '../../../components/NavbarPublic';
import FooterPublic from '../../../components/FooterPublic';

const getImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/800x400';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads/')) return `http://localhost:3000${path}`;
  return `http://localhost:3000/uploads/berita/${path}`;
};

const getYoutubeEmbed = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  return match ? `https://www.youtube.com/embed/${match[1]}` : null;
};

const DetailBerita = () => {
  const { id } = useParams();

  const [berita, setBerita] = useState(null);
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🔥 FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`http://localhost:3000/public/berita/${id}`);
      const data = await res.json();

      setBerita(data);

      let imgArr = [];

      if (data.gambar) {
        imgArr.push(getImageUrl(data.gambar));
      }

      if (data.gambar_list?.length > 0) {
        data.gambar_list.forEach((g) => {
          imgArr.push(getImageUrl(g.path_gambar));
        });
      }

      setImages(imgArr);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  // 🔥 AUTO SLIDE
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!berita) return null;

  const namaMasjid =
    berita.masjid?.nama_masjid ||
    berita.user?.takmirs?.[0]?.masjid?.nama_masjid ||
    "Cabang Muhammadiyah Pundong";

  const youtubeEmbed = getYoutubeEmbed(berita.youtube_url);

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavbarPublic />

      <main className="pt-32 pb-20">
        <div className="max-w-5xl mx-auto px-6">

          {/* JUDUL */}
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {berita.judul}
          </h1>

          {/* INFO */}
          <div className="text-gray-500 mb-6">
            {namaMasjid} •{" "}
            {new Date(berita.tanggal).toLocaleDateString('id-ID')}
          </div>

          {/* 🔥 SLIDER */}
          {images.length > 0 && (
            <div className="relative mb-6">

              {/* IMAGE */}
              <img
                src={images[currentIndex]}
                className="w-full h-[450px] object-cover rounded-xl"
              />

              {/* LEFT BUTTON */}
              {images.length > 1 && (
                <button
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-2 rounded-full"
                >
                  ❮
                </button>
              )}

              {/* RIGHT BUTTON */}
              {images.length > 1 && (
                <button
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-2 rounded-full"
                >
                  ❯
                </button>
              )}

            </div>
          )}

          {/* 🔥 THUMBNAIL */}
          {images.length > 1 && (
            <div className="flex gap-2 mb-8 overflow-x-auto">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-20 w-28 object-cover rounded cursor-pointer ${
                    currentIndex === i ? 'ring-2 ring-green-600' : ''
                  }`}
                />
              ))}
            </div>
          )}

          {/* ISI */}
          <div className="text-gray-800 leading-relaxed text-justify mb-10 whitespace-pre-line">
            {berita.isi}
          </div>

          {/* 🔥 YOUTUBE (PALING BAWAH) */}
          {youtubeEmbed && (
            <div className="mb-10">
              <iframe
                src={youtubeEmbed}
                className="w-full h-[400px] rounded-xl"
                allowFullScreen
                title="Youtube"
              />
            </div>
          )}

          {/* BUTTON */}
          <div className="text-center mt-10">
            <Link
              to="/berita"
              className="px-8 py-4 bg-[#006227] text-white rounded-xl font-semibold"
            >
              Kembali ke Berita
            </Link>
          </div>

        </div>
      </main>

      <FooterPublic />
    </div>
  );
};

export default DetailBerita;