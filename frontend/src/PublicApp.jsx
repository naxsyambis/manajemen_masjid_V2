// src/PublicApp.jsx
import React from 'react';
import { useRoutes } from 'react-router-dom';

import Home from './pages/public/home/Home';
import ListKegiatan from './pages/public/kegiatan/ListKegiatan';
import ListProgram from './pages/public/program/ListProgram';
import ListBerita from './pages/public/berita/ListBerita';
import DetailBerita from './pages/public/berita/DetailBerita';
import Masjid from './pages/public/masjid/Masjid'; // detail masjid
import Kepengurusan from './pages/public/kepengurusan/Kepengurusan';
import MapMasjid from './pages/public/lokasi/MapMasjid'; // map
import IsiKegiatan from './pages/public/kegiatan/IsiKegiatan'; 
import IsiProgram from './pages/public/program/IsiProgram';

const PublicApp = () => {
  const routes = useRoutes([
    { path: '/', element: <Home /> },

    { path: '/kegiatan', element: <ListKegiatan /> },
    { path: '/program', element: <ListProgram /> },
    { path: '/berita', element: <ListBerita /> },
    { path: '/berita/:id', element: <DetailBerita /> },
    { path: '/masjid', element: <MapMasjid /> },
    { path: '/masjid/:id', element: <Masjid /> },
    { path: '/kepengurusan', element: <Kepengurusan /> },
    { path: '/kegiatan/:id', element: <IsiKegiatan /> }, 
    { path: '/program/:id', element: <IsiProgram /> },

    // 404
    {
      path: '*',
      element: (
        <div className="text-center py-20 font-sans">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            404 - Page Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The page you are looking for does not exist.
          </p>
          <a
            href="/"
            className="px-6 py-3 bg-[#006227] text-white rounded-xl font-semibold hover:bg-[#004a1e] transition-all"
          >
            Go Back Home
          </a>
        </div>
      ),
    },
  ]);

  return routes;
};

export default PublicApp;