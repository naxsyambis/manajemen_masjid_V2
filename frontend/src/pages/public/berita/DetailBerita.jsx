import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, CalendarDays } from 'lucide-react';
import NavbarPublic from '../../../components/NavbarPublic';
import FooterPublic from '../../../components/FooterPublic';

const getImageUrl = (path) => {
  if (!path) return 'https://via.placeholder.com/800x400?text=No+Image';
  if (path.startsWith('http')) return path;
  if (path.startsWith('/uploads/')) return `http://localhost:3000${path}`;
  return `http://localhost:3000/uploads/berita/${path}`;
};

const getYoutubeEmbed = (url) => {
  if (!url) return null;

  try {
    const parsed = new URL(url);

    if (parsed.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
    }

    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }

    return null;
  } catch {
    return null;
  }
};

const DetailBerita = () => {
  const { id } = useParams();

  const [berita, setBerita] = useState(null);
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const intervalRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:3000/public/berita/${id}`);
        const data = await res.json();

        setBerita(data);

        let imgs = [];

        if (data.gambar) {
          const main = getImageUrl(data.gambar);
          imgs.push(main);
        }

        if (data.gambar_list?.length > 0) {
          data.gambar_list.forEach((g) => {
            const url = getImageUrl(g.path_gambar);
            if (!imgs.includes(url)) imgs.push(url);
          });
        }

        setImages(imgs);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (images.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(intervalRef.current);
  }, [images]);

  const nextSlide = () => setIndex((prev) => (prev + 1) % images.length);
  const prevSlide = () => setIndex((prev) =>
    prev === 0 ? images.length - 1 : prev - 1
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl">
        Memuat detail berita...
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
    <div className="bg-gray-50 min-h-screen overflow-x-hidden">
      <NavbarPublic />

      <main className="pt-32 pb-24">
        <div className="max-w-6xl mx-auto px-6 md:px-10">

          <div className="text-center mb-12 max-w-4xl mx-auto">

            <h1 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight">
              {berita.judul}
            </h1>

            <div className="flex justify-center gap-6 mt-5 text-sm text-gray-500 flex-wrap">

              <div className="flex items-center gap-2">
                <MapPin size={18} className="text-[#006227]" />
                <span className="font-medium text-gray-700">
                  {namaMasjid}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarDays size={18} className="text-[#006227]" />
                <span>
                  {new Date(berita.tanggal).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>

            </div>
          </div>

          {images.length > 0 && (
            <div className="relative mb-8">

              <img
                src={images[index]}
                className="w-full max-h-[550px] object-cover rounded-2xl shadow-md"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 text-white px-4 py-2 rounded-full hover:bg-black"
                  >
                    ‹
                  </button>

                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 text-white px-4 py-2 rounded-full hover:bg-black"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          )}

          {images.length > 1 && (
            <div className="flex gap-3 mb-10 flex-wrap justify-center items-center">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setIndex(i)}
                  className={`h-20 w-32 object-cover rounded-lg cursor-pointer transition ${
                    index === i
                      ? "ring-2 ring-green-600 scale-105"
                      : "opacity-80"
                  }`}
                />
              ))}
            </div>
          )}

          <div className="w-full text-gray-800 leading-relaxed text-justify mb-12 whitespace-pre-line text-[17px]">
            {berita.isi}
          </div>

          {youtubeEmbed && (
            <div className="w-full mb-12">
              <iframe
                src={youtubeEmbed}
                className="w-full h-[450px] rounded-2xl shadow-md"
                allowFullScreen
                title="Youtube"
              />
            </div>
          )}

          <div className="text-center">
            <Link
              to="/berita"
              className="px-8 py-4 bg-[#006227] text-white rounded-xl font-semibold hover:bg-[#004a1e]"
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